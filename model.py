# multi_modal_model.py
import torch
import torch.nn as nn
from transformers import BertModel
from torchvision import models

# ------------------------
# 1. Text Encoder (BERT)
# ------------------------
class TextEncoder(nn.Module):
    def __init__(self, pretrained_model='bert-base-uncased', out_dim=128):
        super().__init__()
        self.bert = BertModel.from_pretrained(pretrained_model)
        self.fc = nn.Linear(self.bert.config.hidden_size, out_dim)
        self.dropout = nn.Dropout(0.2)
    
    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        cls_embedding = outputs.last_hidden_state[:, 0, :]  # [CLS]
        out = self.dropout(torch.relu(self.fc(cls_embedding)))
        return out  # [batch, out_dim]

# ------------------------
# 2. Image Encoder (ResNet)
# ------------------------
class ImageEncoder(nn.Module):
    def __init__(self, out_dim=128):
        super().__init__()
        resnet = models.resnet50(pretrained=True)
        modules = list(resnet.children())[:-1]  # remove final fc
        self.resnet = nn.Sequential(*modules)
        self.fc = nn.Linear(resnet.fc.in_features, out_dim)
        self.dropout = nn.Dropout(0.2)
    
    def forward(self, x):
        features = self.resnet(x)  # [B, 2048, 1, 1]
        features = features.view(features.size(0), -1)
        out = self.dropout(torch.relu(self.fc(features)))
        return out  # [batch, out_dim]

# ------------------------
# 3. Metadata Encoder
# ------------------------
class MetadataEncoder(nn.Module):
    def __init__(self, input_dim=2, out_dim=32):  # e.g., lat/lon
        super().__init__()
        self.fc = nn.Sequential(
            nn.Linear(input_dim, 64),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(64, out_dim),
            nn.ReLU()
        )
    
    def forward(self, x):
        return self.fc(x)  # [batch, out_dim]

# ------------------------
# 4. Multi-modal Fusion + Heads
# ------------------------
class MultiModalClassifier(nn.Module):
    def __init__(self, text_dim=128, image_dim=128, meta_dim=32,
                 category_classes=7, priority_classes=4):
        super().__init__()
        fusion_dim = text_dim + image_dim + meta_dim
        self.fusion = nn.Sequential(
            nn.Linear(fusion_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.1)
        )
        self.category_head = nn.Linear(128, category_classes)
        self.priority_head = nn.Linear(128, priority_classes)
    
    def forward(self, text_emb, image_emb, meta_emb):
        fused = torch.cat([text_emb, image_emb, meta_emb], dim=1)
        features = self.fusion(fused)
        category_logits = self.category_head(features)
        priority_logits = self.priority_head(features)
        return category_logits, priority_logits

# ------------------------
# 5. Full Model Wrapper
# ------------------------
class CivicIssueModel(nn.Module):
    def __init__(self, category_classes=7, priority_classes=4):
        super().__init__()
        self.text_encoder = TextEncoder(out_dim=128)
        self.image_encoder = ImageEncoder(out_dim=128)
        self.meta_encoder = MetadataEncoder(input_dim=2, out_dim=32)
        self.fusion_model = MultiModalClassifier(
            text_dim=128, image_dim=128, meta_dim=32,
            category_classes=category_classes,
            priority_classes=priority_classes
        )

    def forward(self, input_ids, attention_mask, images, metadata):
        text_emb = self.text_encoder(input_ids, attention_mask)
        image_emb = self.image_encoder(images)
        meta_emb = self.meta_encoder(metadata)
        return self.fusion_model(text_emb, image_emb, meta_emb)
