# train.py
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import pandas as pd
from PIL import Image
from torchvision import transforms
from transformers import BertTokenizer
from model import CivicIssueModel

import os
os.makedirs("models", exist_ok=True)
os.makedirs("data/user_images", exist_ok=True)


# ------------------------
# 1. Dataset Class
# ------------------------
class CivicDataset(Dataset):
    def __init__(self, csv_file, tokenizer, transform=None):
        self.data = pd.read_csv(csv_file)
        self.tokenizer = tokenizer
        self.transform = transform

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        row = self.data.iloc[idx]

        # Text
        inputs = self.tokenizer(
            str(row["text"]),
            return_tensors="pt",
            padding="max_length",
            truncation=True,
            max_length=32
        )
        input_ids = inputs["input_ids"].squeeze(0)
        attention_mask = inputs["attention_mask"].squeeze(0)

        # Image
        img = Image.open(row["image_path"]).convert("RGB")
        if self.transform:
            img = self.transform(img)

        # Metadata
        metadata = torch.tensor([row["lat"], row["lon"]], dtype=torch.float)

        # Labels
        category = torch.tensor(int(row["category_label"]), dtype=torch.long)
        priority = torch.tensor(int(row["priority_label"]), dtype=torch.long)

        return {
            "input_ids": input_ids,
            "attention_mask": attention_mask,
            "images": img,
            "metadata": metadata,
            "category": category,
            "priority": priority,
        }

# ------------------------
# 2. Setup
# ------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")

image_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

dataset = CivicDataset("data/reports.csv", tokenizer, transform=image_transform)
dataloader = DataLoader(dataset, batch_size=2, shuffle=True)

# ------------------------
# 3. Model + Training Utils
# ------------------------
model = CivicIssueModel(category_classes=5, priority_classes=4).to(device)  # adjust classes if needed
criterion = nn.CrossEntropyLoss()
optimizer = optim.AdamW(model.parameters(), lr=1e-4)

# ------------------------
# 4. Training Loop
# ------------------------
for epoch in range(3):  # try 3 epochs first
    model.train()
    total_loss = 0

    for batch in dataloader:
        input_ids = batch["input_ids"].to(device)
        attention_mask = batch["attention_mask"].to(device)
        images = batch["images"].to(device)
        metadata = batch["metadata"].to(device)
        category_labels = batch["category"].to(device)
        priority_labels = batch["priority"].to(device)

        optimizer.zero_grad()
        category_logits, priority_logits = model(input_ids, attention_mask, images, metadata)

        loss_cat = criterion(category_logits, category_labels)
        loss_prio = criterion(priority_logits, priority_labels)
        loss = loss_cat + loss_prio

        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    print(f"Epoch {epoch+1}, Loss: {total_loss/len(dataloader):.4f}")

# ------------------------
# 5. Save Model
# ------------------------
torch.save(model.state_dict(), "models/multi_modal_model.pth")
print("✅ Model saved to models/multi_modal_model.pth")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
