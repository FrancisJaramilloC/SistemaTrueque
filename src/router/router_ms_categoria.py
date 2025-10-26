import os
from fastapi import APIRouter, HTTPException
import httpx

# Base URL del microservicio de categorías (puede sobreescribirse con variable de entorno)
MICRO_CAT_URL = os.getenv("MICRO_CAT_URL", "http://localhost:8000")

ms_categoria_router = APIRouter()

@ms_categoria_router.get("/api/categoria")
async def proxy_get_categorias():
    url = f"{MICRO_CAT_URL}/api/categorias/api/categoria"
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url)
    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()

@ms_categoria_router.post("/api/categoria/create")
async def proxy_create_categoria(payload: dict):
    url = f"{MICRO_CAT_URL}/api/categorias/api/categoria/create"
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(url, json=payload)
    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()

@ms_categoria_router.patch("/api/categoria/update/{id}")
async def proxy_patch_categoria(id: int, payload: dict):
    url = f"{MICRO_CAT_URL}/api/categorias/api/categoria/update/{id}"
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.patch(url, json=payload)
    if resp.status_code >= 400:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()
