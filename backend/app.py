import os
import re
from datetime import datetime
from dotenv import load_dotenv

import google.generativeai as genai
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (JWTManager, create_access_token,
                                get_jwt_identity, jwt_required, decode_token)
from flask_socketio import SocketIO, emit
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import check_password_hash, generate_password_hash

# --- INITIAL SETUP ---
load_dotenv()
app = Flask(__name__)

# --- CONFIGURATION ---
PROD_DATABASE_URL = os.getenv('DATABASE_URL')
if PROD_DATABASE_URL:
    print("--- 🚀 RUNNING IN PRODUCTION MODE (using Postgres) ---")
    app.config['SQLALCHEMY_DATABASE_URI'] = PROD_DATABASE_URL.replace("postgres://", "postgresql://", 1)
else:
    print("--- 💻 RUNNING IN DEVELOPMENT MODE (using sqlite) ---")
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///medhelps.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "default-super-secret-key-change-me")
app.config['SECRET_KEY'] = os.getenv("SOCKETIO_SECRET_KEY", "another-secret-key-for-socketio")


# --- Gemini API Configuration ---
try:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in .env file")
    genai.configure(api_key=api_key)
    gemini_model = genai.GenerativeModel('gemini-pro-latest')
    print("✅ Gemini model configured successfully.")
except Exception as e:
    print(f"--- 🔴 FATAL ERROR CONFIGURING GEMINI API: {e} ---")
    gemini_model = None

# --- INITIALIZE EXTENSIONS ---
jwt = JWTManager(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})
db = SQLAlchemy(app)
migrate = Migrate(app, db)
socketio = SocketIO(app, cors_allowed_origins="*")

# --- DATABASE MODELS ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    
    queries = db.relationship('Query', backref='owner', lazy=True, cascade="all, delete-orphan")
    medicines = db.relationship('Medicine', backref='owner', lazy=True, cascade="all, delete-orphan")
    alerts = db.relationship('EmergencyAlert', backref='owner', lazy=True, cascade="all, delete-orphan")
    
    # NEW: Add relationship to comments
    comments = db.relationship('Comment', backref='commenter', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Query(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(80), nullable=False) 
    question_text = db.Column(db.String(1000), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Pending')
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    bt_id = db.Column(db.String(100), nullable=False)
    room_no = db.Column(db.String(50), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # NEW: Add relationship to comments
    # 'dynamic' allows us to order_by when we fetch them
    # cascade means if a query is deleted, all its comments are deleted
    comments = db.relationship('Comment', 
                             backref='query', 
                             lazy='dynamic', 
                             cascade="all, delete-orphan")

    def to_dict(self):
        # NEW: Fetch comments, order by oldest first, and convert to dicts
        query_comments = [comment.to_dict() for comment in self.comments.order_by(Comment.timestamp.asc()).all()]
        
        return {
            'id': self.id,
            'user_name': self.user_name,
            'bt_id': self.bt_id,
            'room_no': self.room_no,
            'question_text': self.question_text,
            'status': self.status,
            'timestamp': self.timestamp.isoformat(),
            'owner_username': self.owner.username,
            'comments': query_comments  # NEW: Add comments to the response
        }

# --- NEW MODEL: Comment ---
class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500), nullable=False)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    
    # Foreign key to the User who wrote the comment
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    # Foreign key to the Query this comment is on
    query_id = db.Column(db.Integer, db.ForeignKey('query.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'text': self.text,
            'timestamp': self.timestamp.isoformat(),
            'commenter_username': self.commenter.username, # From backref
            'query_id': self.query_id
        }
# --- END NEW MODEL ---

class Medicine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    medicine_name = db.Column(db.String(100), nullable=False)
    expiry_date = db.Column(db.Date, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'medicine_name': self.medicine_name,
            'expiry_date': self.expiry_date.isoformat(),
        }

class EmergencyAlert(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    emergency_type = db.Column(db.String(100), nullable=False, default='General Emergency')
    location = db.Column(db.String(200), nullable=True)
    status = db.Column(db.String(50), nullable=False, default='Active')
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'emergency_type': self.emergency_type,
            'location': self.location,
            'status': self.status,
            'timestamp': self.timestamp.isoformat(),
            'owner_username': self.owner.username
        }

# --- API ENDPOINTS ---

# --- AUTHENTICATION ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username, password = data.get('username'), data.get('password')
    if not username or not password:
        return jsonify({"msg": "Username and password required"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 409
    
    new_user = User(username=username)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User created"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username, password = data.get('username'), data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)
    return jsonify({"msg": "Bad username or password"}), 401

# --- QUERIES ---
@app.route('/api/queries', methods=['GET', 'POST']) 
@jwt_required()
def handle_queries(): 
    
    if request.method == 'GET':
        try:
            queries = Query.query.order_by(Query.timestamp.desc()).all()
            return jsonify([q.to_dict() for q in queries]), 200
        except Exception as e:
            print(f"--- 🔴 ERROR in handle_queries (GET): {e} ---")
            return jsonify({"msg": "An internal server error occurred while fetching", "error": str(e)}), 500

    if request.method == 'POST':
        current_username = get_jwt_identity()
        user = User.query.filter_by(username=current_username).first_or_404()
        data = request.get_json()
        
        bt_id = data.get('bt_id')
        room_no = data.get('room_no')
        question_text = data.get('question_text')

        if not all([bt_id, room_no, question_text]):
            return jsonify({"msg": "Missing required fields: bt_id, room_no, or question_text"}), 400
        
        try:
            new_query = Query(
                user_name=current_username,
                bt_id=bt_id,
                room_no=room_no,
                question_text=question_text,
                user_id=user.id
            )
            db.session.add(new_query)
            db.session.commit()
            
            socketio.emit('new_query', new_query.to_dict(), broadcast=True) 
            
            return jsonify(new_query.to_dict()), 201
        
        except Exception as e:
            db.session.rollback()
            print(f"--- 🔴 ERROR in handle_queries (POST): {e} ---")
            return jsonify({"msg": "An internal server error occurred while saving", "error": str(e)}), 500
    
# --- NEW ENDPOINT: Add Comment ---
@app.route('/api/queries/<int:query_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(query_id):
    # Get the user who is posting
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    
    # Find the query they are posting to
    query = Query.query.get_or_404(query_id)
    
    data = request.get_json()
    text = data.get('text')
    
    if not text or not text.strip():
        return jsonify({"msg": "Comment text is required"}), 400
    
    try:
        new_comment = Comment(
            text=text.strip(),
            user_id=user.id,
            query_id=query.id
        )
        db.session.add(new_comment)
        db.session.commit()
        
        # Emit the new comment to ALL clients
        socketio.emit('new_comment', new_comment.to_dict(), broadcast=True)
        
        return jsonify(new_comment.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"--- 🔴 ERROR in add_comment: {e} ---")
        return jsonify({"msg": "An internal server error occurred"}), 500
# --- END NEW ENDPOINT ---


# --- MEDICINES (No changes needed) ---
@app.route('/api/medicines', methods=['GET'])
@jwt_required()
def get_medicines():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    medicines = Medicine.query.filter_by(user_id=user.id).order_by(Medicine.expiry_date.asc()).all()
    return jsonify([m.to_dict() for m in medicines])

@app.route('/api/medicines', methods=['POST'])
@jwt_required()
def add_medicine():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    data = request.get_json()
    medicine_name, expiry_date_str = data.get('medicineName'), data.get('expiryDate')
    if not medicine_name or not expiry_date_str:
        return jsonify({"msg": "Medicine name and expiry date are required"}), 400
    try:
        expiry_date_obj = datetime.strptime(expiry_date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"msg": "Invalid date format. Please use YYYY-MM-DD"}), 400
    new_medicine = Medicine(medicine_name=medicine_name, expiry_date=expiry_date_obj, user_id=user.id)
    db.session.add(new_medicine)
    db.session.commit()
    socketio.emit('medicine_added', new_medicine.to_dict(), broadcast=True)
    return jsonify(new_medicine.to_dict()), 201
    
@app.route('/api/medicines/<int:medicine_id>', methods=['DELETE'])
@jwt_required()
def delete_medicine(medicine_id):
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    medicine = Medicine.query.filter_by(id=medicine_id, user_id=user.id).first_or_404()
    db.session.delete(medicine)
    db.session.commit()
    socketio.emit('medicine_deleted', {'id': medicine_id}, broadcast=True)
    return jsonify({"msg": "Medicine deleted successfully"}), 200

# --- EMERGENCY ALERTS (No changes needed) ---
@app.route('/api/alerts', methods=['POST'])
@jwt_required()
def create_alert():
    current_username = get_jwt_identity()
    user = User.query.filter_by(username=current_username).first_or_404()
    data = request.get_json()
    new_alert = EmergencyAlert(
        emergency_type=data.get('emergency_type', 'General Emergency'),
        location=data.get('location'),
        user_id=user.id
    )
    db.session.add(new_alert)
    db.session.commit()
    socketio.emit('new_alert', new_alert.to_dict(), broadcast=True)
    return jsonify(new_alert.to_dict()), 201

@app.route('/api/alerts', methods=['GET'])
@jwt_required()
def get_alerts():
    alerts = EmergencyAlert.query.order_by(EmergencyAlert.timestamp.desc()).all()
    return jsonify([a.to_dict() for a in alerts])

# --- AI HEALTH TRACKER (No changes needed) ---
@app.route('/api/ai/health-check', methods=['POST'])
@jwt_required()
def health_check():
    if not gemini_model:
        return jsonify({"msg": "AI model not configured"}), 500
    data = request.get_json()
    user_query = data.get('query')
    if not user_query:
        return jsonify({"msg": "Query text is required"}), 400
    
    prompt = f"""
    You are an AI medical assistant. Analyze the following health-related query.
    **RULES**:
    1. Start with the disclaimer: '**Disclaimer:** I am an AI assistant... consult a qualified healthcare provider.'
    2. Use clear, concise language with simple Markdown (`###` for headings, `**bold**`, `* ` for lists).
    3. Use relevant emojis (🩺, 🤧, 💊).
    User's query: "{user_query}"
    """
    
    try:
        response = gemini_model.generate_content(prompt)
        html_response = response.text
        html_response = re.sub(r'### (.*?)(?:\n|$)', r'<h3>\1</h3>', html_response)
        html_response = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html_response)
        html_response = re.sub(r'^\* (.*?)$', r'<li>\1</li>', html_response, flags=re.MULTILINE)
        html_response = html_response.replace('\n', '<br>')
        html_response = re.sub(r'(?:<br>){2,}', '<br><br>', html_response) 
        
        return jsonify({"response": html_response})
    except Exception as e:
        print(f"--- 🔴 ERROR DURING GEMINI API CALL: {e} ---")
        return jsonify({"msg": "Error with AI service"}), 500

# --- Socket.IO Handlers ---
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('update_query_status')
def handle_update_query(data):
    token = data.get('token')
    if not token:
        print("Socket error: No token provided")
        return

    try:
        payload = decode_token(token)
        current_username = payload['sub'] 
    except Exception as e:
        print(f"Socket authentication error: {e}")
        return

    user = User.query.filter_by(username=current_username).first()
    if not user:
        print(f"Socket error: User {current_username} not found")
        return

    query_id = data.get('id')
    new_status = data.get('status')
    query = Query.query.filter_by(id=query_id, user_id=user.id).first()

    if query:
        query.status = new_status
        db.session.commit()
        emit('query_updated', query.to_dict(), broadcast=True)
    else:
        print(f"User {current_username} failed to update query {query_id} (not owner or DNE)")


@socketio.on('delete_query')
def handle_delete_query(data):
    token = data.get('token')
    if not token:
        print("Socket error: No token provided")
        return

    try:
        payload = decode_token(token)
        current_username = payload['sub']
    except Exception as e:
        print(f"Socket authentication error: {e}")
        return

    user = User.query.filter_by(username=current_username).first()
    if not user:
        print(f"Socket error: User {current_username} not found")
        return

    query_id = data.get('id')
    query = Query.query.filter_by(id=query_id, user_id=user.id).first()

    if query:
        db.session.delete(query)
        db.session.commit()
        emit('query_deleted', {'id': query_id}, broadcast=True)
    else:
        print(f"User {current_username} failed to delete query {query_id} (not owner or DNE)")

# --- RUN APP ---
if __name__ == '__main__':
    with app.app_context():
        # This will create the new 'comment' table if it doesn't exist
        db.create_all() 
    socketio.run(app, debug=True, port=5000)