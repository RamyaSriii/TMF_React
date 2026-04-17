"""
demo_model.py — Generate a lightweight DEMO model for testing
=============================================================
Use this script to create a dummy model.h5 so you can run the
backend server WITHOUT the full PlantVillage dataset.
Run ONCE, then start the Flask/FastAPI server normally.
"""

import json
import numpy as np
import os

# Class names from the PlantVillage dataset (38 classes)
CLASS_NAMES = {
    "0":  "Apple___Apple_scab",
    "1":  "Apple___Black_rot",
    "2":  "Apple___Cedar_apple_rust",
    "3":  "Apple___healthy",
    "4":  "Blueberry___healthy",
    "5":  "Cherry_(including_sour)___Powdery_mildew",
    "6":  "Cherry_(including_sour)___healthy",
    "7":  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
    "8":  "Corn_(maize)___Common_rust_",
    "9":  "Corn_(maize)___Northern_Leaf_Blight",
    "10": "Corn_(maize)___healthy",
    "11": "Grape___Black_rot",
    "12": "Grape___Esca_(Black_Measles)",
    "13": "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)",
    "14": "Grape___healthy",
    "15": "Orange___Haunglongbing_(Citrus_greening)",
    "16": "Peach___Bacterial_spot",
    "17": "Peach___healthy",
    "18": "Pepper,_bell___Bacterial_spot",
    "19": "Pepper,_bell___healthy",
    "20": "Potato___Early_blight",
    "21": "Potato___Late_blight",
    "22": "Potato___healthy",
    "23": "Raspberry___healthy",
    "24": "Soybean___healthy",
    "25": "Squash___Powdery_mildew",
    "26": "Strawberry___Leaf_scorch",
    "27": "Strawberry___healthy",
    "28": "Tomato___Bacterial_spot",
    "29": "Tomato___Early_blight",
    "30": "Tomato___Late_blight",
    "31": "Tomato___Leaf_Mold",
    "32": "Tomato___Septoria_leaf_spot",
    "33": "Tomato___Spider_mites Two-spotted_spider_mite",
    "34": "Tomato___Target_Spot",
    "35": "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "36": "Tomato___Tomato_mosaic_virus",
    "37": "Tomato___healthy"
}

NUM_CLASSES = len(CLASS_NAMES)


def create_demo_model():
    """Create a minimal CNN model with random weights for demo purposes."""
    try:
        import tensorflow as tf
        from tensorflow.keras import layers, models

        print(f"TensorFlow version: {tf.__version__}")
        print(f"Creating demo model with {NUM_CLASSES} output classes...")

        # Build lightweight model matching the expected input/output
        model = models.Sequential([
            layers.Conv2D(16, (3, 3), padding="same", activation="relu",
                         input_shape=(224, 224, 3)),
            layers.MaxPooling2D((4, 4)),
            layers.Conv2D(32, (3, 3), padding="same", activation="relu"),
            layers.MaxPooling2D((4, 4)),
            layers.Conv2D(64, (3, 3), padding="same", activation="relu"),
            layers.MaxPooling2D((2, 2)),
            layers.Flatten(),
            layers.Dense(128, activation="relu"),
            layers.Dropout(0.5),
            layers.Dense(NUM_CLASSES, activation="softmax")
        ])

        model.compile(
            optimizer="adam",
            loss="categorical_crossentropy",
            metrics=["accuracy"]
        )

        # Save model
        model_path = os.path.join(os.path.dirname(__file__), "model.h5")
        model.save(model_path)
        print(f"✅ Demo model saved to: {model_path}")
        print(f"   Model parameters: {model.count_params():,}")

        return model

    except ImportError:
        print("❌ TensorFlow not installed.")
        print("   Run: pip install tensorflow")
        return None


def save_class_names():
    """Save class names JSON for backend use."""
    class_names_path = os.path.join(os.path.dirname(__file__), "class_names.json")
    with open(class_names_path, "w") as f:
        json.dump(CLASS_NAMES, f, indent=2)
    print(f"✅ Class names saved to: {class_names_path}")
    print(f"   Total classes: {len(CLASS_NAMES)}")


if __name__ == "__main__":
    print("=" * 50)
    print("  PLANT DISEASE DEMO MODEL GENERATOR")
    print("=" * 50)

    # Always save class names
    save_class_names()

    # Create demo model
    model = create_demo_model()

    if model:
        print("\n" + "=" * 50)
        print("  SETUP COMPLETE!")
        print("  Start backend: cd ../backend && python app.py")
        print("=" * 50)
    else:
        print("\n⚠️  Could not create TF model.")
        print("   Install TF and retry, or use real trained model.h5")
