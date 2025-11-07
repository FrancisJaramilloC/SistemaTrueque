from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select
from datetime import datetime
from config.db import engine
from src.model.articulo import articulos
from src.schema.articulo_schema import ArticuloSchema
from src.utils.image_handler import save_upload_file, delete_image_files

articulo_router = APIRouter()

def get_usuario_actual():
    return {"id": 1}

@articulo_router.get("/api/articulos")
def get_articulos():
    """Obtener todos los artículos"""
    with engine.connect() as conn:
        result = conn.execute(articulos.select()).fetchall()
        return [dict(row._mapping) for row in result]

@articulo_router.get("/api/articulo/{id}")
def get_articulo(id: int):
    """Obtener un artículo por ID"""
    with engine.connect() as conn:
        result = conn.execute(articulos.select().where(articulos.c.id == id)).fetchone()
        if result:
            return dict(result._mapping)
        raise HTTPException(status_code=404, detail=f"No se encontró artículo con id {id}")

@articulo_router.post("/api/articulo/create")
def create_articulo_sin_imagen(data_articulo: ArticuloSchema):
    """
    Crear un artículo SIN imagen
    
    Ejemplo JSON:
    {
        "descripcion": "Laptop HP",
        "categoria": "Electrónica",
        "estado": "disponible",
        "id_usuario": 1
    }
    """
    print(f"📝 Creando artículo: {data_articulo.descripcion}")
    
    new_articulo = {
        "descripcion": data_articulo.descripcion,
        "categoria": data_articulo.categoria,
        "estado": data_articulo.estado,
        "fecha": datetime.now(),
        "id_usuario": data_articulo.id_usuario,
        "imagen_url": None,
        "thumbnail_url": None
    }
    
    try:
        with engine.begin() as connection:
            result = connection.execute(articulos.insert().values(new_articulo))
            articulo_id = result.inserted_primary_key[0]
        
        print(f"✅ Artículo {articulo_id} creado")
        
        return {
            "message": "Artículo creado correctamente",
            "id": articulo_id
        }
    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@articulo_router.post("/api/articulo/create-con-imagen")
async def create_articulo_con_imagen(
    descripcion: str = Form(...),
    categoria: str = Form(...),
    estado: str = Form(...),
    id_usuario: str = Form(...),  # Cambiado a str temporalmente
    imagen: UploadFile = File(...)
):
    """
    Crear un artículo CON imagen
    
    - **descripcion**: Descripción del artículo
    - **categoria**: Nombre de la categoría (ej: "Electrónica")
    - **estado**: Estado (ej: "disponible", "reservado", "vendido")
    - **id_usuario**: ID del usuario propietario
    - **imagen**: Archivo de imagen (jpg, png, gif, webp)
    """
    print(f"📝 Creando artículo con imagen: {imagen.filename}")
    
    # Convertir id_usuario a entero
    try:
        id_usuario_int = int(id_usuario)
    except ValueError:
        raise HTTPException(status_code=400, detail="id_usuario debe ser un número")
    
    try:
        imagen_url, thumbnail_url = await save_upload_file(imagen)
        print(f"✅ Imagen guardada: {imagen_url}")
    except Exception as e:
        print(f"❌ Error al guardar imagen: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    new_articulo = {
        "descripcion": descripcion,
        "categoria": categoria,
        "estado": estado,
        "fecha": datetime.now(),
        "id_usuario": id_usuario_int,  # Usar el entero convertido
        "imagen_url": imagen_url,
        "thumbnail_url": thumbnail_url
    }
    
    try:
        with engine.begin() as connection:
            result = connection.execute(articulos.insert().values(new_articulo))
            articulo_id = result.inserted_primary_key[0]
        
        print(f"✅ Artículo {articulo_id} creado con imagen")
        
        return {
            "message": "Artículo con imagen creado correctamente",
            "id": articulo_id,
            "imagen_url": f"http://127.0.0.1:8000/{imagen_url}",
            "thumbnail_url": f"http://127.0.0.1:8000/{thumbnail_url}"
        }
    except Exception as e:
        print(f"❌ Error: {e}")
        delete_image_files(imagen_url, thumbnail_url)
        raise HTTPException(status_code=500, detail=str(e))

@articulo_router.put("/api/articulo/update/{articulo_id}")
async def update_articulo(
    articulo_id: int,
    descripcion: str = Form(None),
    categoria: str = Form(None),
    estado: str = Form(None)
):
    """Actualizar datos de un artículo"""
    with engine.connect() as conn:
        articulo = conn.execute(select(articulos).where(articulos.c.id == articulo_id)).fetchone()
        
        if not articulo:
            raise HTTPException(status_code=404, detail="Artículo no encontrado")
    
    update_data = {}
    if descripcion is not None:
        update_data["descripcion"] = descripcion
    if categoria is not None:
        update_data["categoria"] = categoria
    if estado is not None:
        update_data["estado"] = estado
    
    if update_data:
        with engine.begin() as connection:
            connection.execute(
                articulos.update().where(articulos.c.id == articulo_id).values(update_data)
            )
    
    return {"message": "Artículo actualizado correctamente"}

@articulo_router.put("/api/articulo/update-imagen/{articulo_id}")
async def update_imagen_articulo(
    articulo_id: int,
    imagen: UploadFile = File(...)
):
    """Actualizar solo la imagen"""
    with engine.connect() as conn:
        articulo = conn.execute(select(articulos).where(articulos.c.id == articulo_id)).fetchone()
        
        if not articulo:
            raise HTTPException(status_code=404, detail="Artículo no encontrado")
        
        if articulo.imagen_url or articulo.thumbnail_url:
            delete_image_files(articulo.imagen_url, articulo.thumbnail_url)
    
    try:
        imagen_url, thumbnail_url = await save_upload_file(imagen)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    with engine.begin() as connection:
        connection.execute(
            articulos.update()
            .where(articulos.c.id == articulo_id)
            .values(imagen_url=imagen_url, thumbnail_url=thumbnail_url)
        )
    
    return {
        "message": "Imagen actualizada correctamente",
        "imagen_url": f"http://127.0.0.1:8000/{imagen_url}",
        "thumbnail_url": f"http://127.0.0.1:8000/{thumbnail_url}"
    }

@articulo_router.delete("/api/articulo/delete/{articulo_id}")
def delete_articulo(articulo_id: int): 
    """Eliminar artículo e imágenes"""
    with engine.connect() as conn:
        articulo = conn.execute(select(articulos).where(articulos.c.id == articulo_id)).fetchone()

        if not articulo:
            raise HTTPException(status_code=404, detail="Artículo no encontrado")

        if articulo.imagen_url or articulo.thumbnail_url:
            delete_image_files(articulo.imagen_url, articulo.thumbnail_url)

    with engine.begin() as connection:
        connection.execute(articulos.delete().where(articulos.c.id == articulo_id))
    
    return {"message": "Artículo eliminado correctamente"}

@articulo_router.get("/api/articulos/categoria/{categoria}")
def get_articulos_por_categoria(categoria: str):
    """Artículos por categoría"""
    with engine.connect() as conn:
        result = conn.execute(
            articulos.select().where(articulos.c.categoria == categoria)
        ).fetchall()
        return [dict(row._mapping) for row in result]

@articulo_router.get("/api/articulos/usuario/{id_usuario}")
def get_articulos_por_usuario(id_usuario: int):
    """Artículos por usuario"""
    with engine.connect() as conn:
        result = conn.execute(
            articulos.select().where(articulos.c.id_usuario == id_usuario)
        ).fetchall()
        return [dict(row._mapping) for row in result]



