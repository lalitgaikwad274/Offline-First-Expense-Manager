import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from '@react-native-firebase/auth';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  Globe,
  RefreshCw,
  Search,
  Share2,
  Trash2,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react-native';
import {
  ApiLogEntry,
  ApiLogFilter,
  ApiLoggerStats,
} from '../../types/apiLogger';
import { apiLogger } from '../../services/apiLogger';
import { serverCall } from '../../services/api';
import { BASE_URL, ENDPOINTS } from '../../utils/ApiConstants';
import { copyToClipboard } from '../../utils/clipboardHelper';
import { COLORS, moderateScale, SHADOWS } from '../../utils/constants';
import { RequestDetailModal } from './components/RequestDetailModal';

const FILTER_TABS: { label: string; value: ApiLogFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Success', value: 'success' },
  { label: 'HTTP Error', value: 'http_error' },
  { label: 'Network Error', value: 'network_error' },
  { label: 'Pending', value: 'pending' },
];

export const ApiDebuggerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [stats, setStats] = useState<ApiLoggerStats>({
    total: 0,
    success: 0,
    httpError: 0,
    networkError: 0,
    pending: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ApiLogFilter>('all');
  const [selectedLog, setSelectedLog] = useState<ApiLogEntry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Load and subscribe to in-memory logger updates
  const syncLogs = useCallback(() => {
    setLogs(apiLogger.getLogs());
    setStats(apiLogger.getStats());
  }, []);

  useEffect(() => {
    syncLogs();
    const unsubscribe = apiLogger.subscribe(() => {
      syncLogs();
    });
    return () => {
      unsubscribe();
    };
  }, [syncLogs]);

  // Pull to refresh handler
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    syncLogs();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  }, [syncLogs]);

  // Clear logs with confirmation
  const handleClearLogs = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all recorded API diagnostic logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            apiLogger.clearLogs();
            syncLogs();
          },
        },
      ]
    );
  };

  // Copy full diagnostic report
  const handleExportAllLogs = () => {
    if (logs.length === 0) {
      Alert.alert('No Logs', 'No API requests have been captured yet.');
      return;
    }
    const report = apiLogger.exportAllLogs();
    copyToClipboard(report, 'All diagnostic logs copied to clipboard!');
  };

  // Trigger a quick test request to verify reachability
  const handleTestPing = async () => {
    setIsTestingPing(true);
    try {
      // Test transactions endpoint with limit=1
      await serverCall(`${ENDPOINTS.GET_TRANSACTION}?limit=1`, 'GET');
    } catch (err: any) {
      // Log will automatically be captured by the logger!
      console.log('[ApiDebugger] Test ping completed with status/error:', err?.message);
    } finally {
      setIsTestingPing(false);
    }
  };

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Filter tab condition
      if (activeFilter !== 'all' && log.status !== activeFilter) {
        return false;
      }
      // Search query condition
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchesUrl = log.url.toLowerCase().includes(query);
        const matchesEndpoint = log.endpoint.toLowerCase().includes(query);
        const matchesMethod = log.method.toLowerCase().includes(query);
        const matchesStatus = String(log.statusCode || '').includes(query);
        const matchesError = (log.errorMessage || '').toLowerCase().includes(query);
        return matchesUrl || matchesEndpoint || matchesMethod || matchesStatus || matchesError;
      }
      return true;
    });
  }, [logs, activeFilter, searchQuery]);

  // Get color for status badge
  const getStatusColor = (status: string, code?: number | null) => {
    switch (status) {
      case 'success':
        return '#2B8A3E';
      case 'http_error':
        return '#E03131';
      case 'network_error':
        return '#D9480F';
      case 'pending':
        return '#F59F00';
      default:
        return COLORS.gray;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'rgba(43, 138, 62, 0.12)';
      case 'http_error':
        return 'rgba(224, 49, 49, 0.12)';
      case 'network_error':
        return 'rgba(217, 72, 15, 0.12)';
      case 'pending':
        return 'rgba(245, 159, 0, 0.12)';
      default:
        return 'rgba(110, 127, 133, 0.12)';
    }
  };

  // Render individual request item
  const renderItem = ({ item }: { item: ApiLogEntry }) => {
    const isError = item.status === 'http_error' || item.status === 'network_error';

    return (
      <TouchableOpacity
        style={[
          styles.logCard,
          isError && styles.logCardError,
          item.status === 'pending' && styles.logCardPending,
        ]}
        activeOpacity={0.7}
        onPress={() => {
          setSelectedLog(item);
          setModalVisible(true);
        }}
      >
        {/* Top Row: Method, Status Code, Duration, Time */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.methodBadge, { backgroundColor: COLORS.navy }]}>
              <Text style={styles.methodBadgeText}>{item.method}</Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusBgColor(item.status) },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: getStatusColor(item.status, item.statusCode) },
                ]}
              >
                {item.statusCode
                  ? `${item.statusCode}`
                  : item.status === 'network_error'
                  ? 'NET_ERR'
                  : item.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.cardHeaderRight}>
            <Clock size={moderateScale(12)} color={COLORS.gray} />
            <Text style={styles.durationText}>
              {item.durationMs !== null ? `${item.durationMs}ms` : 'pending'}
            </Text>
            <Text style={styles.timeText}>{item.formattedTime}</Text>
          </View>
        </View>

        {/* Endpoint path */}
        <Text style={styles.endpointText} numberOfLines={1}>
          {item.endpoint}
        </Text>

        {/* Host / URL Subtext */}
        <Text style={styles.subUrlText} numberOfLines={1}>
          {item.baseUrl}
        </Text>

        {/* Error Preview Banner */}
        {item.errorMessage && (
          <View style={styles.errorSnippet}>
            <AlertCircle size={moderateScale(12)} color="#E03131" />
            <Text style={styles.errorSnippetText} numberOfLines={1}>
              {item.errorCode ? `[${item.errorCode}] ` : ''}
              {item.errorMessage}
            </Text>
          </View>
        )}

        {/* Diagnosis Pill if diagnostic advice is present */}
        {item.analysis && item.analysis.category !== 'OK' && (
          <View
            style={[
              styles.diagnosisPill,
              {
                backgroundColor:
                  item.analysis.severity === 'error'
                    ? 'rgba(224, 49, 49, 0.08)'
                    : 'rgba(245, 159, 0, 0.1)',
              },
            ]}
          >
            <Text
              style={[
                styles.diagnosisPillText,
                {
                  color:
                    item.analysis.severity === 'error' ? '#C92A2A' : '#D9480F',
                },
              ]}
              numberOfLines={1}
            >
              💡 {item.analysis.title}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <ArrowLeft size={moderateScale(20)} color={COLORS.navy} strokeWidth={2.4} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>API Debugger</Text>
            <Text style={styles.headerSubtitle}>In-App Network Monitor</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleTestPing}
            style={[styles.headerIconBtn, isTestingPing && styles.headerIconBtnActive]}
            accessibilityRole="button"
            accessibilityLabel="Send Test Ping"
          >
            <Zap size={moderateScale(18)} color={COLORS.primary} strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleExportAllLogs}
            style={styles.headerIconBtn}
            accessibilityRole="button"
            accessibilityLabel="Export All Diagnostic Logs"
          >
            <Share2 size={moderateScale(18)} color={COLORS.navy} strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearLogs}
            style={styles.headerIconBtn}
            accessibilityRole="button"
            accessibilityLabel="Clear Logs"
          >
            <Trash2 size={moderateScale(18)} color={COLORS.red} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Environment Diagnostics Banner */}
      <View style={styles.envBanner}>
        <View style={styles.envRow}>
          <View style={styles.envLeft}>
            <Globe size={moderateScale(14)} color="#E5F7EF" />
            <Text style={styles.envLabel}>Base URL:</Text>
          </View>
          <Text style={styles.envValue} numberOfLines={1} selectable>
            {BASE_URL}
          </Text>
        </View>

        <View style={styles.envRow}>
          <View style={styles.envLeft}>
            <Activity size={moderateScale(14)} color="#E5F7EF" />
            <Text style={styles.envLabel}>Auth UID:</Text>
          </View>
          <Text style={styles.envValue} numberOfLines={1} selectable>
            {currentUser?.uid ? `${currentUser.uid.slice(0, 16)}...` : 'Not Signed In'}
          </Text>
        </View>
      </View>

      {/* Metrics Bar */}
      <View style={styles.metricsBar}>
        <View style={styles.metricItem}>
          <Text style={styles.metricCount}>{stats.total}</Text>
          <Text style={styles.metricLabel}>Total</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricCount, { color: '#2B8A3E' }]}>
            {stats.success}
          </Text>
          <Text style={styles.metricLabel}>Success</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricCount, { color: '#E03131' }]}>
            {stats.httpError}
          </Text>
          <Text style={styles.metricLabel}>HTTP Err</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricCount, { color: '#D9480F' }]}>
            {stats.networkError}
          </Text>
          <Text style={styles.metricLabel}>Net Err</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={[styles.metricCount, { color: '#F59F00' }]}>
            {stats.pending}
          </Text>
          <Text style={styles.metricLabel}>Pending</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Search size={moderateScale(16)} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search endpoint, URL, method, status..."
            placeholderTextColor={COLORS.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Chips Bar */}
      <View style={styles.filtersWrapper}>
        <FlatList
          data={FILTER_TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.value}
          contentContainerStyle={styles.filtersContent}
          renderItem={({ item }) => {
            const isActive = activeFilter === item.value;
            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                ]}
                onPress={() => setActiveFilter(item.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Request List */}
      <FlatList
        data={filteredLogs}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Activity size={moderateScale(36)} color={COLORS.gray} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No matching requests' : 'No API requests captured'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try adjusting your search query or active filter.'
                : 'Perform an action in Expensio (or tap the ⚡️ button above) to capture network traffic.'}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.pingTestButton}
                onPress={handleTestPing}
                disabled={isTestingPing}
              >
                <Zap size={moderateScale(16)} color={COLORS.white} />
                <Text style={styles.pingTestButtonText}>
                  {isTestingPing ? 'Pinging API...' : 'Run Test Ping Request'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Detailed Modal */}
      <RequestDetailModal
        log={selectedLog}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default ApiDebuggerScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    backgroundColor: COLORS.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  headerTitleContainer: {
    marginLeft: moderateScale(12),
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '800',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: moderateScale(11),
    color: COLORS.gray,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  headerIconBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.soft,
  },
  headerIconBtnActive: {
    backgroundColor: 'rgba(8, 122, 166, 0.2)',
  },
  envBanner: {
    backgroundColor: '#071B3A',
    marginHorizontal: moderateScale(16),
    marginBottom: moderateScale(10),
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(8),
    gap: moderateScale(4),
  },
  envRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  envLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
  },
  envLabel: {
    color: '#AAB6C7',
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  envValue: {
    color: '#63DDE5',
    fontSize: moderateScale(11),
    fontWeight: '700',
    maxWidth: '65%',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  metricsBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: moderateScale(16),
    borderRadius: moderateScale(14),
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.soft,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricCount: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    color: COLORS.navy,
  },
  metricLabel: {
    fontSize: moderateScale(10),
    color: COLORS.gray,
    fontWeight: '600',
    marginTop: moderateScale(2),
  },
  metricDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  searchWrapper: {
    paddingHorizontal: moderateScale(16),
    marginTop: moderateScale(10),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(12),
    height: moderateScale(40),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(13),
    color: COLORS.navy,
    marginLeft: moderateScale(8),
    paddingVertical: 0,
  },
  clearSearchText: {
    fontSize: moderateScale(11),
    color: COLORS.primary,
    fontWeight: '600',
  },
  filtersWrapper: {
    marginTop: moderateScale(8),
    marginBottom: moderateScale(4),
  },
  filtersContent: {
    paddingHorizontal: moderateScale(16),
    gap: moderateScale(8),
  },
  filterChip: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(16),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: COLORS.navy,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: moderateScale(16),
    paddingTop: moderateScale(8),
    paddingBottom: moderateScale(40),
    gap: moderateScale(10),
  },
  logCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: moderateScale(14),
    padding: moderateScale(12),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...SHADOWS.soft,
  },
  logCardError: {
    borderColor: 'rgba(224, 49, 49, 0.3)',
    backgroundColor: '#FFF9F9',
  },
  logCardPending: {
    borderColor: 'rgba(245, 159, 0, 0.3)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(6),
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(6),
  },
  methodBadge: {
    paddingHorizontal: moderateScale(7),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(5),
  },
  methodBadgeText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: moderateScale(10),
  },
  statusBadge: {
    paddingHorizontal: moderateScale(7),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(5),
  },
  statusBadgeText: {
    fontWeight: '700',
    fontSize: moderateScale(10),
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
  },
  durationText: {
    fontSize: moderateScale(11),
    fontWeight: '700',
    color: COLORS.navy,
    marginRight: moderateScale(4),
  },
  timeText: {
    fontSize: moderateScale(10),
    color: COLORS.gray,
  },
  endpointText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: moderateScale(2),
  },
  subUrlText: {
    fontSize: moderateScale(11),
    color: COLORS.gray,
    marginBottom: moderateScale(6),
  },
  errorSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(224, 49, 49, 0.08)',
    borderRadius: moderateScale(6),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    gap: moderateScale(6),
    marginTop: moderateScale(2),
  },
  errorSnippetText: {
    fontSize: moderateScale(11),
    color: '#C92A2A',
    fontWeight: '600',
    flex: 1,
  },
  diagnosisPill: {
    borderRadius: moderateScale(6),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    marginTop: moderateScale(6),
  },
  diagnosisPillText: {
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(60),
    paddingHorizontal: moderateScale(20),
  },
  emptyIconBox: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(14),
  },
  emptyTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: moderateScale(6),
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: moderateScale(13),
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: moderateScale(18),
    marginBottom: moderateScale(16),
  },
  pingTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: moderateScale(18),
    paddingVertical: moderateScale(10),
    borderRadius: moderateScale(12),
    gap: moderateScale(8),
  },
  pingTestButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
});
