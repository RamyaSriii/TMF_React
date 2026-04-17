# 🌿 PhytoScan — Plant Disease Prediction & Pesticide Recommendation System

An end-to-end AI-powered web application that detects plant diseases from leaf images and provides targeted pesticide and treatment recommendations.

---

## 🚀 Live Demo Architecture

```
Browser (React) ──► Flask API (Python) ──► CNN Model (TensorFlow)
                           │
                           └──► disease_info.json (Knowledge Base)
```

---

## 📁 Project Structure

```
plant-disease-system/
│
├── 📂 backend/
│   ├── app.py                  # Flask API server (main)
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment variables template
│
├── 📂 frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js              # Root component with routing
│   │   ├── index.js            # React entry point
│   │   ├── components/
│   │   │   ├── Navbar.js/css   # Navigation bar
│   │   │   ├── ImageUploader.js/css   # Drag & drop uploader
│   │   │   ├── CameraCapture.js/css   # Live camera capture
│   │   │   └── ResultCard.js/css      # Prediction results display
│   │   ├── pages/
│   │   │   ├── HomePage.js/css        # Landing page
│   │   │   └── PredictionPage.js/css  # Main prediction UI
│   │   ├── hooks/
│   │   │   └── usePrediction.js       # API communication hook
│   │   └── styles/
│   │       └── global.css             # Global styles & theme
│   └── package.json
│
├── 📂 model/
│   ├── train.py                # CNN training script
│   ├── demo_model.py           # Generate demo model without dataset
│   ├── model.h5                # Trained model (generated)
│   └── class_names.json        # Class index → name mapping (generated)
│
├── 📂 data/
│   ├── disease_info.json       # 38-class knowledge base (pesticides, symptoms)
│   └── sample_images/          # Test images
│
└── README.md
```

---

## ⚙️ Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Python | 3.9+ | Backend & model |
| Node.js | 18+ | Frontend |
| pip | Latest | Python packages |
| npm | Latest | Node packages |

---

## 🛠️ Setup Instructions

### Step 1 — Clone / Download Project

```bash
cd plant-disease-system
```

### Step 2 — Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3 — Generate Demo Model (No Dataset Required)

```bash
# Navigate to model directory
cd ../model

# Generate demo model + class names JSON
python demo_model.py

# You should see:
# ✅ Class names saved to: class_names.json
# ✅ Demo model saved to: model.h5
```

> **Note:** The demo model has random weights and will return arbitrary predictions.
> For real accuracy, train with the PlantVillage dataset (see Training section below).

### Step 4 — Start Backend Server

```bash
# From project root
cd backend
python app.py

# Server starts at: http://localhost:5000
# Test it: curl http://localhost:5000/health
```

### Step 5 — Frontend Setup

```bash
# In a new terminal, from project root
cd frontend
npm install
npm start

# Opens at: http://localhost:3000
```

---

## 🧠 Training with Real Dataset

### Download PlantVillage Dataset

1. Go to: https://www.kaggle.com/datasets/vipoooool/new-plant-diseases-dataset
2. Download and extract to `data/plantvillage/`
3. Verify structure:
   ```
   data/plantvillage/
   ├── Apple___Apple_scab/
   ├── Apple___Black_rot/
   ├── Tomato___healthy/
   └── ... (38 class folders)
   ```

### Train the Model

```bash
cd model

# Option A: Custom CNN (faster, works on CPU)
python train.py

# Option B: MobileNetV2 Transfer Learning (better accuracy, recommended)
python train.py --transfer

# Test inference after training
python train.py --test ../data/sample_images/test_leaf.jpg
```

**Expected training results:**
- Custom CNN: ~85-88% validation accuracy
- MobileNetV2 (transfer): ~95-98% validation accuracy

---

## 🔌 API Reference

### `GET /health`
Check server status.

**Response:**
```json
{
  "status": "ok",
  "model": "loaded",
  "total_classes": 38,
  "confidence_threshold": 0.65
}
```

### `POST /predict`
Predict disease from image.

**Request:** `multipart/form-data` with `image` field

**Response:**
```json
{
  "disease": "Tomato Early Blight",
  "raw_class": "Tomato___Early_blight",
  "confidence": 91.5,
  "confidence_level": "high",
  "low_confidence_warning": false,
  "solution": {
    "plant": "Tomato",
    "symptoms": "Dark brown concentric ring spots...",
    "severity": "Medium-High",
    "pesticide": {
      "chemical": "Chlorothalonil (Daconil)",
      "dosage": "2 g per litre",
      "frequency": "Every 7-10 days",
      "application": "Start spraying at transplanting"
    },
    "organic_remedy": "Copper sulfate or Serenade",
    "precautions": ["Remove lower infected leaves", "..."],
    "prevention": "Crop rotation; resistant varieties"
  },
  "top3_predictions": [...],
  "inference_time_ms": 145
}
```

### `GET /diseases`
List all 38 supported disease classes.

---

## 🌐 Deployment

### Backend on Render.com (Free)

1. Create account at [render.com](https://render.com)
2. New → Web Service → Connect your GitHub repo
3. Settings:
   ```
   Root Directory: backend
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   ```
4. Add environment variable: `FLASK_ENV=production`
5. Upload `model.h5` and `class_names.json` to the service

### Frontend on Vercel (Free)

1. Install Vercel CLI: `npm i -g vercel`
2. Create `.env.production` in `frontend/`:
   ```
   REACT_APP_API_URL=https://your-backend.onrender.com
   ```
3. Deploy:
   ```bash
   cd frontend
   npm run build
   vercel --prod
   ```

### Frontend on Netlify (Alternative)

1. Build: `cd frontend && npm run build`
2. Drag `build/` folder to [netlify.com/drop](https://app.netlify.com/drop)
3. Set environment variable `REACT_APP_API_URL` in site settings

### Docker Deployment (Full Stack)

```dockerfile
# Backend Dockerfile (backend/Dockerfile)
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

---

## 🧪 Testing the API

```bash
# Health check
curl http://localhost:5000/health

# Predict disease (with an image file)
curl -X POST http://localhost:5000/predict \
  -F "image=@/path/to/leaf.jpg"

# List all diseases
curl http://localhost:5000/diseases
```

---

## 🏗️ Model Architecture

```
Input (224 × 224 × 3)
    │
    ▼
Conv2D(32) → BN → ReLU → Conv2D(32) → BN → ReLU → MaxPool → Dropout(0.25)
    │
    ▼
Conv2D(64) → BN → ReLU → Conv2D(64) → BN → ReLU → MaxPool → Dropout(0.25)
    │
    ▼
Conv2D(128) → BN → ReLU → Conv2D(128) → BN → ReLU → MaxPool → Dropout(0.25)
    │
    ▼
Conv2D(256) → BN → ReLU → MaxPool → Dropout(0.25)
    │
    ▼
Flatten → Dense(512) → BN → ReLU → Dropout(0.5)
    │
    ▼
Dense(38, softmax) → Prediction
```

**Key design choices:**
- `BatchNormalization` after every Conv layer for stable training
- `Dropout` at 0.25 after pooling, 0.5 before output to prevent overfitting
- `Adam` optimizer with `ReduceLROnPlateau` callback
- `EarlyStopping` to prevent overfitting on small datasets

---

## 🌿 Supported Plants & Diseases (38 Classes)

| Plant | Diseases Detected |
|-------|------------------|
| 🍎 Apple | Apple Scab, Black Rot, Cedar Apple Rust |
| 🍅 Tomato | Bacterial Spot, Early Blight, Late Blight, Leaf Mold, Septoria, Spider Mites, Target Spot, TYLCV, Mosaic Virus |
| 🥔 Potato | Early Blight, Late Blight |
| 🌽 Corn | Gray Leaf Spot, Common Rust, Northern Leaf Blight |
| 🍇 Grape | Black Rot, Esca, Isariopsis Leaf Spot |
| 🍊 Orange | Citrus Greening (HLB) |
| 🍑 Peach | Bacterial Spot |
| 🫑 Pepper | Bacterial Spot |
| 🍒 Cherry | Powdery Mildew |
| 🍓 Strawberry | Leaf Scorch |
| 🫘 Soybean | — (healthy only) |
| 🎃 Squash | Powdery Mildew |
| 🍒 Blueberry/Raspberry | — (healthy only) |

---

## 🔧 Confidence Threshold

The system uses a **65% confidence threshold**:
- **≥ 85%** — High confidence ✅
- **65–84%** — Medium confidence (result shown with note) ⚠️
- **< 65%** — Low confidence → "Try another image" warning shown ❌

Adjust in `backend/app.py`:
```python
CONFIDENCE_THRESHOLD = 0.65   # Change as needed
```

---

## 📋 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Backend server port |
| `FLASK_ENV` | `development` | `development` or `production` |
| `CONFIDENCE_THRESHOLD` | `0.65` | Min confidence for valid prediction |
| `REACT_APP_API_URL` | `http://localhost:5000` | Backend URL for frontend |

---

## ⚠️ Disclaimer

PhytoScan is an AI-assisted tool intended to support — not replace — professional agronomical advice. Always consult a certified plant pathologist or local agricultural extension service for final diagnosis and treatment decisions.

---

## 📜 License

MIT License — free for personal and commercial use.

---

*Built with TensorFlow, Flask, React, and the PlantVillage dataset.*
