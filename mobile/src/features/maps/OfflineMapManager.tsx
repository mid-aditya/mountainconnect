import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MAP_REGIONS = [
  { id: '1', name: 'Gunung Gede-Pangrango', province: 'Jawa Barat', sizeMB: 45, isDownloaded: true },
  { id: '2', name: 'Gunung Rinjani', province: 'NTB', sizeMB: 62, isDownloaded: false },
  { id: '3', name: 'Gunung Semeru', province: 'Jawa Timur', sizeMB: 38, isDownloaded: false },
  { id: '4', name: 'Gunung Merbabu', province: 'Jawa Tengah', sizeMB: 28, isDownloaded: true },
  { id: '5', name: 'Gunung Merapi', province: 'DIY', sizeMB: 22, isDownloaded: false },
  { id: '6', name: 'Gunung Bromo', province: 'Jawa Timur', sizeMB: 30, isDownloaded: false },
  { id: '7', name: 'Gunung Kerinci', province: 'Jambi', sizeMB: 55, isDownloaded: false },
  { id: '8', name: 'Gunung Latimojong', province: 'Sulawesi Selatan', sizeMB: 40, isDownloaded: false },
];

const OfflineMapManager: React.FC = () => {
  const [regions, setRegions] = useState(MAP_REGIONS);
  const [autoDownloadWifi, setAutoDownloadWifi] = useState(true);
  const [activeDownload, setActiveDownload] = useState<{ id: string; progress: number } | null>(null);

  const totalUsed = regions.filter(r => r.isDownloaded).reduce((acc, r) => acc + r.sizeMB, 0);
  const totalAvailable = 1200;

  const handleDownload = (id: string) => {
    if (activeDownload) return;
    setActiveDownload({ id, progress: 0 });
    const interval = setInterval(() => {
      setActiveDownload(prev => {
        if (!prev) return null;
        const next = prev.progress + 15;
        if (next >= 100) {
          clearInterval(interval);
          setRegions(prev => prev.map(r => r.id === id ? { ...r, isDownloaded: true } : r));
          return null;
        }
        return { ...prev, progress: next };
      });
    }, 300);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Hapus Peta', `Hapus peta offline untuk ${name}?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => setRegions(prev => prev.map(r => r.id === id ? { ...r, isDownloaded: false } : r)) },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.storageCard}>
        <View style={styles.storageHeader}>
          <Icon name="storage" size={24} color="#2E7D32" />
          <Text style={styles.storageTitle}>Penyimpanan Offline</Text>
        </View>
        <View style={styles.storageBarBg}>
          <View style={[styles.storageBarFill, { width: `${(totalUsed / totalAvailable) * 100}%` }]} />
        </View>
        <View style={styles.storageLabels}>
          <Text style={styles.storageText}>Terpakai: {totalUsed}MB</Text>
          <Text style={styles.storageText}>Tersedia: {totalAvailable - totalUsed}MB</Text>
        </View>
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Auto-download saat WiFi</Text>
        <Switch value={autoDownloadWifi} onValueChange={setAutoDownloadWifi} trackColor={{ true: '#2E7D32' }} />
      </View>

      <Text style={styles.sectionTitle}>Daftar Peta</Text>
      {regions.map(region => (
        <View key={region.id} style={styles.regionCard}>
          <View style={styles.regionInfo}>
            <Text style={styles.regionName}>{region.name}</Text>
            <Text style={styles.regionMeta}>{region.province} · {region.sizeMB}MB</Text>
            {region.isDownloaded && activeDownload?.id === region.id && (
              <Text style={styles.regionStatus}>Menghapus...</Text>
            )}
          </View>
          {region.isDownloaded ? (
            <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(region.id, region.name)}>
              <Icon name="delete" size={18} color="#D32F2F" />
            </TouchableOpacity>
          ) : activeDownload?.id === region.id ? (
            <View style={styles.progressWrap}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${activeDownload.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{activeDownload.progress}%</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownload(region.id)}>
              <Icon name="download" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 16, paddingBottom: 40 },
  storageCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  storageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  storageTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  storageBarBg: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' },
  storageBarFill: { height: '100%', backgroundColor: '#2E7D32', borderRadius: 4 },
  storageLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  storageText: { fontSize: 12, color: '#757575' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 16 },
  settingLabel: { fontSize: 14, color: '#212121' },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#212121', marginBottom: 10 },
  regionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 8, elevation: 1 },
  regionInfo: { flex: 1 },
  regionName: { fontSize: 15, fontWeight: '600', color: '#212121' },
  regionMeta: { fontSize: 12, color: '#757575', marginTop: 2 },
  regionStatus: { fontSize: 12, color: '#F57C00', marginTop: 2 },
  deleteBtn: { padding: 8, backgroundColor: '#FFEBEE', borderRadius: 8 },
  downloadBtn: { padding: 8, backgroundColor: '#2E7D32', borderRadius: 8 },
  progressWrap: { width: 80, alignItems: 'flex-end' },
  progressBarBg: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, width: 60, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#2E7D32', borderRadius: 3 },
  progressText: { fontSize: 11, color: '#757575', marginTop: 2 },
});

export default OfflineMapManager;
