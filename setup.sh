#!/bin/bash
# ============================================================
# PhytoScan Quick Setup Script
# Run: chmod +x setup.sh && ./setup.sh
# ============================================================

set -e  # Exit on error

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "🌿 ======================================"
echo "   PhytoScan — Plant Disease AI Setup"
echo "   ======================================"
echo ""

# ── Step 1: Python Virtual Environment ──────────────────────
echo -e "${YELLOW}[1/5] Setting up Python virtual environment...${NC}"

cd backend
python3 -m venv venv

# Activate based on OS
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

pip install --upgrade pip -q
pip install -r requirements.txt -q
echo -e "${GREEN}✅ Python environment ready${NC}"
cd ..

# ── Step 2: Generate Demo Model ──────────────────────────────
echo ""
echo -e "${YELLOW}[2/5] Generating demo model...${NC}"

cd model
python demo_model.py
cd ..
echo -e "${GREEN}✅ Demo model created${NC}"

# ── Step 3: Frontend Dependencies ────────────────────────────
echo ""
echo -e "${YELLOW}[3/5] Installing frontend dependencies...${NC}"

cd frontend
npm install --silent
echo -e "${GREEN}✅ Node modules installed${NC}"
cd ..

# ── Step 4: Environment Files ─────────────────────────────────
echo ""
echo -e "${YELLOW}[4/5] Setting up environment files...${NC}"

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "   Created backend/.env"
fi

if [ ! -f frontend/.env.local ]; then
    cp frontend/.env.example frontend/.env.local
    echo "   Created frontend/.env.local"
fi

echo -e "${GREEN}✅ Environment files ready${NC}"

# ── Step 5: Done ──────────────────────────────────────────────
echo ""
echo -e "${GREEN}[5/5] Setup complete! 🎉${NC}"
echo ""
echo "======================================"
echo "  HOW TO RUN:"
echo "======================================"
echo ""
echo "  Terminal 1 — Start Backend:"
echo "    cd backend"
echo "    source venv/bin/activate  # (Linux/Mac)"
echo "    python app.py"
echo ""
echo "  Terminal 2 — Start Frontend:"
echo "    cd frontend"
echo "    npm start"
echo ""
echo "  Then open: http://localhost:3000"
echo ""
echo -e "${YELLOW}  Note: Using demo model with random predictions."
echo -e "  Train with real data: cd model && python train.py --transfer${NC}"
echo ""
