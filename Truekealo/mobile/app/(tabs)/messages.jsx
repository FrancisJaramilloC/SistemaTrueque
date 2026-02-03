import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getConversaciones } from '../../src/services/mensajesService';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { EmptyState } from '../../src/components/EmptyState';
import { ErrorMessage } from '../../src/components/ErrorMessage';

export default function MessagesScreen() {
  const router = useRouter();
  const [conversaciones, setConversaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConversaciones();
  }, []);

  const loadConversaciones = async () => {
    try {
      setError('');
      console.log('🔄 Cargando conversaciones...');
      const data = await getConversaciones();
      console.log('✅ Conversaciones recibidas:', data?.length || 0);
      console.log('📝 Primera conversación:', data?.[0]);
      setConversaciones(data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al cargar conversaciones');
      console.error('❌ Error al cargar conversaciones:', err);
      console.error('❌ Error completo:', JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadConversaciones();
  };

  const handleConversacionPress = (conversacion) => {
    const otroUsuarioId = conversacion?.otro_usuario_id || conversacion?.otro_usuario?.id;
    if (otroUsuarioId) {
      router.push(`/conversacion/${otroUsuarioId}`);
    } else {
      console.error('❌ No se pudo obtener el ID del otro usuario:', conversacion);
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    
    try {
      const now = new Date();
      const msgDate = new Date(fecha);
      const diffMs = now - msgDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Ahora';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      
      return msgDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    } catch (error) {
      return '';
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando mensajes..." />;
  }

  const renderConversacion = ({ item }) => {
    // Adaptar para ambos formatos: nuevo (otro_usuario_id) y viejo (otro_usuario.id)
    const otroUsuarioId = item?.otro_usuario_id || item?.otro_usuario?.id;
    const otroUsuarioNombre = item?.otro_usuario_nombre || item?.otro_usuario?.nombre_completo || 'Usuario';
    const ultimoMensaje = item?.ultimo_mensaje || item?.ultimo_mensaje?.contenido || 'Sin mensajes';
    const ultimoMensajeFecha = item?.ultimo_mensaje_fecha || item?.ultimo_mensaje?.fecha_creacion;
    const noLeidos = item?.mensajes_no_leidos || item?.no_leidos || 0;
    
    if (!otroUsuarioId) {
      return null; // No renderizar si falta datos
    }

    return (
      <TouchableOpacity
        style={styles.conversacionItem}
        onPress={() => handleConversacionPress(item)}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={24} color="#97594e" />
          </View>
          {noLeidos > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{noLeidos}</Text>
            </View>
          )}
        </View>

        <View style={styles.conversacionContent}>
          <View style={styles.conversacionHeader}>
            <Text style={styles.conversacionNombre} numberOfLines={1}>
              {otroUsuarioNombre}
            </Text>
            <Text style={styles.conversacionFecha}>
              {formatFecha(ultimoMensajeFecha)}
            </Text>
          </View>
          <Text
            style={[
              styles.conversacionMensaje,
              noLeidos > 0 && styles.conversacionMensajeUnread,
            ]}
            numberOfLines={2}
          >
            {ultimoMensaje}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#97594e" />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mensajes</Text>
      </View>

      {error && <ErrorMessage message={error} />}

      <FlatList
        data={conversaciones}
        keyExtractor={(item, index) => 
          (item?.otro_usuario_id || item?.otro_usuario?.id || index).toString()
        }
        renderItem={renderConversacion}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#d4742f']}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            message="No tienes conversaciones"
            description="Tus conversaciones con otros usuarios aparecerán aquí"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0d5ce',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1b100e',
  },
  listContainer: {
    flexGrow: 1,
  },
  conversacionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0d5ce',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: '#f5e9e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#dc2626',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  conversacionContent: {
    flex: 1,
  },
  conversacionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversacionNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b100e',
    flex: 1,
  },
  conversacionFecha: {
    fontSize: 12,
    color: '#97594e',
    marginLeft: 8,
  },
  conversacionMensaje: {
    fontSize: 14,
    color: '#97594e',
    lineHeight: 20,
  },
  conversacionMensajeUnread: {
    fontWeight: '600',
    color: '#1b100e',
  },
});
