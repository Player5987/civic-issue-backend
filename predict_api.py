# predict_api.py
import torch
from torch.nn import functional as F
from fastapi import FastAPI, UploadFile, Form
from fastapi.responses import JSONResponse
from transformers import BertTokenizer
from PIL import Image
from torchvision import transforms
import io

from model import CivicIssueModel  # your fixed model.py

app = FastAPI()

# ------------------------
# 1. Setup
# ------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load tokenizer
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

# Image preprocessing
image_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# Load trained model
model = CivicIssueModel(category_classes=5, priority_classes=4).to(device)
model.load_state_dict(torch.load("models/multi_modal_model.pth", map_location=device))
model.eval()


# ------------------------
# 2. API Route
# ------------------------
@app.post("/predict")
async def predict(
    text: str = Form(...),
    lat: float = Form(...),
    lon: float = Form(...),
    file: UploadFile = None
):
    try:
        # ---- Text ----
        inputs = tokenizer(
            text, return_tensors="pt", padding="max_length",
            truncation=True, max_length=32
        )
        input_ids = inputs["input_ids"].to(device)
        attention_mask = inputs["attention_mask"].to(device)

        # ---- Image ----
        if file:
            contents = await file.read()
            img = Image.open(io.BytesIO(contents)).convert("RGB")
            img = image_transform(img).unsqueeze(0).to(device)
        else:
            return JSONResponse({"error": "Image file required"}, status_code=400)

        # ---- Metadata ----
        metadata = torch.tensor([[lat, lon]], dtype=torch.float).to(device)

        # ---- Forward Pass ----
        with torch.no_grad():
            category_logits, priority_logits = model(input_ids, attention_mask, img, metadata)
            category_pred = torch.argmax(F.softmax(category_logits, dim=1), dim=1).item()
            priority_pred = torch.argmax(F.softmax(priority_logits, dim=1), dim=1).item()

        return {
            "category_prediction": int(category_pred),
            "priority_prediction": int(priority_pred)
        }

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
