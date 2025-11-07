from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# ============= OFERTAS =============

class OfertaCreateRequest(BaseModel):
    """Request para crear una nueva oferta"""
    articulo_ofrecido_id: int
    articulo_solicitado_id: int
    mensaje: Optional[str] = None

class OfertaResponse(BaseModel):
    """Response de oferta completa"""
    id: int
    articulo_ofrecido_id: int
    articulo_solicitado_id: int
    usuario_ofertante_id: int
    usuario_receptor_id: int
    estado: str
    mensaje: Optional[str] = None
    fecha_creacion: datetime
    fecha_respuesta: Optional[datetime] = None

class OfertaConDetalles(BaseModel):
    """Oferta con detalles de los artículos"""
    oferta: OfertaResponse
    articulo_ofrecido: dict
    articulo_solicitado: dict

# ============= CONTRAOFERTAS =============

class ContraofertaCreateRequest(BaseModel):
    """Request para crear contraoferta"""
    oferta_original_id: int
    articulo_alternativo_id: int
    mensaje: Optional[str] = None

# ============= TRUEQUES =============

class TruequeDetalleResponse(BaseModel):
    """Response del historial de trueques"""
    id: int
    trueque_id: int
    oferta_id: int
    articulo1_id: int
    articulo2_id: int
    usuario1_id: int
    usuario2_id: int
    fecha_trueque: datetime
    notas: Optional[str] = None
    estado_final: str

class HistorialTruequeResponse(BaseModel):
    """Response del historial completo"""
    trueque: TruequeDetalleResponse
    articulo1: dict
    articulo2: dict
