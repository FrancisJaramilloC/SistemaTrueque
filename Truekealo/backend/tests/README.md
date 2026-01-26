# Tests para Truekealo

Este directorio contiene todos los archivos de prueba del sistema.

## Estructura:
- `test_*.py` - Tests unitarios y de integración
- `verificar_*.py` - Scripts de verificación del sistema

## Ejecutar tests:

```bash
# Desde el directorio backend
pytest tests/

# Test específico
pytest tests/test_auth.py
```

## Nota:
Los tests requieren que el backend esté corriendo y la base de datos esté configurada.
