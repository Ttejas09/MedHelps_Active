import re
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, JWTManager
import os
import google.generativeai as genai
from dotenv import load_dotenv

# --- INITIAL SETUP ---
load_dotenv() # Loads environment variables from .env file

app = Flask(__name__)

# --- CONFIGURATION ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///medhelps.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = "your-super-secret-key-for-medhelps" # IMPORTANT: Change this key!
app.config['SECRET_KEY'] = 'another-secret-key-for-socketio'

# --- Gemini API Configuration ---
try:
    # Ensure the GOOGLE_API_KEY is loaded from the .env file in your backend folder
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in .env file")
    genai.configure(api_key=api_key)
    # --- UPDATED TO LATEST STABLE MODEL NAME ---
    gemini_model = genai.GenerativeModel('gemini-pro-latest')
    print("✅ Gemini Pro model configured successfully.")
except Exception as e:
    print(f"--- 🔴 FATAL ERROR CONFIGURING GEMINI API: {e} ---")
    gemini_model = None
# ------------------------------------

# --- INITIALIZE EXTENSIONS ---
jwt = JWTManager(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins="*")


# --- DATABASE MODELS ---
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

    def to_dict(self):
        return {
            'id': self.id, 'user_name': self.user_name, 'bt_id': self.bt_id,
            'room_no': self.room_no, 'question_text': self.question_text,
            'status': self.status, 'timestamp': self.timestamp.isoformat()
        }

# --- DIAGNOSTIC ENDPOINT ---
@app.route('/api/status', methods=['GET'])
def status():
    """A simple endpoint to check if the server is running and the AI model is loaded."""
    if gemini_model:
        return jsonify({"status": "ok", "message": "Server is running and AI model is loaded.", "model_loaded": True})
    else:
        return jsonify({"status": "error", "message": "Server is running, but the AI model failed to initialize. Check server logs for API key errors.", "model_loaded": False}), 500

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
@app.route('/api/queries', methods=['GET'])
@jwt_required()
def get_queries():
    queries = Query.query.order_by(Query.timestamp.desc()).all()
    return jsonify([q.to_dict() for q in queries])

@app.route('/api/queries', methods=['POST'])
@jwt_required()
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
    
@app.route('/api/ai/health-check', methods=['POST'])
@jwt_required()
def health_check():
    if not gemini_model:
        return jsonify({"msg": "AI model is not configured correctly on the server. Check the API key."}), 500

    data = request.get_json()
    user_query = data.get('query')
    if not user_query:
        return jsonify({"msg": "Query text is required"}), 400

    # --- UPDATED PROMPT ---
    # Asks for Markdown, short paragraphs, and emojis
    prompt = f"""
    You are an AI medical assistant. Analyze the following health-related query.

    **VERY IMPORTANT RULES**:
    1.  Start your response with the following disclaimer, exactly as written:
        '**Disclaimer:** I am an AI assistant and not a medical professional. This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider.'
    2.  Use clear, concise language.
    3.  Use simple Markdown for formatting:
        * Use `###` for subheadings (e.g., "### 🩺 Common Causes").
        * Use `**bold**` for important terms.
        * Use bullet points starting with a single `* ` (e.g., "* Viral Infections...").
        * Use relevant emojis (like 🩺, 🤧, 💊) where appropriate.
    4.  Keep paragraphs short and easy to read, using newlines to separate them.

    User's query: "{user_query}"
    """
    
    try:
        response = gemini_model.generate_content(prompt)
        
        # --- NEW CONVERSION LOGIC ---
        # Get the raw text from the AI
        html_response = response.text

        # 1. Convert Markdown headings (e.g., ### 🩺 Heading) to HTML <h3>
        html_response = re.sub(r'### (.*?)\n', r'<h3>\1</h3>', html_response)

        # 2. Convert Markdown bold (e.g., **my text**) to HTML <strong>
        html_response = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html_response)

        # 3. Convert Markdown list items (e.g., * My Item) to HTML <li>
        # This regex looks for a literal '*' followed by a space at the start of a line
        html_response = re.sub(r'^\* (.*?)$', r'<li>\1</li>', html_response, flags=re.MULTILINE)

        # 4. Convert all remaining newlines to <br> tags for spacing
        html_response = html_response.replace('\n', '<br>')
        
        # 5. Clean up any messy tags from the conversion
        html_response = html_response.replace('</h3><br>', '</h3>')
        html_response = html_response.replace('</li><br>', '</li>')
        html_response = html_response.replace('</li><br><li>', '</li><li>')

        return jsonify({"response": html_response})
    
    except Exception as e:
        # This will print the detailed error to your Python terminal.
        print(f"--- 🔴 ERROR DURING GEMINI API CALL: {e} ---")
        return jsonify({"msg": f"An error occurred while communicating with the AI service. Please check the backend console."}), 500


# --- Socket.IO Handlers ---
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')
    

# --- RUN APP ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all() 
    socketio.run(app, debug=True, port=5000)

