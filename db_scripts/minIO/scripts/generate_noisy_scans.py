from pathlib import Path
import random

from PIL import Image, ImageFilter


RAW_DIR = Path("data/raw/invoices")
NOISY_DIR = Path("data/raw/invoices_noisy")


def add_noise(img: Image.Image) -> Image.Image:
    angle = random.uniform(-3, 3)
    img = img.rotate(angle, expand=True, fillcolor="white")

    if random.random() < 0.5:
        img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.5, 1.5)))

    return img


def process_all() -> None:
    NOISY_DIR.mkdir(parents=True, exist_ok=True)

    for path in RAW_DIR.glob("*"):
        if path.suffix.lower() not in [".png", ".jpg", ".jpeg"]:
            continue
        img = Image.open(path)
        img_noisy = add_noise(img)
        out_path = NOISY_DIR / path.name
        img_noisy.save(out_path)
        print(f"Noisy image saved to {out_path}")


if __name__ == "__main__":
    process_all()

