import os
import uuid
from pathlib import Path
from PIL import Image
from fastapi import UploadFile
import shutil

UPLOAD_DIR = Path("uploads/articulos")
THUMBNAIL_DIR = Path("uploads/thumbnails")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
THUMBNAIL_SIZE = (200, 200)

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
THUMBNAIL_DIR.mkdir(parents=True, exist_ok=True)

def validate_image(file: UploadFile) -> bool:
    ext = Path(file.filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS

def generate_unique_filename(original_filename: str) -> str:
    ext = Path(original_filename).suffix.lower()
    return f"{uuid.uuid4()}{ext}"

async def save_upload_file(file: UploadFile) -> tuple[str, str]:
    if not validate_image(file):
        raise ValueError("Formato de imagen no permitido. Use: jpg, jpeg, png, gif, webp")
    
    filename = generate_unique_filename(file.filename)
    file_path = UPLOAD_DIR / filename
    thumbnail_path = THUMBNAIL_DIR / filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        with Image.open(file_path) as img:
            if img.mode in ("RGBA", "LA", "P"):
                background = Image.new("RGB", img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
                img = background
            
            img.thumbnail(THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
            img.save(thumbnail_path, quality=85, optimize=True)
    except Exception as e:
        if file_path.exists():
            file_path.unlink()
        raise ValueError(f"Error al procesar la imagen: {str(e)}")
    
    return f"uploads/articulos/{filename}", f"uploads/thumbnails/{filename}"

def delete_image_files(imagen_url: str | None, thumbnail_url: str | None):
    if imagen_url:
        img_path = Path(imagen_url)
        if img_path.exists():
            img_path.unlink()
    if thumbnail_url:
        thumb_path = Path(thumbnail_url)
        if thumb_path.exists():
            thumb_path.unlink()
