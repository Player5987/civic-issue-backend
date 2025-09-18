import os
import pandas as pd
from PIL import Image, ImageDraw

# Ensure folders exist
os.makedirs("data/images", exist_ok=True)

# Define 5 issues
issues = [
    ("Pothole near the main street", "pothole_01.jpg", 28.6139, 77.2090, 0, 2),
    ("Overflowing trash bin in the park", "garbage_01.jpg", 28.6140, 77.2080, 1, 1),
    ("Streetlight not working near bus stop", "streetlight_01.jpg", 28.6150, 77.2070, 2, 3),
    ("Fallen tree branch blocking footpath", "obstacle_01.jpg", 28.6160, 77.2060, 3, 2),
    ("Graffiti on the wall of community center", "graffiti_01.jpg", 28.6170, 77.2050, 4, 0),
]

# Build CSV data
rows = []
for text, fname, lat, lon, cat, prio in issues:
    # Create dummy image
    img = Image.new("RGB", (224, 224), color=(200, 200, 200))
    draw = ImageDraw.Draw(img)
    draw.text((40, 100), fname.split("_")[0], fill=(0, 0, 0))
    img.save(f"data/images/{fname}")

    # Add row for CSV
    rows.append([text, f"data/images/{fname}", lat, lon, cat, prio])

# Save CSV
df = pd.DataFrame(rows, columns=["text", "image_path", "lat", "lon", "category_label", "priority_label"])
df.to_csv("data/reports.csv", index=False)

print("✅ Dataset prepared!")
print("📄 CSV saved to data/reports.csv")
print("🖼️ Images saved to data/images/")
