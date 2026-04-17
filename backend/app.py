"""
Plant Disease Prediction API — Flask Backend
=============================================
Endpoints:
  POST /predict      — Upload image → get disease prediction
  GET  /health       — Health check
  GET  /diseases     — List all supported diseases
"""

import os
import sys
import json
import logging
import time
import traceback
from io import BytesIO

import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

# ── Logging Setup ──────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("backend.log")
    ]
)
logger = logging.getLogger("plant_disease_api")

# ── App Initialization ─────────────────────────────────────────
app = Flask(__name__)

# CORS — allow configurable origins (comma-separated in env var)
_allowed_origins = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
CORS(app, resources={r"/*": {"origins": _allowed_origins}})

# ── Configuration ──────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "..", "model", "model.h5")
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "..", "model", "class_names.json")
DISEASE_INFO_PATH = os.path.join(BASE_DIR, "..", "data", "disease_info.json")
CONFIDENCE_THRESHOLD = 0.65   # Below this → "Low confidence" warning
MAX_FILE_SIZE_MB = 10

# ── Load model and data lazily ─────────────────────────────────
_model = None
_class_names = None
_disease_info = None
_img_size = (64, 64)  # Default; updated dynamically when model loads


def load_model():
    """Load TF model once, cache it in memory."""
    global _model, _img_size
    if _model is None:
        logger.info(f"Loading model from: {MODEL_PATH}")
        try:
            import tensorflow as tf
            _model = tf.keras.models.load_model(MODEL_PATH)
            # Dynamically read the model's expected input size
            input_shape = _model.input_shape  # e.g. (None, 64, 64, 3)
            if input_shape and len(input_shape) == 4:
                _img_size = (input_shape[1], input_shape[2])
            logger.info(f"✅ Model loaded. Input shape: {_model.input_shape}, using IMG_SIZE={_img_size}")
        except FileNotFoundError:
            logger.error(f"❌ model.h5 not found at {MODEL_PATH}")
            logger.error("   Run: cd model && python demo_model.py")
            raise
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            raise
    return _model


def load_class_names():
    """Load class index → class name mapping."""
    global _class_names
    if _class_names is None:
        try:
            with open(CLASS_NAMES_PATH, "r") as f:
                _class_names = json.load(f)
            logger.info(f"✅ Loaded {len(_class_names)} class names")
        except FileNotFoundError:
            logger.error(f"❌ class_names.json not found at {CLASS_NAMES_PATH}")
            raise
    return _class_names


def load_disease_info():
    """Load disease knowledge base (pesticides, symptoms, etc.)."""
    global _disease_info
    if _disease_info is None:
        try:
            with open(DISEASE_INFO_PATH, "r") as f:
                _disease_info = json.load(f)
            logger.info(f"✅ Loaded disease info for {len(_disease_info)} diseases")
        except FileNotFoundError:
            logger.error(f"❌ disease_info.json not found at {DISEASE_INFO_PATH}")
            raise
    return _disease_info


# ── Image Preprocessing ────────────────────────────────────────
def preprocess_image(image_bytes):
    """
    Preprocess uploaded image for model inference.
    Steps: decode → resize → normalize → add batch dimension
    Uses _img_size dynamically read from the loaded model.
    """
    # Open image with PIL (handles JPEG, PNG, WEBP, etc.)
    img = Image.open(BytesIO(image_bytes))

    # Convert to RGB (handles grayscale, RGBA, paletted images)
    img = img.convert("RGB")

    # Resize to model input size (dynamically determined)
    img = img.resize(_img_size, Image.LANCZOS)

    # Convert to numpy array and normalize to [0, 1]
    img_array = np.array(img, dtype=np.float32) / 255.0

    # Add batch dimension: (H, W, 3) → (1, H, W, 3)
    img_array = np.expand_dims(img_array, axis=0)

    return img_array


# ── Prediction Logic ──────────────────────────────────────────
def predict_disease(image_bytes):
    """
    Run inference on image bytes.
    Returns predicted class name, confidence, and top-3 predictions.
    """
    # Load resources (cached after first call)
    model = load_model()
    class_names = load_class_names()
    disease_info = load_disease_info()

    # Preprocess image
    img_array = preprocess_image(image_bytes)

    # Run inference
    start_time = time.time()
    predictions = model.predict(img_array, verbose=0)[0]
    inference_time = round((time.time() - start_time) * 1000, 2)  # ms

    # Get top prediction
    top_idx = int(np.argmax(predictions))
    confidence = float(predictions[top_idx])
    predicted_class = class_names[str(top_idx)]

    # Get top-3 predictions for additional context
    top3_indices = np.argsort(predictions)[-3:][::-1]
    top3 = [
        {
            "class": class_names[str(int(i))],
            "confidence": round(float(predictions[i]) * 100, 2)
        }
        for i in top3_indices
    ]

    # Look up disease info from knowledge base
    info = disease_info.get(predicted_class, {
        "common_name": predicted_class.replace("___", " - ").replace("_", " "),
        "plant": "Unknown",
        "symptoms": "No information available for this disease.",
        "severity": "Unknown",
        "pesticide": {"chemical": "Consult a local agronomist", "dosage": "N/A",
                      "frequency": "N/A", "application": "N/A"},
        "organic_remedy": "N/A",
        "precautions": ["Consult a local agronomist"],
        "prevention": "N/A"
    })

    logger.info(
        f"Prediction: {predicted_class} | "
        f"Confidence: {confidence*100:.2f}% | "
        f"Inference: {inference_time}ms"
    )

    return {
        "raw_class": predicted_class,
        "confidence": confidence,
        "top3": top3,
        "info": info,
        "inference_time_ms": inference_time,
        "below_threshold": confidence < CONFIDENCE_THRESHOLD
    }


# ── Routes ─────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health_check():
    """Health check — returns model status and available classes."""
    try:
        class_names = load_class_names()
        return jsonify({
            "status": "ok",
            "model": "loaded" if _model else "not_loaded",
            "total_classes": len(class_names),
            "confidence_threshold": CONFIDENCE_THRESHOLD,
            "version": "1.0.0"
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/diseases", methods=["GET"])
def list_diseases():
    """Return all diseases in the knowledge base."""
    try:
        disease_info = load_disease_info()
        diseases = [
            {
                "key": key,
                "common_name": val.get("common_name", key),
                "plant": val.get("plant", "Unknown"),
                "severity": val.get("severity", "Unknown")
            }
            for key, val in disease_info.items()
        ]
        return jsonify({
            "total": len(diseases),
            "diseases": sorted(diseases, key=lambda x: x["plant"])
        })
    except Exception as e:
        logger.error(f"Error in /diseases: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/predict", methods=["POST"])
def predict():
    """
    Main prediction endpoint.

    Request: multipart/form-data with 'image' field
    Response: JSON with disease info, confidence, and recommendations
    """
    request_start = time.time()

    # ── Validate request ──────────────────────────────────────
    if "image" not in request.files:
        return jsonify({
            "error": "No image provided",
            "message": "Include image file in 'image' field of form data"
        }), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # Check file size (before reading)
    file_bytes = file.read()
    file_size_mb = len(file_bytes) / (1024 * 1024)

    if file_size_mb > MAX_FILE_SIZE_MB:
        return jsonify({
            "error": f"File too large ({file_size_mb:.1f}MB). Max: {MAX_FILE_SIZE_MB}MB"
        }), 413

    # ── Validate image format ─────────────────────────────────
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
    ext = os.path.splitext(file.filename.lower())[1]
    if ext not in allowed_extensions:
        return jsonify({
            "error": f"Invalid file type: {ext}",
            "allowed": list(allowed_extensions)
        }), 415

    # ── Run prediction ─────────────────────────────────────────
    try:
        result = predict_disease(file_bytes)
    except FileNotFoundError as e:
        logger.error(f"Model file not found: {e}")
        return jsonify({
            "error": "Model not loaded",
            "message": "Run 'cd model && python demo_model.py' first"
        }), 503
    except Exception as e:
        logger.error(f"Prediction error: {traceback.format_exc()}")
        return jsonify({
            "error": "Prediction failed",
            "message": str(e)
        }), 500

    # ── Build response ─────────────────────────────────────────
    info = result["info"]
    confidence_pct = round(result["confidence"] * 100, 2)
    total_time = round((time.time() - request_start) * 1000, 2)

    response = {
        # Core prediction
        "disease": info.get("common_name", result["raw_class"]),
        "raw_class": result["raw_class"],
        "confidence": confidence_pct,
        "confidence_level": (
            "high" if result["confidence"] >= 0.85 else
            "medium" if result["confidence"] >= CONFIDENCE_THRESHOLD else
            "low"
        ),

        # Low confidence warning
        "low_confidence_warning": result["below_threshold"],
        "low_confidence_message": (
            "⚠️ Confidence is low. Please try a clearer image in better lighting."
            if result["below_threshold"] else None
        ),

        # Disease details
        "solution": {
            "plant": info.get("plant", "Unknown"),
            "symptoms": info.get("symptoms", ""),
            "severity": info.get("severity", "Unknown"),
            "pesticide": info.get("pesticide", {}),
            "organic_remedy": info.get("organic_remedy", ""),
            "precautions": info.get("precautions", []),
            "prevention": info.get("prevention", "")
        },

        # Alternative predictions
        "top3_predictions": result["top3"],

        # Metadata
        "inference_time_ms": result["inference_time_ms"],
        "total_time_ms": total_time
    }

    logger.info(f"✅ /predict completed in {total_time}ms")
    return jsonify(response)


# ── Error Handlers ─────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"error": "Method not allowed"}), 405


@app.errorhandler(500)
def internal_error(e):
    logger.error(f"Unhandled error: {traceback.format_exc()}")
    return jsonify({"error": "Internal server error"}), 500


# ── Entry Point ────────────────────────────────────────────────

if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("  PLANT DISEASE API STARTING")
    logger.info("=" * 60)

    # Pre-load model at startup
    try:
        load_model()
        load_class_names()
        load_disease_info()
        logger.info("✅ All resources loaded. Server ready!")
    except Exception as e:
        logger.warning(f"⚠️  Pre-load failed: {e}")
        logger.warning("   Resources will load on first request.")

    # Start server
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "production") == "development"

    logger.info(f"🚀 Server running on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
