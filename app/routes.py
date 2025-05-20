from flask import Flask, jsonify, request
from flask_cors import CORS
from app.db import SessionLocal, engine
from app.models import Patient, Provider, Base
from sqlalchemy.exc import IntegrityError
import bcrypt

app = Flask(__name__, static_folder="../static", static_url_path="")
CORS(app)

# Create DB tables on startup
Base.metadata.create_all(bind=engine)

def capitalize_name(name: str) -> str:
    """Strip leading/trailing spaces and capitalize the first letter."""
    return name.strip().capitalize() if name else ""

@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/api/signup", methods=["POST"])
def signup():
    db = SessionLocal()
    data = request.json
    hashed_pw = bcrypt.hashpw(data["password"].encode("utf-8"), bcrypt.gensalt())
    provider = Provider(email=data["email"], password=hashed_pw.decode("utf-8"))
    try:
        db.add(provider)
        db.commit()
        return jsonify({"provider_id": provider.id}), 201
    except IntegrityError:
        db.rollback()
        return jsonify({"error": "Email already registered or invalid format"}), 400

@app.route("/api/login", methods=["POST"])
def login():
    db = SessionLocal()
    data = request.json
    provider = db.query(Provider).filter_by(email=data["email"]).first()
    if provider and bcrypt.checkpw(data["password"].encode("utf-8"), provider.password.encode("utf-8")):
        return jsonify({"provider_id": provider.id}), 200
    return jsonify({"error": "Invalid email or password"}), 401

@app.route("/api/patients", methods=["GET", "POST"])
def handle_patients():
    db = SessionLocal()

    if request.method == "GET":
        provider_id = request.args.get("provider_id")
        if not provider_id:
            return jsonify({"error": "Missing provider_id"}), 400
        patients = db.query(Patient).filter_by(provider_id=provider_id).all()
        return jsonify([p.to_dict() for p in patients])

    elif request.method == "POST":
        data = request.json
        if "provider_id" not in data:
            return jsonify({"error": "Missing provider_id"}), 400

        patient = Patient(
            provider_id=data["provider_id"],
            first_name=capitalize_name(data["first_name"]),
            middle_name=capitalize_name(data.get("middle_name", "")),
            last_name=capitalize_name(data["last_name"]),
            dob=data["dob"],
            status=data["status"],
            address=data["address"].strip(),
        )

        try:
            db.add(patient)
            db.commit()
            db.refresh(patient)
            return jsonify(patient.to_dict()), 201
        except IntegrityError as e:
            db.rollback()
            if "uq_patient_per_provider" in str(e):
                return jsonify({"error": "This patient already exists for this provider."}), 400
            return jsonify({
                "error": "Name field is too long. Please shorten and try again."
            }), 400
