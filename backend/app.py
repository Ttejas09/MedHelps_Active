from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager
import os

# --- INITIAL SETUP ---
app = Flask(__name__)
# In a real app, use environment variables for these configs
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///medhelps.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = "your-super-secret-key-change-this" # IMPORTANT: Change this key!
app.config['SECRET_KEY'] = 'another-secret-key-for-socketio'

# Initialize extensions
jwt = JWTManager(app)
CORS(app, resources={r"/*": {"origins": "*"}})
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")


# --- DATABASE MODELS ---

# NEW: User model for authentication
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Query(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(100), nullable=False)
    bt_id = db.Column(db.String(100), nullable=False)
    room_no = db.Column(db.String(50), nullable=False)
    question_text = db.Column(db.String(1000), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Pending')
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    # Add other models like EmergencyAlert, Medicine here later

    def to_dict(self):
        return {
            'id': self.id, 'user_name': self.user_name, 'bt_id': self.bt_id,
            'room_no': self.room_no, 'question_text': self.question_text,
            'status': self.status, 'timestamp': self.timestamp.isoformat()
        }


# --- AUTHENTICATION API ENDPOINTS ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return jsonify({"msg": "Username and password are required"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 409
    
    new_user = User(username=username)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User created successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)
    
    return jsonify({"msg": "Bad username or password"}), 401


# --- PROTECTED API ENDPOINTS ---

# GET all queries
@app.route('/api/queries', methods=['GET'])
@jwt_required() # This protects the endpoint, user must be logged in
def get_queries():
    queries = Query.query.order_by(Query.timestamp.desc()).all()
    return jsonify([q.to_dict() for q in queries])

# POST a new query
@app.route('/api/queries', methods=['POST'])
@jwt_required() # This also protects the endpoint
def add_query():
    data = request.get_json()
    new_query = Query(
        user_name=data['user_name'], bt_id=data['bt_id'],
        room_no=data['room_no'], question_text=data['question_text']
    )
    db.session.add(new_query)
    db.session.commit()
    socketio.emit('new_query', new_query.to_dict(), broadcast=True)
    return jsonify(new_query.to_dict()), 201
    
# ... (Other protected endpoints for updating/deleting queries)


# --- Socket.IO Handlers ---
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')
    
# ... (Other real-time handlers for alerts, etc.)


# --- RUN APP ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Creates User and Query tables if they don't exist
    socketio.run(app, debug=True, port=5000)

