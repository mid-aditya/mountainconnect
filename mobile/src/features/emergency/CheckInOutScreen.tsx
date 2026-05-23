import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Dimensions } from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapViewComponent from '../../shared/components/MapView';
import { AppDispatch } from '../../shared/store';

const { width, height } = Dimensions.get('window');

const ACTIVE_TRIPS = [
  { id: '1', mountain: 'Gunung Gede - Cibodas', date: '15 Mar 2024', duration: '8 jam' },
  { id: '2', mountain: 'Gunung Merbabu - Selo', date: '20 Mar 2024', duration: '12 jam' },
];

const CheckInOutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [mode, setMode] = useState<'checkin' | 'checkout' | 'active' | 'overdue'>('checkin');
  const [selectedTrip, setSelectedTrip] = useState(ACTIVE_TRIPS[0].id);
  const [estimatedReturn, setEstimatedReturn] = useState('16:00');
  const [trackingDuration, setTrackingDuration] = useState('2j 15m');
  const [distance, setDistance] = useState('3.2 km');
  const [elevationGain, setElevationGain] = useState('450 m');
  const [avgSpeed, setAvgSpeed] = useState('1.2 km/j');

  const emergencyContacts = [
    { name: 'Ibu Sari', phone: '081234567890' },
    { name: 'Bpak Hendra', phone: '089876543210' },
  ];

  const handleCheckIn = () => {
    Alert.alert('Mulai Pendakian', 'Pastikan semua peralatan lengkap dan kontak darurat sudah terisi.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Mulai', onPress: () => { setMode('active'); } },
    ]);
  };

  const handleCheckOut = () => {
    Alert.alert('Selesai Pendakian', 'Konfirmasi bahwa Anda telah kembali dengan selamat.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Selesai', onPress: () => { Alert.alert('✅ Check-out Berhasil', 'Trip summary telah disimpan.'); navigation.goBack(); } },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {mode === 'checkin' && (
        <>
          <Text style={styles.pageTitle}>Check-In Pendakian</Text>
          <Text style={styles.subtitle}>Catat awal pendakian Anda untuk keamanan</Text>

          <Text style={styles.sectionTitle}>Pilih Trip</Text>
          {ACTIVE_TRIPS.map(trip => (
            <TouchableOpacity key={trip.id} style={[styles.tripSelect, selectedTrip === trip.id && styles.tripSelected]} onPress={() => setSelectedTrip(trip.id)}>
              <View style={styles.tripIcon}><Icon name={(selectedTrip === trip.id ? 'radio-button-checked' : 'radio-button-unchecked') as any} size={20} color={selectedTrip === trip.id ? '#2E7D32' : '#757575'} /></View>
              <View><Text style={styles.tripName}>{trip.mountain}</Text><Text style={styles.tripMeta}>{trip.date} · Est. {trip.duration}</Text></View>
            </TouchableOpacity>
          ))}

          <Text style={styles.sectionTitle}>Lokasi Check-In</Text>
          <MapViewComponent centerCoordinate={{ latitude: -6.789, longitude: 106.822 }} zoomLevel={14} style={{ width: width - 32, height: 160 }} markers={[]} showUserLocation showBreadcrumb={false} />

          <Text style={styles.sectionTitle}>Estimasi Waktu Kembali</Text>
          <View style={styles.timeInput}>
            <TextInput style={styles.timeField} value={estimatedReturn} onChangeText={setEstimatedReturn} placeholder="Contoh: 16:00" />
            <Text style={styles.timeLabel}>WIB, {new Date().toLocaleDateString('id-ID')}</Text>
          </View>

          <View style={styles.infoCard}>
            <Icon name="info" size={16} color="#2E7D32" />
            <Text style={styles.infoText}>Jika tidak check-out sesuai estimasi + 30 menit buffer, kontak darurat akan diberitahu.</Text>
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={handleCheckIn}>
            <Icon name="play-arrow" size={20} color="#fff" />
            <Text style={styles.startBtnText}>Mulai Pendakian</Text>
          </TouchableOpacity>
        </>
      )}

      {mode === 'active' && (
        <>
          <Text style={styles.pageTitle}>Pendakian Aktif</Text>
          <View style={styles.activeBadge}><Icon name="timer" size={16} color="#fff" /><Text style={styles.activeText}>Sedang Mendaki</Text></View>

          <MapViewComponent centerCoordinate={{ latitude: -6.789, longitude: 106.822 }} zoomLevel={15} style={{ width: width - 32, height: 200 }} markers={[]} showUserLocation showBreadcrumb />

          <View style={styles.statsGrid}>
            <View style={styles.statCard}><Text style={styles.statValue}>{trackingDuration}</Text><Text style={styles.statLabel}>Durasi</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{distance}</Text><Text style={styles.statLabel}>Jarak</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{elevationGain}</Text><Text style={styles.statLabel}>Elevasi</Text></View>
            <View style={styles.statCard}><Text style={styles.statValue}>{avgSpeed}</Text><Text style={styles.statLabel}>Kecepatan</Text></View>
          </View>

          <TouchableOpacity style={styles.finishBtn} onPress={() => setMode('checkout')}>
            <Icon name="stop" size={20} color="#fff" />
            <Text style={styles.finishBtnText}>Selesaikan Pendakian</Text>
          </TouchableOpacity>
        </>
      )}

      {mode === 'checkout' && (
        <>
          <Text style={styles.pageTitle}>Check-Out</Text>
          <Text style={styles.subtitle}>Konfirmasi Anda telah kembali dengan selamat</Text>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Ringkasan Pendakian</Text>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Gunung</Text><Text style={styles.summaryValue}>Gunung Gede - Cibodas</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Durasi</Text><Text style={styles.summaryValue}>2 jam 15 menit</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Jarak</Text><Text style={styles.summaryValue}>3.2 km</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Elevasi</Text><Text style={styles.summaryValue}>+450 m</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Rata-rata</Text><Text style={styles.summaryValue}>1.2 km/j</Text></View>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.shareBtn}>
              <Icon name="share" size={16} color="#2E7D32" />
              <Text style={styles.shareBtnText}>Bagikan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportBtn}>
              <Icon name="file-download" size={16} color="#2E7D32" />
              <Text style={styles.shareBtnText}>Export GPX</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.confirmBtn} onPress={handleCheckOut}>
            <Icon name="check-circle" size={20} color="#fff" />
            <Text style={styles.confirmBtnText}>Konfirmasi Check-Out</Text>
          </TouchableOpacity>
        </>
      )}

      {mode === 'overdue' && (
        <>
          <View style={styles.overdueHeader}>
            <Icon name="warning" size={40} color="#D32F2F" />
            <Text style={styles.overdueTitle}>TERLAMBAT</Text>
            <Text style={styles.overdueSub}>Sudah 45 menit dari estimasi kembali</Text>
          </View>

          <MapViewComponent centerCoordinate={{ latitude: -6.789, longitude: 106.822 }} zoomLevel={13} style={{ width: width - 32, height: 180 }} markers={[]} showUserLocation showBreadcrumb />

          <View style={styles.overdueTimeline}>
            <View style={styles.overdueStep}><View style={[styles.overdueDot, styles.overdueDone]} /><Text style={styles.overdueStepText}>Kontak darurat diberitahu</Text><Icon name="check" size={16} color="#2E7D32" /></View>
            <View style={styles.overdueStep}><View style={[styles.overdueDot, styles.overdueDone]} /><Text style={styles.overdueStepText}>Basecamp diberitahu</Text><Icon name="check" size={16} color="#2E7D32" /></View>
            <View style={styles.overdueStep}><View style={[styles.overdueDot, styles.overduePending]} /><Text style={styles.overdueStepText}>Proses pemberitahuan SAR</Text><Icon name="hourglass-top" size={16} color="#F57C00" /></View>
          </View>

          <TouchableOpacity style={styles.iamSafeBtn}>
            <Icon name="check-circle" size={20} color="#fff" />
            <Text style={styles.iamSafeText}>Saya Aman!</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#757575', marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#212121', marginTop: 16, marginBottom: 8 },
  tripSelect: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, gap: 10, elevation: 1 },
  tripSelected: { borderWidth: 2, borderColor: '#2E7D32' },
  tripIcon: {},
  tripName: { fontSize: 15, fontWeight: '600', color: '#212121' },
  tripMeta: { fontSize: 12, color: '#757575' },
  timeInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, gap: 8 },
  timeField: { fontSize: 16, fontWeight: 'bold', color: '#212121', width: 60 },
  timeLabel: { fontSize: 13, color: '#757575' },
  infoCard: { flexDirection: 'row', backgroundColor: '#E8F5E9', padding: 12, borderRadius: 10, marginVertical: 16, gap: 8 },
  infoText: { fontSize: 13, color: '#2E7D32', flex: 1 },
  startBtn: { flexDirection: 'row', backgroundColor: '#2E7D32', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
  startBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  activeBadge: { flexDirection: 'row', backgroundColor: '#F57C00', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', gap: 4, marginBottom: 12 },
  activeText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 16 },
  statCard: { width: (width - 48) / 2, backgroundColor: '#fff', padding: 14, borderRadius: 10, elevation: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
  statLabel: { fontSize: 12, color: '#757575', marginTop: 2 },
  finishBtn: { flexDirection: 'row', backgroundColor: '#2E7D32', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
  finishBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  summaryCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 1 },
  summaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  summaryLabel: { fontSize: 14, color: '#757575' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#212121' },
  btnRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  shareBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderWidth: 1, borderColor: '#2E7D32', borderRadius: 10, gap: 4 },
  exportBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderWidth: 1, borderColor: '#2E7D32', borderRadius: 10, gap: 4 },
  shareBtnText: { color: '#2E7D32', fontWeight: '600', fontSize: 14 },
  confirmBtn: { flexDirection: 'row', backgroundColor: '#2E7D32', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
  confirmBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  overdueHeader: { alignItems: 'center', backgroundColor: '#FFEBEE', padding: 24, borderRadius: 16, marginBottom: 16 },
  overdueTitle: { fontSize: 24, fontWeight: 'bold', color: '#D32F2F', marginTop: 8 },
  overdueSub: { fontSize: 14, color: '#D32F2F', marginTop: 4 },
  overdueTimeline: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16 },
  overdueStep: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  overdueDot: { width: 10, height: 10, borderRadius: 5 },
  overdueDone: { backgroundColor: '#2E7D32' },
  overduePending: { backgroundColor: '#F57C00' },
  overdueStepText: { flex: 1, fontSize: 14, color: '#212121' },
  iamSafeBtn: { flexDirection: 'row', backgroundColor: '#2E7D32', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
  iamSafeText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default CheckInOutScreen;
