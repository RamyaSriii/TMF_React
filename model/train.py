"""
Plant Disease CNN Model Training Script
========================================
Dataset: PlantVillage (Kaggle) - 26 classes
Model: Custom CNN with BatchNormalization
Input Size: 224x224x3
"""

import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks, optimizers
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import matplotlib.pyplot as plt

# ============================================================
# CONFIGURATION
# ============================================================
CONFIG = {
    "data_dir": "../data/plantvillage/color",   # Path to dataset (color subfolder has 38 disease classes)
    "model_save_path": "model.h5",
    "class_names_path": "class_names.json",
    "img_size": (128,128),
    "batch_size":32,
    "epochs": 5,
    "learning_rate": 0.001,
    "validation_split": 0.2,
    "dropout_rate": 0.5,
    "confidence_threshold": 0.70,        # Below this → "Try another image"
}

NUM_CLASSES = 38  # Total classes in PlantVillage dataset


# ============================================================
# DATA AUGMENTATION & LOADING
# ============================================================
def create_data_generators(data_dir, img_size, batch_size):
    """
    Create training and validation data generators with augmentation.
    Augmentation helps the model generalize to real-world images.
    """
    # Training generator with heavy augmentation
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255.0,              # Normalize pixel values to [0,1]
        rotation_range=30,                 # Random rotations ±30 degrees
        width_shift_range=0.2,             # Horizontal shift
        height_shift_range=0.2,            # Vertical shift
        shear_range=0.2,                   # Shear transformation
        zoom_range=0.2,                    # Random zoom
        horizontal_flip=True,              # Mirror images
        vertical_flip=False,               # Don't flip vertically (unnatural for plants)
        brightness_range=[0.8, 1.2],       # Simulate different lighting
        fill_mode="nearest",               # Fill empty pixels
        validation_split=CONFIG["validation_split"]
    )

    # Validation generator — only rescaling, no augmentation
    val_datagen = ImageDataGenerator(
        rescale=1.0 / 255.0,
        validation_split=CONFIG["validation_split"]
    )

    # Load training data
    train_generator = train_datagen.flow_from_directory(
        data_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode="categorical",
        subset="training",
        shuffle=True,
        seed=42
    )

    # Load validation data
    val_generator = val_datagen.flow_from_directory(
        data_dir,
        target_size=img_size,
        batch_size=batch_size,
        class_mode="categorical",
        subset="validation",
        shuffle=False,
        seed=42
    )

    return train_generator, val_generator


# ============================================================
# CNN MODEL ARCHITECTURE
# ============================================================
def build_cnn_model(input_shape, num_classes, dropout_rate):
    """
    Custom CNN architecture for plant disease classification.

    Architecture:
    Conv2D(32) → BN → MaxPool →
    Conv2D(64) → BN → MaxPool →
    Conv2D(128) → BN → MaxPool →
    Conv2D(256) → BN → MaxPool →
    Flatten → Dense(512) → BN → Dropout → Dense(num_classes, softmax)
    """
    model = models.Sequential([
        # ── BLOCK 1 ──────────────────────────────
        layers.Conv2D(32, (3, 3), padding="same", input_shape=input_shape),
        layers.BatchNormalization(),
        layers.Activation("relu"),
        layers.Conv2D(32, (3, 3), padding="same"),
        layers.BatchNormalization(),
        layers.Activation("relu"),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),

        # ── BLOCK 2 ──────────────────────────────
        layers.Conv2D(64, (3, 3), padding="same"),
        layers.BatchNormalization(),
        layers.Activation("relu"),
        layers.Conv2D(64, (3, 3), padding="same"),
        layers.BatchNormalization(),
        layers.Activation("relu"),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),

        # ── BLOCK 3 ──────────────────────────────
        layers.Conv2D(128, (3, 3), padding="same"),
        layers.BatchNormalization(),
        layers.Activation("relu"),
        layers.Conv2D(128, (3, 3), padding="same"),
        layers.BatchNormalization(),
        layers.Activation("relu"),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),

        # ── BLOCK 4 ──────────────────────────────
        layers.Conv2D(256, (3, 3), padding="same"),
        layers.BatchNormalization(),
        layers.Activation("relu"),
        layers.MaxPooling2D((2, 2)),
        layers.Dropout(0.25),

        # ── CLASSIFIER HEAD ──────────────────────
        layers.Flatten(),
        layers.Dense(512),
        layers.BatchNormalization(),
        layers.Activation("relu"),
        layers.Dropout(dropout_rate),

        # Output layer — softmax for multi-class probability
        layers.Dense(num_classes, activation="softmax")
    ])

    return model


# ============================================================
# TRANSFER LEARNING ALTERNATIVE (Better accuracy)
# ============================================================
def build_transfer_model(input_shape, num_classes, dropout_rate):
    """
    Uses MobileNetV2 as base (lightweight, fast, accurate).
    Recommended if dataset > 10,000 images.
    """
    # Load MobileNetV2 without top classification layers
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=input_shape,
        include_top=False,
        weights="imagenet"  # Pre-trained on ImageNet
    )

    # Freeze base model initially
    base_model.trainable = False

    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(256, activation="relu"),
        layers.BatchNormalization(),
        layers.Dropout(dropout_rate),
        layers.Dense(num_classes, activation="softmax")
    ])

    return model, base_model


# ============================================================
# TRAINING
# ============================================================
def train_model(use_transfer_learning=False):
    """Main training function."""

    print("=" * 60)
    print("   PLANT DISEASE CNN TRAINING")
    print("=" * 60)

    # Load data
    print("\n[1/5] Loading and augmenting data...")
    train_gen, val_gen = create_data_generators(
        CONFIG["data_dir"],
        CONFIG["img_size"],
        CONFIG["batch_size"]
    )

    # Save class names mapping for inference
    class_indices = train_gen.class_indices
    class_names = {v: k for k, v in class_indices.items()}
    with open(CONFIG["class_names_path"], "w") as f:
        json.dump(class_names, f, indent=2)
    print(f"   Saved {len(class_names)} class names to {CONFIG['class_names_path']}")

    num_classes = len(class_names)
    input_shape = CONFIG["img_size"] + (3,)

    # Build model
    print(f"\n[2/5] Building {'Transfer Learning' if use_transfer_learning else 'Custom CNN'} model...")

    if use_transfer_learning:
        model, base_model = build_transfer_model(input_shape, num_classes, CONFIG["dropout_rate"])
    else:
        model = build_cnn_model(input_shape, num_classes, CONFIG["dropout_rate"])

    # Compile model
    model.compile(
        optimizer=optimizers.Adam(learning_rate=CONFIG["learning_rate"]),
        loss="categorical_crossentropy",
        metrics=["accuracy", tf.keras.metrics.TopKCategoricalAccuracy(k=3, name="top3_accuracy")]
    )

    model.summary()

    # Callbacks for smarter training
    print("\n[3/5] Setting up training callbacks...")
    training_callbacks = [
        # Stop if validation accuracy stops improving
        callbacks.EarlyStopping(
            monitor="val_accuracy",
            patience=7,
            restore_best_weights=True,
            verbose=1
        ),
        # Reduce LR when plateau detected
        callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=3,
            min_lr=1e-6,
            verbose=1
        ),
        # Save best model checkpoint
        callbacks.ModelCheckpoint(
            filepath=CONFIG["model_save_path"],
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1
        ),
        # TensorBoard logging
        callbacks.TensorBoard(
            log_dir="./logs",
            histogram_freq=1
        )
    ]

    # Train Phase 1: Base training
    print("\n[4/5] Training model...")
    history = model.fit(
        train_gen,
        epochs=CONFIG["epochs"],
        validation_data=val_gen,
        callbacks=training_callbacks,
        verbose=1
    )

    # Transfer learning: Fine-tune (unfreeze last layers)
    if use_transfer_learning:
        print("\n   Fine-tuning last 30 layers...")
        base_model.trainable = True
        for layer in base_model.layers[:-30]:
            layer.trainable = False

        model.compile(
            optimizer=optimizers.Adam(learning_rate=1e-5),  # Much lower LR for fine-tuning
            loss="categorical_crossentropy",
            metrics=["accuracy"]
        )

        history_finetune = model.fit(
            train_gen,
            epochs=20,
            validation_data=val_gen,
            callbacks=training_callbacks,
            verbose=1
        )

    # Save final model
    print(f"\n[5/5] Saving model to {CONFIG['model_save_path']}...")
    model.save(CONFIG["model_save_path"])

    # Evaluate on validation set
    val_loss, val_acc, *_ = model.evaluate(val_gen, verbose=0)
    print(f"\n{'='*60}")
    print(f"   TRAINING COMPLETE")
    print(f"   Final Validation Accuracy: {val_acc:.4f} ({val_acc*100:.2f}%)")
    print(f"   Final Validation Loss:     {val_loss:.4f}")
    print(f"   Model saved to:            {CONFIG['model_save_path']}")
    print(f"{'='*60}")

    # Plot training curves
    plot_training_history(history)

    return model, history


# ============================================================
# VISUALIZATION
# ============================================================
def plot_training_history(history):
    """Plot and save training/validation accuracy and loss curves."""
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Accuracy plot
    axes[0].plot(history.history["accuracy"], label="Train Accuracy", color="#2ecc71")
    axes[0].plot(history.history["val_accuracy"], label="Val Accuracy", color="#e74c3c")
    axes[0].set_title("Model Accuracy", fontsize=14, fontweight="bold")
    axes[0].set_xlabel("Epoch")
    axes[0].set_ylabel("Accuracy")
    axes[0].legend()
    axes[0].grid(True, alpha=0.3)

    # Loss plot
    axes[1].plot(history.history["loss"], label="Train Loss", color="#2ecc71")
    axes[1].plot(history.history["val_loss"], label="Val Loss", color="#e74c3c")
    axes[1].set_title("Model Loss", fontsize=14, fontweight="bold")
    axes[1].set_xlabel("Epoch")
    axes[1].set_ylabel("Loss")
    axes[1].legend()
    axes[1].grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig("training_curves.png", dpi=150, bbox_inches="tight")
    print("   Training curves saved to training_curves.png")
    plt.close()


# ============================================================
# QUICK TEST / INFERENCE CHECK
# ============================================================
def test_model_inference(model_path, class_names_path, test_image_path):
    """Test the saved model on a single image."""
    import tensorflow as tf
    from tensorflow.keras.preprocessing import image

    # Load model and class names
    model = tf.keras.models.load_model(model_path)
    with open(class_names_path) as f:
        class_names = json.load(f)

    # Load and preprocess image
    img = image.load_img(test_image_path, target_size=(224, 224))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)

    # Predict
    predictions = model.predict(img_array, verbose=0)[0]
    top_idx = np.argmax(predictions)
    confidence = float(predictions[top_idx])
    predicted_class = class_names[str(top_idx)]

    print(f"\nTest Inference Result:")
    print(f"  Predicted: {predicted_class}")
    print(f"  Confidence: {confidence*100:.2f}%")
    print(f"  Threshold: {CONFIG['confidence_threshold']*100:.0f}%")

    if confidence < CONFIG["confidence_threshold"]:
        print("  ⚠️  Low confidence — suggest user try another image")
    else:
        print("  ✅ High confidence prediction")

    return predicted_class, confidence


# ============================================================
# ENTRY POINT
# ============================================================
if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Train Plant Disease CNN")
    parser.add_argument("--transfer", action="store_true",
                        help="Use MobileNetV2 transfer learning (recommended)")
    parser.add_argument("--test", type=str, default=None,
                        help="Path to test image for quick inference check")
    args = parser.parse_args()

    if args.test:
        # Test existing model
        test_model_inference("model.h5", "class_names.json", args.test)
    else:
        # Train new model
        model, history = train_model(use_transfer_learning=args.transfer)
        print("\nRun with --transfer flag for better accuracy using MobileNetV2")
