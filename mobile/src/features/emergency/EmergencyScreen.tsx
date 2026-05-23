import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MapViewComponent from '../../shared/components/MapView';
import { RootState, AppDispatch } from '../../shared/store';
import { resolveSOS } from '../../shared/store/slices/emergencySlice';

const { width } = Dimensions.get('window');

const EmergencyScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentSOS } = useSelector((state: RootState) => state.emergency);
  const [countdown, setCountdown] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps = [
    { label: 'SOS Terkirim', icon: 'check-circle', status: 'completed' },
    { label: 'Kontak Darurat Diberitahu', icon: 'people', status: currentStep >= 1 ? 'completed' : 'pending' },
    { label: 'Basecamp Diberitahu', icon: 'home', status: currentStep >= 2 ? 'completed' : 'pending' },
    { label: 'SAR Dihubungi', icon: 'local-hospital', status: currentStep >= 3 ? 'completed' : 'pending' },
  ];

  const emergencyContacts = [
    { name: 'Ibu Sari', phone: '081234567890', relationship: 'Ibu' },
    { name: 'Bpak Hendra', phone: '089876543210', relationship: 'Saudara' },
  ];

  const sarContacts = [
    { name: 'BNPB', phone: '021-29827999' },
    { name: 'Basarnas', phone: '021-65701116' },
    { name: 'Basecamp Gede', phone: '0263221234' },
  ];

  useEffect(() => {
    if (countdown < steps.length) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length - 1) return prev + 1;
          return prev;
        });
      }, 4000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [countdown]);

  const handleSafe = () => {
    Alert.alert('Konfirmasi', 'Pastikan Anda dalam kondisi aman sebelum menyelesaikan SOS.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Saya Aman', style: 'destructive', onPress: () => dispatch(resolveSOS()) },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Batalkan SOS', 'Pastikan ini adalah alarm palsu. Status akan dicatat.', [
      { text: 'Tetap SOS', style: 'cancel' },
      { text: 'Batalkan', onPress: () => dispatch(resolveSOS()) },
    ]);
  };

  const callNumber = (phone: string) => Linking.openURL(`tel:${phone}`);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.sosBadge}>
          <Icon name="warning" size={20} color="#fff" />
          <Text style={styles.sosText}>SOS AKTIF</Text>
        </View>
        <Text style={styles.subtitle}>Status darurat sedang diproses</Text>
      </View>

      <MapViewComponent
        centerCoordinate={{ latitude: -6.789, longitude: 106.822 }}
        zoomLevel={13}
        style={{ width, height: 220 }}
        markers={[{ id: '1', coordinate: { latitude: -6.789, longitude: 106.822 }, title: 'Lokasi Anda', isSOS: true }]}
        showUserLocation
        showBreadcrumb={false}
      />

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Status Notifikasi</Text>
        {steps.map((step, idx) => (
          <View key={idx} style={styles.stepRow}>
            <View style={[styles.stepIcon, { backgroundColor: idx <= currentStep ? '#2E7D32' : '#E0E0E0' }]}>
              <Icon name={step.icon as any} size={16} color={idx <= currentStep ? '#fff' : '#757575'} />
            </View>
            <Text style={[styles.stepLabel, idx <= currentStep ? styles.stepActive : styles.stepPending]}>{step.label}</Text>
            {idx <= currentStep ? (
              <Icon name="check" size={18} color="#2E7D32" />
            ) : (
              <View style={styles.stepDot} />
            )}
          </View>
        ))}

        <Text style={styles.sectionTitle}>Kontak Darurat</Text>
        {emergencyContacts.map((contact, idx) => (
          <View key={idx} style={styles.contactRow}>
            <Icon name="person" size={20} color="#757575" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactMeta}>{contact.relationship}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={() => callNumber(contact.phone)}>
              <Icon name="call" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Kontak SAR</Text>
        <View style={styles.sarGrid}>
          {sarContacts.map((sar, idx) => (
            <TouchableOpacity key={idx} style={styles.sarCard} onPress={() => callNumber(sar.phone)}>
              <Icon name="local-hospital" size={24} color="#D32F2F" />
              <Text style={styles.sarName}>{sar.name}</Text>
              <Text style={styles.sarPhone}>{sar.phone}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.safeBtn} onPress={handleSafe}>
          <Icon name="check-circle" size={20} color="#fff" />
          <Text style={styles.safeBtnText}>Saya Aman</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelBtnText}>Batalkan SOS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { backgroundColor: '#D32F2F', padding: 20, alignItems: 'center' },
  sosBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  sosText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 14 },
  subtitle: { color: 'rgba(255,255,255,0.8)', marginTop: 8, fontSize: 13 },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#212121', marginTop: 16, marginBottom: 10 },
  stepRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  stepIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  stepLabel: { flex: 1, fontSize: 14 },
  stepActive: { color: '#212121', fontWeight: '500' },
  stepPending: { color: '#9E9E9E' },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E0E0E0' },
  contactRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, elevation: 1, gap: 12 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 14, fontWeight: '600', color: '#212121' },
  contactMeta: { fontSize: 12, color: '#757575' },
  callBtn: { backgroundColor: '#2E7D32', padding: 10, borderRadius: 20 },
  sarGrid: { flexDirection: 'row', gap: 10 },
  sarCard: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 10, alignItems: 'center', elevation: 1, borderWidth: 1, borderColor: '#FFCDD2' },
  sarName: { fontSize: 13, fontWeight: 'bold', color: '#D32F2F', marginTop: 4 },
  sarPhone: { fontSize: 11, color: '#757575', marginTop: 2 },
  bottomActions: { flexDirection: 'row', padding: 16, gap: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  safeBtn: { flex: 1, backgroundColor: '#2E7D32', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14, borderRadius: 10, gap: 6 },
  safeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 14, borderWidth: 1, borderColor: '#D32F2F', borderRadius: 10, justifyContent: 'center' },
  cancelBtnText: { color: '#D32F2F', fontWeight: '600', fontSize: 14 },
});

export default EmergencyScreen;
