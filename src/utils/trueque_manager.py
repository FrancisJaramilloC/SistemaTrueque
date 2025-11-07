from sqlalchemy import select
from datetime import datetime, date
from fastapi import HTTPException
from config.db import engine
from src.model.articulo import articulos
from src.model.oferta import ofertas
from src.model.trueque import trueques
from src.model.trueque_detalle import trueques_detalle

class TruequeManager:
    """Gestor de lógica de negocio para trueques"""
    
    @staticmethod
    def validar_articulo_disponible(articulo_id: int, conn) -> dict:
        """Valida que un artículo exista y esté disponible"""
        articulo = conn.execute(
            select(articulos).where(articulos.c.id == articulo_id)
        ).fetchone()
        
        if not articulo:
            raise HTTPException(status_code=404, detail=f"Artículo {articulo_id} no encontrado")
        
        # Comparar en minúsculas para evitar problemas de mayúsculas/minúsculas
        if (articulo.estado or "").lower() != "disponible":
            raise HTTPException(
                status_code=400, 
                detail=f"Artículo {articulo_id} no está disponible (estado: {articulo.estado})"
            )
        
        return dict(articulo._mapping)
    
    @staticmethod
    def validar_propiedad_articulo(articulo_id: int, usuario_id: int, conn):
        """Valida que el usuario sea dueño del artículo"""
        articulo = conn.execute(
            select(articulos).where(articulos.c.id == articulo_id)
        ).fetchone()
        
        if not articulo:
            raise HTTPException(status_code=404, detail="Artículo no encontrado")
        
        if articulo.id_usuario != usuario_id:
            raise HTTPException(
                status_code=403, 
                detail="No eres el propietario de este artículo"
            )
    
    @staticmethod
    def cambiar_estado_articulo(articulo_id: int, nuevo_estado: str, conn):
        """Cambia el estado de un artículo"""
        estados_validos = ["disponible", "reservado", "trueque-completado"]
        
        if nuevo_estado.lower() not in estados_validos:
            raise ValueError(f"Estado inválido: {nuevo_estado}")
        
        # Guardar el estado con la primera letra mayúscula para coincidir con la BD
        if nuevo_estado == "trueque-completado":
            estado_bd = "Trueque-completado"
        else:
            estado_bd = nuevo_estado.capitalize()
        
        conn.execute(
            articulos.update()
            .where(articulos.c.id == articulo_id)
            .values(estado=estado_bd)
        )
    
    @staticmethod
    def crear_trueque_completo(oferta_id: int, conn):
        """Crea un trueque y actualiza los estados de los artículos"""
        # Obtener la oferta
        oferta = conn.execute(
            select(ofertas).where(ofertas.c.id == oferta_id)
        ).fetchone()
        
        if not oferta:
            raise HTTPException(status_code=404, detail="Oferta no encontrada")
        
        # Crear registro en trueques
        result_trueque = conn.execute(
            trueques.insert().values({
                "fecha": date.today(),   # << usar date para columna Date
                "idOferta": oferta_id
            })
        )
        trueque_id = result_trueque.inserted_primary_key[0]
        
        # Crear detalle del trueque
        conn.execute(trueques_detalle.insert().values({
            "trueque_id": trueque_id,
            "oferta_id": oferta_id,
            "articulo1_id": oferta.articulo_ofrecido_id,
            "articulo2_id": oferta.articulo_solicitado_id,
            "usuario1_id": oferta.usuario_ofertante_id,
            "usuario2_id": oferta.usuario_receptor_id,
            "fecha_trueque": datetime.utcnow(),
            "notas": "Trueque completado exitosamente",
            "estado_final": "completado"
        }))
        
        # Actualizar estado de ambos artículos
        TruequeManager.cambiar_estado_articulo(
            oferta.articulo_ofrecido_id, 
            "trueque-completado", 
            conn
        )
        TruequeManager.cambiar_estado_articulo(
            oferta.articulo_solicitado_id, 
            "trueque-completado", 
            conn
        )
        
        return trueque_id
