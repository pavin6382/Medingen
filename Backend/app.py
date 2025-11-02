from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from flask_jwt_extended import JWTManager, create_access_token
from mysql.connector import Error

app = Flask(__name__)

# --- CONFIG ---
app.config['JWT_SECRET_KEY'] = 'secretkey'   # For JWT tokens
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow React to connect
jwt = JWTManager(app)


# --- DATABASE CONNECTION ---
def get_db():
    try:
        conn = mysql.connector.connect(
            host="127.0.0.1",      # ✅ Use IP instead of localhost
            port=3306,             # ✅ Default MySQL port
            user="root",           # ✅ Default user in phpMyAdmin
            password="",           # ⚠️ Leave empty if you don’t set a password
            database="medingen_db" # ✅ Your new database name
        )
        print("✅ Connected to MySQL successfully")
        return conn
    except Error as e:
        print("❌ Database Connection Error:", e)
        return None


# --- DUMMY LOGIN ---
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    username = data.get('username')
    password = data.get('password')

    db = get_db()
    if not db:
        return jsonify({"error": "Database connection failed"}), 500

    cur = db.cursor(dictionary=True)
    cur.execute("SELECT * FROM users WHERE username=%s AND password=%s", (username, password))
    user = cur.fetchone()
    cur.close()
    db.close()

    if user:
        token = create_access_token(identity=username)
        return jsonify({"token": token}), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401


# --- GET ALL PRODUCTS ---
@app.route('/api/products', methods=['GET'])
def get_products():
    db = get_db()
    if not db:
        return jsonify({"error": "Database connection failed"}), 500

    cur = db.cursor(dictionary=True)
    cur.execute("SELECT * FROM products")
    products = cur.fetchall()
    cur.close()
    db.close()

    return jsonify(products), 200


# --- GET SINGLE PRODUCT DETAILS ---
@app.route('/api/products/<int:id>', methods=['GET'])
def get_product(id):
    db = get_db()
    if not db:
        return jsonify({"error": "Database connection failed"}), 500

    cur = db.cursor(dictionary=True)
    cur.execute("SELECT * FROM products WHERE id=%s", (id,))
    product = cur.fetchone()

    cur.execute("SELECT * FROM salt_content WHERE product_id=%s", (id,))
    salts = cur.fetchall()

    cur.execute("SELECT * FROM product_description WHERE product_id=%s", (id,))
    descs = cur.fetchall()

    cur.execute("SELECT * FROM product_reviews WHERE product_id=%s", (id,))
    reviews = cur.fetchall()

    cur.close()
    db.close()

    if not product:
        return jsonify({"error": "Product not found"}), 404

    return jsonify({
        "product": product,
        "salts": salts,
        "descriptions": descs,
        "reviews": reviews
    }), 200


# --- ADD SALT ENTRY FOR A PRODUCT ---
@app.route('/api/products/<int:product_id>/salts', methods=['POST'])
def add_salt(product_id):
    data = request.get_json() or {}
    salt_name = data.get("salt_name")
    strength = data.get("strength")

    if not salt_name or not strength:
        return jsonify({"error": "salt_name and strength required"}), 400

    db = get_db()
    if not db:
        return jsonify({"error": "Database connection failed"}), 500

    cur = db.cursor()
    try:
        cur.execute(
            "INSERT INTO salt_content (product_id, salt_name, strength) VALUES (%s, %s, %s)",
            (product_id, salt_name, strength)
        )
        db.commit()
        insert_id = cur.lastrowid
        cur.close()
        db.close()
        return jsonify({"insertId": insert_id, "salt_name": salt_name, "strength": strength}), 201
    except Exception as e:
        print("❌ Error adding salt:", e)
        db.rollback()
        cur.close()
        db.close()
        return jsonify({"error": str(e)}), 500


# --- DEFAULT ROUTE ---
@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Medingen Flask API is running 🚀"}), 200


# --- RUN SERVER ---
if __name__ == "__main__":
    print("✅ Starting Flask server on http://127.0.0.1:5000")
    app.run(debug=True, port=5000)
