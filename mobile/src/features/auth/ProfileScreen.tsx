import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RootState, AppDispatch } from '../../shared/store';
import { updateProfile } from '../../shared/store/slices/authSlice';
import { encryptData } from '../../shared/services/encryption.service';
import LoadingScreen from '../../shared/components/LoadingScreen';
import Badge from '../../shared/components/Badge';

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    skillLevel: user?.skillLevel || 'Beginner',
  });
  const [emergencyContact, setEmergencyContact] = useState({
    name: user?.emergencyContact?.name || '',
    phone: user?.emergencyContact?.phone || '',
    relationship: user?.emergencyContact?.relationship || '',
  });
  const [medicalInfo, setMedicalInfo] = useState({
    bloodType: user?.medicalInfo?.bloodType || '',
    allergies: user?.medicalInfo?.allergies || '',
    conditions: user?.medicalInfo?.conditions || '',
    medications: user?.medicalInfo?.medications || '',
  });
  const [isEncryptedVisible, setIsEncryptedVisible] = useState(false);

  const handleSave = async () => {
    const encryptedMedical = await encryptData(JSON.stringify(medicalInfo));
    const encryptedEmergency = await encryptData(JSON.stringify(emergencyContact));
    dispatch(updateProfile({
      ...profileData,
      medicalInfo: encryptedMedical,
      emergencyContact: encryptedEmergency,
    }));
    setIsEditing(false);
    Alert.alert('Sukses', 'Profil berhasil diperbarui');
  };

  const handleAvatarPick = () => {
    Alert.alert('Ganti Foto', 'Pilih sumber foto', [
      { text: 'Kamera', onPress: () => {} },
      { text: 'Galeri', onPress: () => {} },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const badges = user?.badges || [
    { id: '1', name: 'First Summit', icon: 'terrain' },
    { id: '2', name: 'Safety First', icon: 'verified' },
    { id: '3', name: 'Eco Warrior', icon: 'eco' },
  ];

  const tripHistory = [
    { id: 1, mountain: 'Gunung Gede', date: '2024-03-15', status: 'Selesai', height: 2958 },
    { id: 2, mountain: 'Gunung Rinjani', date: '2023-08-20', status: 'Selesai', height: 3726 },
  ];

  if (isLoading && !user) return <LoadingScreen />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarPick} style={styles.avatarContainer}>
          <Image
            source={{ uri: user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.fullName || 'User') }}
            style={styles.avatar}
          />
          <View style={styles.cameraIcon}>
            <Icon name="photo-camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{user?.fullName || 'Nama Pengguna'}</Text>
        <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>
        <Badge level={user?.verificationLevel || 1} showLabel />
        <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
          <Icon name="settings" size={24} color="#757575" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Informasi Dasar</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Icon name={isEditing ? 'check' : 'edit'} size={20} color="#2E7D32" />
          </TouchableOpacity>
        </View>
        {isEditing ? (
          <>
            <TextInput style={styles.input} value={profileData.fullName} onChangeText={t => setProfileData({ ...profileData, fullName: t })} placeholder="Nama Lengkap" />
            <TextInput style={[styles.input, styles.multiline]} value={profileData.bio} onChangeText={t => setProfileData({ ...profileData, bio: t })} placeholder="Bio" multiline />
            <Text style={styles.label}>Skill Level</Text>
            <View style={styles.chipRow}>
              {skillLevels.map(level => (
                <TouchableOpacity key={level} style={[styles.chip, profileData.skillLevel === level && styles.chipActive]} onPress={() => setProfileData({ ...profileData, skillLevel: level })}>
                  <Text style={[styles.chipText, profileData.skillLevel === level && styles.chipTextActive]}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Bio</Text><Text style={styles.infoValue}>{profileData.bio || '-'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Skill Level</Text><Text style={styles.infoValue}>{profileData.skillLevel}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone</Text><Text style={styles.infoValue}>{user?.phone || '-'}</Text></View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.sectionHeaderRow} onPress={() => setShowUpgradeModal(true)}>
          <Text style={styles.sectionTitle}>Verifikasi</Text>
          <View style={styles.row}>
            <Text style={styles.verificationLabel}>Level {user?.verificationLevel || 1}</Text>
            <Icon name="chevron-right" size={20} color="#757575" />
          </View>
        </TouchableOpacity>
        <Text style={styles.sectionDesc}>Verifikasi untuk meningkatkan kepercayaan</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kontak Darurat</Text>
        <View style={styles.encryptedBanner}>
          <Icon name="lock" size={16} color="#2E7D32" />
          <Text style={styles.encryptedText}>End-to-end encrypted</Text>
        </View>
        <TextInput style={styles.input} value={emergencyContact.name} onChangeText={t => setEmergencyContact({ ...emergencyContact, name: t })} placeholder="Nama Kontak" />
        <TextInput style={styles.input} value={emergencyContact.phone} onChangeText={t => setEmergencyContact({ ...emergencyContact, phone: t })} placeholder="Nomor Telepon" keyboardType="phone-pad" />
        <TextInput style={styles.input} value={emergencyContact.relationship} onChangeText={t => setEmergencyContact({ ...emergencyContact, relationship: t })} placeholder="Hubungan" />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Info Medis</Text>
          <Switch value={showMedicalModal} onValueChange={setShowMedicalModal} />
        </View>
        {showMedicalModal && (
          <View style={styles.encryptedBanner}>
            <Icon name="lock" size={16} color="#2E7D32" />
            <Text style={styles.encryptedText}>End-to-end encrypted</Text>
          </View>
        )}
        {showMedicalModal && (
          <>
            <TextInput style={styles.input} value={medicalInfo.bloodType} onChangeText={t => setMedicalInfo({ ...medicalInfo, bloodType: t })} placeholder="Golongan Darah" />
            <TextInput style={[styles.input, styles.multiline]} value={medicalInfo.allergies} onChangeText={t => setMedicalInfo({ ...medicalInfo, allergies: t })} placeholder="Alergi" multiline />
            <TextInput style={[styles.input, styles.multiline]} value={medicalInfo.conditions} onChangeText={t => setMedicalInfo({ ...medicalInfo, conditions: t })} placeholder="Kondisi Kesehatan" multiline />
            <TextInput style={[styles.input, styles.multiline]} value={medicalInfo.medications} onChangeText={t => setMedicalInfo({ ...medicalInfo, medications: t })} placeholder="Obat yang Dikonsumsi" multiline />
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lencana</Text>
        <View style={styles.badgeGrid}>
          {badges.map((badge: any) => (
            <View key={badge.id} style={styles.badgeItem}>
              <Icon name={badge.icon} size={32} color="#2E7D32" />
              <Text style={styles.badgeName}>{badge.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Riwayat Pendakian</Text>
        {tripHistory.map(trip => (
          <View key={trip.id} style={styles.tripCard}>
            <Icon name="terrain" size={24} color="#2E7D32" />
            <View style={styles.tripInfo}>
              <Text style={styles.tripName}>{trip.mountain}</Text>
              <Text style={styles.tripMeta}>{trip.height}mdpl · {trip.date} · <Text style={styles.tripStatus}>{trip.status}</Text></Text>
            </View>
            <Icon name="chevron-right" size={20} color="#BDBDBD" />
          </View>
        ))}
      </View>

      <Modal visible={showUpgradeModal} animationType="slide" transparent onRequestClose={() => setShowUpgradeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tingkatkan Verifikasi</Text>
            <View style={styles.levelRow}>
              <View style={[styles.levelBadge, { backgroundColor: '#CD7F32' }]}><Text style={styles.levelText}>Lv 1</Text></View>
              <Text style={styles.levelDesc}>Email & Phone verified</Text>
              {user?.verificationLevel && user.verificationLevel >= 1 && <Icon name="check-circle" size={20} color="#2E7D32" />}
            </View>
            <View style={styles.levelRow}>
              <View style={[styles.levelBadge, { backgroundColor: '#C0C0C0' }]}><Text style={styles.levelText}>Lv 2</Text></View>
              <Text style={styles.levelDesc}>KTP & Selfie verification</Text>
              {user?.verificationLevel && user.verificationLevel >= 2 && <Icon name="check-circle" size={20} color="#2E7D32" />}
            </View>
            <View style={styles.levelRow}>
              <View style={[styles.levelBadge, { backgroundColor: '#FFD700' }]}><Text style={styles.levelText}>Lv 3</Text></View>
              <Text style={styles.levelDesc}>Guide/Certification verified</Text>
              {user?.verificationLevel && user.verificationLevel >= 3 && <Icon name="check-circle" size={20} color="#2E7D32" />}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowUpgradeModal(false)}>
              <Text style={styles.closeBtnText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { paddingBottom: 40 },
  header: { alignItems: 'center', padding: 24, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E0E0E0' },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2E7D32', borderRadius: 12, padding: 4 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  email: { fontSize: 14, color: '#757575', marginBottom: 8 },
  settingsBtn: { position: 'absolute', top: 16, right: 16, padding: 8 },
  section: { backgroundColor: '#FFFFFF', marginTop: 12, padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  sectionDesc: { fontSize: 12, color: '#757575', marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  verificationLabel: { fontSize: 14, color: '#2E7D32', fontWeight: '600', marginRight: 4 },
  input: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 12, fontSize: 14, color: '#212121', marginBottom: 10, backgroundColor: '#FAFAFA' },
  multiline: { height: 80, textAlignVertical: 'top' },
  label: { fontSize: 13, color: '#757575', marginBottom: 6, fontWeight: '500' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#E8F5E9', marginBottom: 8 },
  chipActive: { backgroundColor: '#2E7D32' },
  chipText: { fontSize: 13, color: '#2E7D32' },
  chipTextActive: { color: '#FFFFFF' },
  saveBtn: { backgroundColor: '#2E7D32', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  infoLabel: { fontSize: 14, color: '#757575' },
  infoValue: { fontSize: 14, color: '#212121', fontWeight: '500' },
  encryptedBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: 8, borderRadius: 6, marginBottom: 10 },
  encryptedText: { fontSize: 12, color: '#2E7D32', marginLeft: 6 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  badgeItem: { alignItems: 'center', width: 80 },
  badgeName: { fontSize: 11, color: '#757575', marginTop: 4, textAlign: 'center' },
  tripCard: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#FAFAFA', borderRadius: 8, marginBottom: 8 },
  tripInfo: { flex: 1, marginLeft: 12 },
  tripName: { fontSize: 15, fontWeight: '600', color: '#212121' },
  tripMeta: { fontSize: 12, color: '#757575', marginTop: 2 },
  tripStatus: { color: '#2E7D32', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121', marginBottom: 20 },
  levelRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  levelBadge: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  levelText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  levelDesc: { flex: 1, fontSize: 14, color: '#212121' },
  closeBtn: { backgroundColor: '#2E7D32', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  closeBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});

export default ProfileScreen;
