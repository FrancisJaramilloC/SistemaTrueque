import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import {
  getMensajesConversacion,
  enviarMensaje,
  getConversaciones,
} from '../../src/services/mensajesService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../src/constants/config';

export default function ConversacionScreen() {
  const { usuarioId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [otroUsuario, setOtroUsuario] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000); // Recargar cada 3 segundos
    return () => clearInterval(interval);
  }, [usuarioId]);

  const loadData = async () => {
    try {
      // Cargar usuario de las conversaciones primero
      const conversaciones = await getConversaciones();
      const conv = conversaciones.find(c => c.otro_usuario?.id === parseInt(usuarioId));
      if (conv) {
        setOtroUsuario(conv.otro_usuario);
      }

      // Cargar mensajes
      const mensajesData = await getMensajesConversacion(usuarioId);
      if (Array.isArray(mensajesData)) {
        setMensajes(mensajesData);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarMensaje = async () => {
    if (!nuevoMensaje.trim()) return;

    setEnviando(true);
    try {
      await enviarMensaje({
        destinatario_id: parseInt(usuarioId),
        contenido: nuevoMensaje,
      });
      setNuevoMensaje('');
      await loadData();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setEnviando(false);
    }
  };

  const renderMensaje = ({ item }) => {
    const esMio = item.remitente_id === user?.id;

    return (
      <View
        style={[
          styles.mensajeContainer,
          esMio ? styles.mensajeMio : styles.mensajeOtro,
        ]}
      >
        <View
          style={[
            styles.mensajeBubble,
            esMio ? styles.bubbleMio : styles.bubbleOtro,
          ]}
        >
          <Text style={[
            styles.mensajeTexto,
            esMio ? styles.textoMio : styles.textoOtro,
          ]}>
            {item.contenido}
          </Text>
        </View>
        <Text style={styles.mensajeFecha}>
          {new Date(item.created_at).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {otroUsuario?.nombre_completo || 'Conversación'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Mensajes */}
      <FlatList
        ref={flatListRef}
        data={mensajes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMensaje}
        contentContainerStyle={styles.mensajesContainer}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        scrollEnabled={mensajes.length > 10}
      />

      {/* Input de mensaje */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputMensaje}
          placeholder="Escribe tu mensaje..."
          placeholderTextColor={COLORS.textSecondary}
          value={nuevoMensaje}
          onChangeText={setNuevoMensaje}
          multiline
          maxLength={500}
          editable={!enviando}
        />
        <TouchableOpacity
          style={[styles.botonEnviar, enviando && styles.botonEnviarDeshabilitado]}
          onPress={handleEnviarMensaje}
          disabled={enviando || !nuevoMensaje.trim()}
        >
          {enviando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  mensajesContainer: {
    padding: SPACING.lg,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  mensajeContainer: {
    marginBottom: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  mensajeMio: {
    justifyContent: 'flex-end',
  },
  mensajeOtro: {
    justifyContent: 'flex-start',
  },
  mensajeBubble: {
    maxWidth: '80%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  bubbleMio: {
    backgroundColor: COLORS.primary,
  },
  bubbleOtro: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mensajeTexto: {
    fontSize: TYPOGRAPHY.sizes.base,
    lineHeight: 20,
  },
  textoMio: {
    color: '#fff',
  },
  textoOtro: {
    color: COLORS.text,
  },
  mensajeFecha: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  inputMensaje: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text,
    maxHeight: 100,
  },
  botonEnviar: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonEnviarDeshabilitado: {
    opacity: 0.5,
  },
});
