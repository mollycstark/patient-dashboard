from flask import Flask, jsonify, request
from flask_cors import CORS
from app.db import SessionLocal, engine
from app.models import Patient, Base
from sqlalchemy.exc import IntegrityError

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

@app.route("/api/patients", methods=["GET", "POST"])
def handle_patients():
    db = SessionLocal()
    if request.method == "GET":
        patients = db.query(Patient).all()
        return jsonify([p.to_dict() for p in patients])

    elif request.method == "POST":
        data = request.json
        patient = Patient(
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
        except IntegrityError:
            db.rollback()
            return jsonify({
                "error": "Name field is too long. Please shorten and try again."
            }), 400
