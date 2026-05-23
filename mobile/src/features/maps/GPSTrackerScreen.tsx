import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import MapViewComponent from '../../shared/components/MapView';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const GPSTrackerScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [isTracking, setIsTracking] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState('02:15:32');
  const [distance, setDistance] = useState('3.2');
  const [elevationGain, setElevationGain] = useState('450');
  const [currentSpeed, setCurrentSpeed] = useState('1.2');
  const [checkInTime] = useState('08:00');
  const [estimatedReturn] = useState('16:00');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTracking && !isPaused) {
      interval = setInterval(() => {
        setDuration(prev => {
          const [h, m, s] = prev.split(':').map(Number);
          const total = h * 3600 + m * 60 + s + 1;
          const nh = Math.floor(total / 3600);
          const nm = Math.floor((total % 3600) / 60);
          const ns = total % 60;
          return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}:${String(ns).padStart(2, '0')}`;
        });
        setDistance(prev => (parseFloat(prev) + 0.001).toFixed(3));
        setCurrentSpeed(prev => (Math.random() * 2 + 0.5).toFixed(1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, isPaused]);

  const handlePause = () => setIsPaused(!isPaused);

  const handleFinish = () => {
    Alert.alert('Selesaikan Pendakian', 'Yakin ingin menyelesaikan pendakian?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Selesaikan', onPress: () => navigation.navigate('CheckInOut', { mode: 'checkout' }) },
    ]);
  };

  const handleExport = () => {
    Alert.alert('Export GPX', 'File GPX akan di-export dan disimpan ke perangkat.');
  };

  return (
    <View style={styles.container}>
      <MapViewComponent
        centerCoordinate={{ latitude: -6.789, longitude: 106.822 }}
        zoomLevel={15}
        style={{ width, height: height * 0.5 }}
        markers={[]}
        showUserLocation
        showBreadcrumb
      />

      <View style={styles.statsOverlay}>
        <View style={styles.statItem}>
          <Icon name="timer" size={16} color="#fff" />
          <Text style={styles.statValue}>{duration}</Text>
          <Text style={styles.statLabel}>Durasi</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Icon name="straighten" size={16} color="#fff" />
          <Text style={styles.statValue}>{distance} km</Text>
          <Text style={styles.statLabel}>Jarak</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Icon name="trending-up" size={16} color="#fff" />
          <Text style={styles.statValue}>+{elevationGain}m</Text>
          <Text style={styles.statLabel}>Elevasi</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Icon name="speed" size={16} color="#fff" />
          <Text style={styles.statValue}>{currentSpeed}</Text>
          <Text style={styles.statLabel}>km/j</Text>
        </View>
      </View>

      <View style={styles.bottomPanel}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Check-in</Text>
            <Text style={styles.infoValue}>{checkInTime} WIB</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Estimasi Pulang</Text>
            <Text style={styles.infoValue}>{estimatedReturn} WIB</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: isPaused ? '#F57C00' : '#2E7D32' }]}>
            <Text style={styles.statusText}>{isPaused ? '⏸️ DIISTRALAH' : '🟢 RECording'}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.pauseBtn} onPress={handlePause}>
            <Icon name={isPaused ? 'play-arrow' : 'pause'} size={28} color="#2E7D32" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
            <Icon name="flag" size={24} color="#fff" />
            <Text style={styles.finishBtnText}>SELESAI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
            <Icon name="file-download" size={22} color="#2E7D32" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsOverlay: { position: 'absolute', top: 60, left: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center' },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginTop: 2 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  bottomPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, elevation: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#757575' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#212121' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, color: '#fff', fontWeight: 'bold' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  pauseBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  finishBtn: { flexDirection: 'row', backgroundColor: '#2E7D32', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 30, alignItems: 'center', gap: 6 },
  finishBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  exportBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#2E7D32' },
});

export default GPSTrackerScreen;
