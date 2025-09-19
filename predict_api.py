from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
import torch
import os
from model import MultiModalClassifier, TextEncoder, ImageEncoder, MetadataEncoder
from transformers import BertTokenizer
from torchvision import transforms
from PIL import Image
import pandas as pd
import gdown

app = FastAPI()

# -------------------------------
# Paths and Google Drive link
# -------------------------------
MODEL_PATH = "models/multi_modal_model_clean.pth"
URL = "https://drive.google.com/uc?id=1vwCo7E_1a2DdsL7jvR_al8WHzDnbWV77"  # ✅ Correct format

# -------------------------------
# Download model if not already present
# -------------------------------
if not os.path.exists(MODEL_PATH):
    os.makedirs("models", exist_ok=True)
    print("📥 Downloading model from Google Drive...")
    gdown.download(URL, MODEL_PATH, quiet=False)

# -------------------------------
# Load model and tokenizer
# -------------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Instantiate model
text_encoder = TextEncoder(out_dim=128)
image_encoder = ImageEncoder(out_dim=128)
meta_encoder = MetadataEncoder(input_dim=2, out_dim=32)  # lat/lon
model = MultiModalClassifier(
    text_dim=128,
    image_dim=128,
    meta_dim=32,
    category_classes=7,
    priority_classes=4
)

# Load trained weights (PyTorch 2.6 fix)
try:
    state_dict = torch.load(
        MODEL_PATH,
        map_location=device,
        weights_only=False  # ✅ important for PyTorch >= 2.6
    )
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    print("✅ Model loaded successfully!")
except FileNotFoundError:
    print("⚠️ Model not found. Please train first!")
except Exception as e:
    print("❌ Error loading model:", e)

tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

# Image transforms
image_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# -------------------------------
# Endpoint: Prediction
# -------------------------------
@app.post("/predict")
async def predict_issue(
    description: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    file: UploadFile = File(...)
):
    try:
        # 1. Process text
        text_inputs = tokenizer(description, return_tensors="pt", padding=True, truncation=True)
        text_emb = text_encoder(text_inputs["input_ids"], text_inputs["attention_mask"])

        # 2. Process image
        img = Image.open(file.file).convert("RGB")
        img = image_transform(img).unsqueeze(0)
        image_emb = image_encoder(img)

        # 3. Process metadata
        meta = torch.tensor([[latitude, longitude]], dtype=torch.float32)
        meta_emb = meta_encoder(meta)

        # 4. Run model
        with torch.no_grad():
            category_logits, priority_logits = model(text_emb, image_emb, meta_emb)

        # 5. Convert predictions to labels
        category_pred = torch.argmax(category_logits, dim=1).item()
        priority_pred = torch.argmax(priority_logits, dim=1).item()

        # -------------------------------
        # Save inputs + outputs
        # -------------------------------
        os.makedirs("data/user_reports", exist_ok=True)
        df = pd.DataFrame([{
            "description": description,
            "latitude": latitude,
            "longitude": longitude,
            "category_pred": category_pred,
            "priority_pred": priority_pred
        }])
        df.to_csv(
            "data/user_reports/predictions.csv",
            mode="a",
            header=not os.path.exists("data/user_reports/predictions.csv"),
            index=False
        )

        return JSONResponse({
            "category_prediction": category_pred,
            "priority_prediction": priority_pred
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)

