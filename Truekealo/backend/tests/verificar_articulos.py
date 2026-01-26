"""
Script para verificar y limpiar artículos en la base de datos
- Muestra todos los artículos
- Identifica artículos sin propietario o con datos inconsistentes
- Opcionalmente limpia artículos de prueba

NOTA: Ejecutar desde el directorio Truekealo/backend
"""
import sys
import os

# Cambiar al directorio backend si no estamos ahí
if not os.path.exists('app'):
    if os.path.exists('backend/app'):
        os.chdir('backend')
        print("📁 Cambiando a directorio backend...")
    else:
        print("❌ Error: No se encuentra el directorio 'app'")
        print(f"   Directorio actual: {os.getcwd()}")
        sys.exit(1)

from app.database import SessionLocal
from app.models.articulo import Articulo
from app.models.user import User

def verificar_articulos():
    print("=" * 70)
    print("VERIFICACIÓN DE ARTÍCULOS EN BASE DE DATOS")
    print("=" * 70)
    
    db = SessionLocal()
    
    try:
        # Contar todos los artículos
        total_articulos = db.query(Articulo).count()
        print(f"\n📊 Total de artículos en BD: {total_articulos}")
        
        if total_articulos == 0:
            print("\n✅ No hay artículos en la base de datos")
            return
        
        # Artículos por estado
        print("\n📋 ARTÍCULOS POR ESTADO:")
        print("-" * 70)
        
        estados = db.query(Articulo.estado_articulo, db.func.count(Articulo.id)).group_by(Articulo.estado_articulo).all()
        for estado, count in estados:
            print(f"  {estado.value if estado else 'NULL'}: {count} artículos")
        
        # Listar todos los artículos
        print("\n📦 LISTA DE TODOS LOS ARTÍCULOS:")
        print("-" * 70)
        
        articulos = db.query(Articulo).all()
        articulos_problematicos = []
        
        for art in articulos:
            propietario = db.query(User).filter(User.id == art.propietario_id).first()
            
            # Identificar artículos problemáticos
            es_problematico = False
            problemas = []
            
            if not propietario:
                es_problematico = True
                problemas.append("Sin propietario")
            
            if not art.estado_articulo:
                es_problematico = True
                problemas.append("Sin estado")
            
            # Detectar posibles datos de prueba/ejemplo
            titulo_lower = art.titulo.lower()
            if any(palabra in titulo_lower for palabra in ['test', 'prueba', 'ejemplo', 'demo', 'mock']):
                es_problematico = True
                problemas.append("Posible dato de prueba")
            
            if es_problematico:
                articulos_problematicos.append((art, problemas))
            
            # Mostrar artículo
            estado_icon = "✅" if art.estado_articulo and art.estado_articulo.value == "publicado" else "⚠️"
            propietario_nombre = propietario.nombre_completo if propietario else "❌ SIN PROPIETARIO"
            
            print(f"\n{estado_icon} ID: {art.id}")
            print(f"   Título: {art.titulo}")
            print(f"   Estado: {art.estado_articulo.value if art.estado_articulo else '❌ NULL'}")
            print(f"   Propietario: {propietario_nombre}")
            print(f"   Categoría: {art.categoria.value if art.categoria else 'NULL'}")
            print(f"   Valor: ${art.valor_estimado}")
            print(f"   Creado: {art.created_at}")
            
            if es_problematico:
                print(f"   ⚠️ PROBLEMAS: {', '.join(problemas)}")
        
        # Resumen de artículos problemáticos
        if articulos_problematicos:
            print("\n" + "=" * 70)
            print(f"⚠️ ENCONTRADOS {len(articulos_problematicos)} ARTÍCULOS CON PROBLEMAS")
            print("=" * 70)
            
            print("\nOpciones:")
            print("1. Eliminar artículos sin propietario")
            print("2. Eliminar artículos de prueba/ejemplo")
            print("3. Actualizar artículos sin estado a 'publicado'")
            print("4. Salir sin cambios")
            
            try:
                opcion = input("\nSelecciona una opción (1-4): ").strip()
                
                if opcion == "1":
                    eliminar_sin_propietario(db)
                elif opcion == "2":
                    eliminar_prueba(db)
                elif opcion == "3":
                    actualizar_sin_estado(db)
                elif opcion == "4":
                    print("\n✅ Saliendo sin realizar cambios")
                else:
                    print("\n❌ Opción inválida")
            except KeyboardInterrupt:
                print("\n\n✅ Operación cancelada")
        else:
            print("\n" + "=" * 70)
            print("✅ TODOS LOS ARTÍCULOS ESTÁN CORRECTOS")
            print("=" * 70)
        
    finally:
        db.close()


def eliminar_sin_propietario(db):
    """Elimina artículos sin propietario válido"""
    print("\n🗑️ Eliminando artículos sin propietario...")
    
    articulos = db.query(Articulo).all()
    eliminados = 0
    
    for art in articulos:
        propietario = db.query(User).filter(User.id == art.propietario_id).first()
        if not propietario:
            print(f"   Eliminando: {art.titulo} (ID: {art.id})")
            db.delete(art)
            eliminados += 1
    
    if eliminados > 0:
        db.commit()
        print(f"\n✅ Eliminados {eliminados} artículos sin propietario")
    else:
        print("\n✅ No se encontraron artículos sin propietario")


def eliminar_prueba(db):
    """Elimina artículos que parecen ser de prueba"""
    print("\n🗑️ Eliminando artículos de prueba/ejemplo...")
    
    palabras_prueba = ['test', 'prueba', 'ejemplo', 'demo', 'mock', 'sample']
    eliminados = 0
    
    articulos = db.query(Articulo).all()
    
    for art in articulos:
        titulo_lower = art.titulo.lower()
        descripcion_lower = (art.descripcion or "").lower()
        
        if any(palabra in titulo_lower or palabra in descripcion_lower for palabra in palabras_prueba):
            print(f"   Eliminando: {art.titulo} (ID: {art.id})")
            db.delete(art)
            eliminados += 1
    
    if eliminados > 0:
        db.commit()
        print(f"\n✅ Eliminados {eliminados} artículos de prueba")
    else:
        print("\n✅ No se encontraron artículos de prueba")


def actualizar_sin_estado(db):
    """Actualiza artículos sin estado a 'publicado'"""
    print("\n🔄 Actualizando artículos sin estado...")
    
    from app.models.articulo import EstadoArticulo
    
    articulos = db.query(Articulo).filter(Articulo.estado_articulo == None).all()
    actualizados = 0
    
    for art in articulos:
        print(f"   Actualizando: {art.titulo} (ID: {art.id}) -> publicado")
        art.estado_articulo = EstadoArticulo.publicado
        actualizados += 1
    
    if actualizados > 0:
        db.commit()
        print(f"\n✅ Actualizados {actualizados} artículos a estado 'publicado'")
    else:
        print("\n✅ Todos los artículos tienen estado definido")


if __name__ == "__main__":
    print("\n⚠️ ADVERTENCIA: Este script puede modificar la base de datos")
    print("   Asegúrate de tener un respaldo antes de continuar\n")
    
    try:
        verificar_articulos()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
