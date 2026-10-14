import React, { useState } from 'react';
import {
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Globe,
  Info,
  Shield,
  X,
  XCircle,
} from 'lucide-react-native';
import { ApiLogEntry } from '../../../types/apiLogger';
import { apiLogger } from '../../../services/apiLogger';
import { copyToClipboard } from '../../../utils/clipboardHelper';
import { COLORS, moderateScale, SHADOWS } from '../../../utils/constants';

interface RequestDetailModalProps {
  log: ApiLogEntry | null;
  visible: boolean;
  onClose: () => void;
}

type DetailTab = 'overview' | 'request' | 'response' | 'analysis';

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  log,
  visible,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');

  if (!log) return null;

  const getStatusColor = () => {
    switch (log.status) {
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

  const getStatusBgColor = () => {
    switch (log.status) {
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

  const handleCopyDiagnosticText = () => {
    const text = apiLogger.exportLogAsText(log);
    copyToClipboard(text, 'Diagnostic report copied!');
  };

  const handleCopyCurl = () => {
    const curl = apiLogger.exportLogAsCurl(log);
    copyToClipboard(curl, 'cURL command copied!');
  };

  const handleCopyUrl = () => {
    copyToClipboard(log.url, 'URL copied to clipboard!');
  };

  const handleCopyJson = (data: any, label: string) => {
    if (!data) return;
    const str = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    copyToClipboard(str, `${label} copied to clipboard!`);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={[styles.methodBadge, { backgroundColor: COLORS.navy }]}>
              <Text style={styles.methodBadgeText}>{log.method}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusBgColor() },
              ]}
            >
              <Text style={[styles.statusBadgeText, { color: getStatusColor() }]}>
                {log.statusCode ? `${log.statusCode}` : log.status.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.durationText}>
              {log.durationMs !== null ? `${log.durationMs}ms` : 'Pending'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="Close request details"
          >
            <X size={moderateScale(20)} color={COLORS.navy} />
          </TouchableOpacity>
        </View>

        {/* URL Banner */}
        <View style={styles.urlBanner}>
          <Text style={styles.urlText} numberOfLines={2} selectable>
            {log.url}
          </Text>
          <TouchableOpacity
            onPress={handleCopyUrl}
            style={styles.urlCopyBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Copy size={moderateScale(14)} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleCopyDiagnosticText}
          >
            <Copy size={moderateScale(14)} color={COLORS.navy} />
            <Text style={styles.actionBtnText}>Copy Diagnostics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn} onPress={handleCopyCurl}>
            <Globe size={moderateScale(14)} color={COLORS.navy} />
            <Text style={styles.actionBtnText}>Copy cURL</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabBar}>
          {(['overview', 'analysis', 'request', 'response'] as DetailTab[]).map(tab => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    isActive && styles.tabButtonTextActive,
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'analysis' && log.analysis?.severity === 'error' && ' ⚠️'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab Content */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <View style={styles.sectionContainer}>
              {/* General Metadata */}
              <View style={styles.card}>
                <Text style={styles.cardHeader}>Request Metadata</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Request ID</Text>
                  <Text style={styles.metaValue} selectable>
                    {log.id}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Timestamp</Text>
                  <Text style={styles.metaValue}>
                    {log.formattedTime} ({new Date(log.timestamp).toLocaleDateString()})
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Base URL</Text>
                  <Text style={styles.metaValue} selectable>
                    {log.baseUrl}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Endpoint</Text>
                  <Text style={styles.metaValue} selectable>
                    {log.endpoint}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Response Time</Text>
                  <Text style={styles.metaValue}>
                    {log.durationMs !== null ? `${log.durationMs} ms` : 'Pending response'}
                  </Text>
                </View>
              </View>

              {/* Firebase Authentication Diagnostics */}
              <View style={styles.card}>
                <View style={styles.cardHeaderWithIcon}>
                  <Shield size={moderateScale(16)} color={COLORS.primary} />
                  <Text style={styles.cardHeader}>Firebase Authentication Status</Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Auth State</Text>
                  <View style={styles.inlineBadge}>
                    {log.authDiagnostics.isAuthenticated ? (
                      <CheckCircle2 size={moderateScale(14)} color="#2B8A3E" />
                    ) : (
                      <XCircle size={moderateScale(14)} color="#E03131" />
                    )}
                    <Text
                      style={[
                        styles.inlineBadgeText,
                        {
                          color: log.authDiagnostics.isAuthenticated
                            ? '#2B8A3E'
                            : '#E03131',
                        },
                      ]}
                    >
                      {log.authDiagnostics.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                    </Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Firebase UID</Text>
                  <Text style={styles.metaValue} selectable>
                    {log.authDiagnostics.firebaseUid || 'None'}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Token Attached</Text>
                  <View style={styles.inlineBadge}>
                    <Text
                      style={[
                        styles.inlineBadgeText,
                        {
                          color: log.authDiagnostics.tokenAttached
                            ? '#2B8A3E'
                            : '#D9480F',
                        },
                      ]}
                    >
                      {log.authDiagnostics.tokenAttached
                        ? 'Bearer Token Attached'
                        : 'No Token Attached'}
                    </Text>
                  </View>
                </View>

                {log.authDiagnostics.tokenError && (
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Token Error</Text>
                    <Text style={[styles.metaValue, { color: '#E03131' }]}>
                      {log.authDiagnostics.tokenError}
                    </Text>
                  </View>
                )}
              </View>

              {/* Error Summary if failed */}
              {(log.errorMessage || log.errorCode) && (
                <View style={[styles.card, styles.errorCard]}>
                  <View style={styles.cardHeaderWithIcon}>
                    <AlertCircle size={moderateScale(16)} color="#E03131" />
                    <Text style={[styles.cardHeader, { color: '#E03131' }]}>
                      Error Details
                    </Text>
                  </View>
                  {log.errorCode && (
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Error Code</Text>
                      <Text style={[styles.metaValue, { fontWeight: '700' }]}>
                        {log.errorCode}
                      </Text>
                    </View>
                  )}
                  {log.errorMessage && (
                    <View style={styles.metaRowVertical}>
                      <Text style={styles.metaLabel}>Message</Text>
                      <Text style={styles.errorText} selectable>
                        {log.errorMessage}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* TAB 2: DIAGNOSTIC ANALYSIS */}
          {activeTab === 'analysis' && (
            <View style={styles.sectionContainer}>
              {log.analysis ? (
                <View style={styles.card}>
                  <View style={styles.cardHeaderWithIcon}>
                    <Info size={moderateScale(18)} color={COLORS.primary} />
                    <Text style={styles.cardHeader}>{log.analysis.title}</Text>
                  </View>

                  <Text style={styles.analysisSummaryText}>
                    {log.analysis.summary}
                  </Text>

                  <Text style={styles.suggestionsHeader}>Troubleshooting Steps:</Text>
                  {log.analysis.suggestions.map((suggestion, idx) => (
                    <View key={idx} style={styles.suggestionRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No diagnostic anomalies detected.</Text>
                </View>
              )}
            </View>
          )}

          {/* TAB 3: REQUEST DETAILS */}
          {activeTab === 'request' && (
            <View style={styles.sectionContainer}>
              {/* Query Parameters */}
              {log.queryParams && Object.keys(log.queryParams).length > 0 && (
                <View style={styles.card}>
                  <View style={styles.codeHeaderRow}>
                    <Text style={styles.cardHeader}>Query Parameters</Text>
                    <TouchableOpacity
                      onPress={() => handleCopyJson(log.queryParams, 'Query Parameters')}
                    >
                      <Copy size={moderateScale(15)} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.codeBlock}>
                    <Text style={styles.codeText} selectable>
                      {JSON.stringify(log.queryParams, null, 2)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Request Headers */}
              <View style={styles.card}>
                <View style={styles.codeHeaderRow}>
                  <Text style={styles.cardHeader}>Sanitized Request Headers</Text>
                  <TouchableOpacity
                    onPress={() => handleCopyJson(log.requestHeaders, 'Request Headers')}
                  >
                    <Copy size={moderateScale(15)} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText} selectable>
                    {JSON.stringify(log.requestHeaders, null, 2)}
                  </Text>
                </View>
              </View>

              {/* Request Body */}
              <View style={styles.card}>
                <View style={styles.codeHeaderRow}>
                  <Text style={styles.cardHeader}>Request Body</Text>
                  {log.requestData && (
                    <TouchableOpacity
                      onPress={() => handleCopyJson(log.requestData, 'Request Body')}
                    >
                      <Copy size={moderateScale(15)} color={COLORS.primary} />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText} selectable>
                    {log.requestData
                      ? JSON.stringify(log.requestData, null, 2)
                      : '// No request body'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* TAB 4: RESPONSE DETAILS */}
          {activeTab === 'response' && (
            <View style={styles.sectionContainer}>
              {/* Response Headers
              {log.responseHeaders && Object.keys(log.responseHeaders).length > 0 && (
                <View style={styles.card}>
                  <View style={styles.codeHeaderRow}>
                    <Text style={styles.cardHeader}>Response Headers</Text>
                    <TouchableOpacity
                      onPress={() => handleCopyJson(log.responseHeaders, 'Response Headers')}
                    >
                      <Copy size={moderateScale(15)} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.codeBlock}>
                    <Text style={styles.codeText} selectable>
                      {JSON.stringify(log.responseHeaders, null, 2)}
                    </Text>
                  </View>
                </View>
              )} */}

              {/* Response Body */}
              <View style={styles.card}>
                <View style={styles.codeHeaderRow}>
                  <Text style={styles.cardHeader}>
                    Response Body ({log.status.toUpperCase()})
                  </Text>
                  {log.responseData && (
                    <TouchableOpacity
                      onPress={() => handleCopyJson(log.responseData, 'Response Body')}
                    >
                      <Copy size={moderateScale(15)} color={COLORS.primary} />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={[styles.codeBlock, {maxHeight: moderateScale(450)}]}>
                  <Text style={styles.codeText} selectable>
                    {log.responseData !== undefined && log.responseData !== null
                      ? typeof log.responseData === 'string'
                        ? log.responseData
                        : JSON.stringify(log.responseData, null, 2)
                      : log.status === 'pending'
                      ? '// Request is currently pending...'
                      : '// No response body received'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
  },
  methodBadge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(6),
  },
  methodBadgeText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: moderateScale(11),
  },
  statusBadge: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(6),
  },
  statusBadgeText: {
    fontWeight: '700',
    fontSize: moderateScale(11),
  },
  durationText: {
    fontSize: moderateScale(12),
    color: COLORS.gray,
    fontWeight: '600',
  },
  closeButton: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  urlBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#071B3A',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
  },
  urlText: {
    color: '#E5F7EF',
    fontSize: moderateScale(12),
    fontWeight: '600',
    flex: 1,
    marginRight: moderateScale(8),
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  urlCopyBtn: {
    padding: moderateScale(6),
    borderRadius: moderateScale(6),
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(10),
    backgroundColor: COLORS.white,
    gap: moderateScale(10),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 122, 166, 0.08)',
    paddingVertical: moderateScale(8),
    borderRadius: moderateScale(8),
    gap: moderateScale(6),
  },
  actionBtnText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: COLORS.navy,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: moderateScale(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: moderateScale(11),
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: COLORS.primary,
  },
  tabButtonText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: COLORS.gray,
  },
  tabButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: moderateScale(16),
    paddingBottom: moderateScale(40),
  },
  sectionContainer: {
    gap: moderateScale(14),
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(14),
    padding: moderateScale(14),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...SHADOWS.soft,
  },
  errorCard: {
    borderColor: 'rgba(224, 49, 49, 0.25)',
    backgroundColor: 'rgba(255, 235, 235, 0.4)',
  },
  cardHeader: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: moderateScale(10),
  },
  cardHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(8),
    marginBottom: moderateScale(6),
  },
  codeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(8),
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: moderateScale(6),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  metaRowVertical: {
    paddingVertical: moderateScale(6),
  },
  metaLabel: {
    fontSize: moderateScale(12),
    color: COLORS.gray,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: moderateScale(12),
    color: COLORS.navy,
    fontWeight: '500',
    maxWidth: '65%',
    textAlign: 'right',
  },
  inlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: moderateScale(4),
  },
  inlineBadgeText: {
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  errorText: {
    fontSize: moderateScale(12),
    color: '#E03131',
    fontWeight: '600',
    marginTop: moderateScale(4),
  },
  analysisSummaryText: {
    fontSize: moderateScale(13),
    color: COLORS.navy,
    lineHeight: moderateScale(18),
    marginBottom: moderateScale(12),
  },
  suggestionsHeader: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: moderateScale(6),
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: moderateScale(8),
    marginBottom: moderateScale(6),
  },
  bullet: {
    fontSize: moderateScale(13),
    fontWeight: '700',
    color: COLORS.primary,
  },
  suggestionText: {
    fontSize: moderateScale(12),
    color: '#2C3E50',
    lineHeight: moderateScale(17),
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: COLORS.navy,
  },
  checklistIntro: {
    fontSize: moderateScale(12),
    color: COLORS.gray,
    marginBottom: moderateScale(10),
  },
  codeBlock: {
    flex:1,
    backgroundColor: '#0F172A',
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    maxHeight: moderateScale(280),
  },
  codeText: {
    color: '#38BDF8',
    fontSize: moderateScale(11),
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: moderateScale(16),
  },
  emptyCard: {
    padding: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(14),
  },
  emptyText: {
    fontSize: moderateScale(13),
    color: COLORS.gray,
  },
});
