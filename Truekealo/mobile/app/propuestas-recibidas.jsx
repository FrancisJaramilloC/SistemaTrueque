import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getPropuestasRecibidas,
  aceptarPropuesta,
  rechazarPropuesta,
} from '../src/services/propuestasService';
import { COLORS, SPACING, TYPOGRAPHY } from '../src/constants/config';

export default function PropuestasRecibidasScreen() {
  const router = useRouter();
  const [propuestas, setPropuestas] = useState([]);
  const [filteredPropuestas, setFilteredPropuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState('todas'); // 'todas', 'pendiente', 'aceptada', 'rechazada', 'cancelada'

  useEffect(() => {
    loadPropuestas();
  }, []);

  useEffect(() => {
    filterPropuestas();
  }, [filtro, propuestas]);

  const loadPropuestas = async () => {
    try {
      const data = await getPropuestasRecibidas();
      setPropuestas(data);
    } catch (error) {
      console.error('Error al cargar propuestas:', error);
      Alert.alert('Error', 'No se pudieron cargar las propuestas recibidas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterPropuestas = () => {
    if (filtro === 'todas') {
      setFilteredPropuestas(propuestas);
    } else {
      setFilteredPropuestas(propuestas.filter((p) => p.estado === filtro));
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPropuestas();
  };

  const handleAceptar = async (id, articuloOfrecido, articuloSolicitado) => {
    Alert.alert(
      'Aceptar propuesta',
      `¿Aceptar intercambio de "${articuloSolicitado}" por "${articuloOfrecido}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceptar',
          onPress: async () => {
            try {
              await aceptarPropuesta(id);
              Alert.alert('¡Éxito!', 'Propuesta aceptada correctamente');
              loadPropuestas();
            } catch (error) {
              Alert.alert('Error', 'No se pudo aceptar la propuesta');
            }
          },
        },
      ]
    );
  };

  const handleRechazar = async (id, articuloOfrecido) => {
    Alert.alert(
      'Rechazar propuesta',
      `¿Rechazar la propuesta de "${articuloOfrecido}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            try {
              await rechazarPropuesta(id);
              Alert.alert('Propuesta rechazada', 'La propuesta ha sido rechazada');
              loadPropuestas();
            } catch (error) {
              Alert.alert('Error', 'No se pudo rechazar la propuesta');
            }
          },
        },
      ]
    );
  };

  const renderEstadoBadge = (estado) => {
    let backgroundColor, textColor, texto;

    switch (estado) {
      case 'pendiente':
        backgroundColor = COLORS.warning;
        textColor = '#FFFFFF';
        texto = 'Pendiente';
        break;
      case 'aceptada':
        backgroundColor = COLORS.success;
        textColor = '#FFFFFF';
        texto = 'Aceptada';
        break;
      case 'rechazada':
        backgroundColor = COLORS.danger;
        textColor = '#FFFFFF';
        texto = 'Rechazada';
        break;
      case 'cancelada':
        backgroundColor = '#6b7280';
        textColor = '#FFFFFF';
        texto = 'Cancelada';
        break;
      default:
        backgroundColor = COLORS.border;
        textColor = COLORS.text;
        texto = estado;
    }

    return (
      <View style={[styles.badge, { backgroundColor }]}>
        <Text style={[styles.badgeText, { color: textColor }]}>{texto}</Text>
      </View>
    );
  };

  const renderPropuesta = ({ item }) => (
    <View style={styles.propuestaCard}>
      <View style={styles.propuestaHeader}>
        <Text style={styles.propuestaTitulo}>{item.articulo_ofrecido?.titulo}</Text>
        {renderEstadoBadge(item.estado)}
      </View>

      <View style={styles.propuestaBody}>
        <View style={styles.intercambioInfo}>
          <Text style={styles.label}>Propone:</Text>
          <Text style={styles.value}>{item.articulo_ofrecido?.titulo}</Text>
        </View>

        <View style={styles.intercambioInfo}>
          <Text style={styles.label}>Desde:</Text>
          <Text style={styles.value}>
            {item.usuario_ofertante?.nombre} {item.usuario_ofertante?.apellido}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.intercambioInfo}>
          <Text style={styles.label}>Por tu artículo:</Text>
          <Text style={styles.valueBold}>{item.articulo_solicitado?.titulo}</Text>
        </View>
      </View>

      {item.estado === 'pendiente' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.rechazarButton]}
            onPress={() =>
              handleRechazar(
                item.id,
                item.articulo_ofrecido?.titulo
              )
            }
          >
            <Ionicons name="close-circle" size={18} color="#FFF" />
            <Text style={styles.buttonText}>Rechazar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.aceptarButton]}
            onPress={() =>
              handleAceptar(
                item.id,
                item.articulo_ofrecido?.titulo,
                item.articulo_solicitado?.titulo
              )
            }
          >
            <Ionicons name="checkmark-circle" size={18} color="#FFF" />
            <Text style={styles.buttonText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Propuestas Recibidas</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={['todas', 'pendiente', 'aceptada', 'rechazada', 'cancelada']}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContentContainer}
          renderItem={({ item }) => {
            const labels = {
              todas: 'Todas',
              pendiente: 'Pendientes',
              aceptada: 'Aceptadas',
              rechazada: 'Rechazadas',
              cancelada: 'Canceladas',
            };
            return (
              <TouchableOpacity
                style={[styles.filterButton, filtro === item && styles.filterButtonActive]}
                onPress={() => setFiltro(item)}
              >
                <Text style={[styles.filterText, filtro === item && styles.filterTextActive]}>
                  {labels[item]}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredPropuestas}
        renderItem={renderPropuesta}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="swap-horizontal-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>No hay propuestas recibidas</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  filterContainer: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.md,
    minHeight: 60,
  },
  filterContentContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: SPACING.md,
  },
  propuestaCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  propuestaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  propuestaTitulo: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  propuestaBody: {
    marginBottom: SPACING.md,
  },
  intercambioInfo: {
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  valueBold: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    gap: SPACING.xs,
  },
  aceptarButton: {
    backgroundColor: COLORS.success,
  },
  rechazarButton: {
    backgroundColor: COLORS.danger,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
});
