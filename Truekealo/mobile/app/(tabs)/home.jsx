import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import AccessibleText from '../../src/components/AccessibleText';
import AccessibleView from '../../src/components/AccessibleView';
import { getMisArticulos } from '../../src/services/articulosService';
import { getPropuestasRecibidas, getPropuestasEnviadas } from '../../src/services/propuestasService';
import { getConversaciones } from '../../src/services/mensajesService';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../src/constants/config';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    propuestasRecibidas: 0,
    propuestasEnviadas: 0,
    mensajesNoLeidos: 0,
    misArticulos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Cargar propuestas recibidas
      const propuestasRecibidas = await getPropuestasRecibidas();
      
      // Cargar propuestas enviadas
      const propuestasEnviadas = await getPropuestasEnviadas();
      
      // Cargar conversaciones para mensajes no leídos
      const conversaciones = await getConversaciones();
      const mensajesNoLeidos = conversaciones.reduce((acc, conv) => acc + (conv.no_leidos || 0), 0);
      
      // Cargar mis artículos
      const articulos = await getMisArticulos();
      
      setStats({
        propuestasRecibidas: propuestasRecibidas?.filter(p => p.estado === 'pendiente').length || 0,
        propuestasEnviadas: propuestasEnviadas?.filter(p => p.estado === 'pendiente').length || 0,
        mensajesNoLeidos: mensajesNoLeidos,
        misArticulos: articulos?.length || 0,
      });
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const firstName = user?.nombre_completo?.split(' ')[0] || 'Usuario';

  return (
    <AccessibleView style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header con Saludo */}
        <View style={styles.header}>
          <AccessibleText style={styles.greeting}>
            ¡Hola, {firstName}! 👋
          </AccessibleText>
          <AccessibleText style={styles.subtitle}>Bienvenido a tu panel de control</AccessibleText>
        </View>

      {/* Estadísticas */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="swap-horizontal"
          label="Propuestas Recibidas"
          value={stats.propuestasRecibidas}
          onPress={() => router.push('/propuestas-recibidas')}
        />
        <StatCard
          icon="send"
          label="Propuestas Enviadas"
          value={stats.propuestasEnviadas}
          onPress={() => router.push('/propuestas-enviadas')}
        />
      </View>
      
      <View style={styles.statsGrid}>
        <StatCard
          icon="chatbubble"
          label="Mensajes No Leídos"
          value={stats.mensajesNoLeidos}
          onPress={() => router.push('/(tabs)/messages')}
        />
        <StatCard
          icon="cube"
          label="Mis Artículos"
          value={stats.misArticulos}
          onPress={() => router.push('/mis-articulos')}
        />
      </View>

      {/* Acciones Rápidas */}
      <View style={styles.section}>
        <AccessibleText style={styles.sectionTitle}>Acciones Rápidas</AccessibleText>
        <View style={styles.actionsGrid}>
          <ActionCard
            icon="add-circle-outline"
            title="Publicar Artículo"
            description="Comparte lo que quieres intercambiar"
            onPress={() => router.push('/publicar-articulo')}
          />
          <ActionCard
            icon="cube-outline"
            title="Mis Artículos"
            description="Administra tus publicaciones"
            onPress={() => router.push('/mis-articulos')}
          />
          <ActionCard
            icon="search-outline"
            title="Explorar"
            description="Busca artículos disponibles"
            onPress={() => router.push('/(tabs)/explore')}
          />
          <ActionCard
            icon="chatbubbles-outline"
            title="Mensajes"
            description="Comunicarte con otros usuarios"
            onPress={() => router.push('/(tabs)/messages')}
          />
        </View>
      </View>
    </ScrollView>
    </AccessibleView>
  );
}

// Componente para Tarjeta de Estadística
function StatCard({ icon, label, value, onPress }) {
  return (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={28} color={COLORS.primary} />
      </View>
      <AccessibleText style={styles.statValue}>{value}</AccessibleText>
      <AccessibleText style={styles.statLabel}>{label}</AccessibleText>
      <AccessibleText style={styles.statLink}>Ver →</AccessibleText>
    </TouchableOpacity>
  );
}

// Componente para Tarjeta de Acción
function ActionCard({ icon, title, description, onPress }) {
  return (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={40} color={COLORS.primary} />
      </View>
      <AccessibleText style={styles.actionTitle}>{title}</AccessibleText>
      <AccessibleText style={styles.actionDescription}>{description}</AccessibleText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 140,
    justifyContent: 'center',
  },
  statIcon: {
    marginBottom: SPACING.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  statLink: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  actionsGrid: {
    gap: SPACING.md,
  },
  actionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionIcon: {
    marginBottom: SPACING.md,
  },
  actionTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  actionDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
