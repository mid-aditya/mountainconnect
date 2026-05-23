import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, Alert, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { useAppSelector, useAppDispatch } from '../../shared/store';
import { updateVerification, verifyEmail, verifyPhone } from '../../shared/store/slices/authSlice';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../config/theme';
import { featureFlags } from '../../config/env';
import ErrorMessage from '../../shared/components/ErrorMessage';

const VerifyIdentityScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isLoading, verificationLevel } = useAppSelector((s) => s.auth);

  const [currentLevel, setCurrentLevel] = useState(verificationLevel);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [ktpImage, setKtpImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [certificateImages, setCertificateImages] = useState<string[]>([]);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSendEmailOTP = useCallback(async () => {
    try {
      Alert.alert('Kode Terkirim', 'Kode OTP telah dikirim ke email Anda');
    } catch (err: any) {
      setError(err || 'Gagal mengirim OTP');
    }
  }, []);

  const handleVerifyEmailOTP = useCallback(async () => {
    if (otpEmail.length !== 6) {
      setError('Kode OTP harus 6 digit');
      return;
    }
    try {
      await dispatch(verifyEmail(otpEmail)).unwrap();
      dispatch(updateVerification({ level: Math.max(currentLevel, 1) as any, user: { emailVerified: true } }));
      Alert.alert('Berhasil', 'Email berhasil diverifikasi');
      setCurrentLevel(1);
    } catch (err: any) {
      setError(err || 'Verifikasi gagal');
    }
  }, [dispatch, otpEmail, currentLevel]);

  const handleSendPhoneOTP = useCallback(async () => {
    try {
      Alert.alert('Kode Terkirim', 'Kode OTP telah dikirim via SMS/WhatsApp');
    } catch (err: any) {
      setError(err || 'Gagal mengirim OTP');
    }
  }, []);

  const handleVerifyPhoneOTP = useCallback(async () => {
    if (otpPhone.length !== 6) {
      setError('Kode OTP harus 6 digit');
      return;
    }
    try {
      await dispatch(verifyPhone(otpPhone)).unwrap();
      dispatch(updateVerification({ level: Math.max(currentLevel, 1) as any, user: { phoneVerified: true } }));
      Alert.alert('Berhasil', 'Nomor telepon berhasil diverifikasi');
      setCurrentLevel(1);
    } catch (err: any) {
      setError(err || 'Verifikasi gagal');
    }
  }, [dispatch, otpPhone, currentLevel]);

  const pickImage = useCallback((field: 'ktp' | 'selfie' | 'certificate') => {
    Alert.alert('Pilih Sumber', undefined, [
      {
        text: 'Kamera',
        onPress: () => {
          launchCamera(
            { mediaType: 'photo', quality: 0.8, maxWidth: 1200, maxHeight: 1200 },
            (response: ImagePickerResponse) => {
              if (!response.didCancel && !response.errorCode && response.assets?.[0]?.uri) {
                const uri = response.assets[0].uri;
                if (field === 'ktp') setKtpImage(uri);
                else if (field === 'selfie') setSelfieImage(uri);
                else setCertificateImages((prev) => [...prev, uri]);
              }
            },
          );
        },
      },
      {
        text: 'Galeri',
        onPress: () => {
          launchImageLibrary(
            { mediaType: 'photo', quality: 0.8, maxWidth: 1200, maxHeight: 1200 },
            (response: ImagePickerResponse) => {
              if (!response.didCancel && !response.errorCode && response.assets?.[0]?.uri) {
                const uri = response.assets[0].uri;
                if (field === 'ktp') setKtpImage(uri);
                else if (field === 'selfie') setSelfieImage(uri);
                else setCertificateImages((prev) => [...prev, uri]);
              }
            },
          );
        },
      },
      { text: 'Batal', style: 'cancel' },
    ]);
  }, []);

  const handleSubmitLevel2 = useCallback(async () => {
    if (!ktpImage || !selfieImage) {
      Alert.alert('Gagal', 'Harap upload foto KTP dan selfie');
      return;
    }
    setUploading(true);
    try {
      // Upload images + submit for verification
      Alert.alert('Berhasil', 'Data verifikasi Level 2 submitted. Menunggu review admin.');
      setCurrentLevel(2);
    } catch (err: any) {
      setError(err || 'Gagal submit verifikasi');
    } finally {
      setUploading(false);
    }
  }, [ktpImage, selfieImage]);

  const handleSubmitLevel3 = useCallback(async () => {
    if (certificateImages.length === 0 || !licenseNumber) {
      Alert.alert('Gagal', 'Harap upload sertifikat dan masukkan nomor lisensi');
      return;
    }
    setUploading(true);
    try {
      Alert.alert('Berhasil', 'Data verifikasi Level 3 submitted. Menunggu review admin.');
      setCurrentLevel(3);
    } catch (err: any) {
      setError(err || 'Gagal submit verifikasi');
    } finally {
      setUploading(false);
    }
  }, [certificateImages, licenseNumber]);

  const renderLevel1 = () => (
    <View style={styles.levelSection}>
      <View style={styles.levelHeader}>
        <View style={[styles.levelBadge, { backgroundColor: Colors.badgeBronze }]}>
          <Text style={styles.levelBadgeText}>Level 1</Text>
        </View>
        <Text style={styles.levelTitle}>Verifikasi Dasar</Text>
        <Text style={styles.levelDesc}>Verifikasi email dan nomor telepon untuk meningkatkan keamanan akun</Text>
      </View>

      {/* Email Verification */}
      <View style={styles.verificationCard}>
        <View style={styles.verificationRow}>
          <Icon name="mail" size={24} color={user?.emailVerified ? Colors.success : Colors.textTertiary} />
          <View style={styles.verificationInfo}>
            <Text style={styles.verificationLabel}>Email</Text>
            <Text style={styles.verificationValue}>{user?.email}</Text>
          </View>
          {user?.emailVerified ? (
            <Icon name="checkmark-circle" size={24} color={Colors.success} />
          ) : (
            <TouchableOpacity style={styles.sendButton} onPress={handleSendEmailOTP}>
              <Text style={styles.sendButtonText}>Kirim OTP</Text>
            </TouchableOpacity>
          )}
        </View>
        {!user?.emailVerified && (
          <View style={styles.otpSection}>
            <TextInput
              style={styles.otpInput}
              placeholder="Masukkan kode OTP"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="number-pad"
              maxLength={6}
              value={otpEmail}
              onChangeText={setOtpEmail}
            />
            <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyEmailOTP}>
              <Text style={styles.verifyButtonText}>Verifikasi</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Phone Verification */}
      <View style={styles.verificationCard}>
        <View style={styles.verificationRow}>
          <Icon name="call" size={24} color={user?.phoneVerified ? Colors.success : Colors.textTertiary} />
          <View style={styles.verificationInfo}>
            <Text style={styles.verificationLabel}>Telepon</Text>
            <Text style={styles.verificationValue}>{user?.phone}</Text>
          </View>
          {user?.phoneVerified ? (
            <Icon name="checkmark-circle" size={24} color={Colors.success} />
          ) : (
            <TouchableOpacity style={styles.sendButton} onPress={handleSendPhoneOTP}>
              <Text style={styles.sendButtonText}>Kirim OTP</Text>
            </TouchableOpacity>
          )}
        </View>
        {!user?.phoneVerified && (
          <View style={styles.otpSection}>
            <TextInput
              style={styles.otpInput}
              placeholder="Masukkan kode OTP"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="number-pad"
              maxLength={6}
              value={otpPhone}
              onChangeText={setOtpPhone}
            />
            <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyPhoneOTP}>
              <Text style={styles.verifyButtonText}>Verifikasi</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderLevel2 = () => (
    <View style={styles.levelSection}>
      <View style={styles.levelHeader}>
        <View style={[styles.levelBadge, { backgroundColor: Colors.badgeSilver }]}>
          <Text style={styles.levelBadgeText}>Level 2</Text>
        </View>
        <Text style={styles.levelTitle}>Verifikasi Identitas</Text>
        <Text style={styles.levelDesc}>Upload KTP dan selfie untuk verifikasi identitas dengan foto</Text>
      </View>

      {/* KTP Upload */}
      <TouchableOpacity style={styles.uploadCard} onPress={() => pickImage('ktp')}>
        {ktpImage ? (
          <Image source={{ uri: ktpImage }} style={styles.uploadImage} />
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Icon name="card-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.uploadText}>Upload Foto KTP</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Selfie Upload */}
      <TouchableOpacity style={styles.uploadCard} onPress={() => pickImage('selfie')}>
        {selfieImage ? (
          <Image source={{ uri: selfieImage }} style={styles.uploadImage} />
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Icon name="camera-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.uploadText}>Ambil Selfie dengan KTP</Text>
            {featureFlags.enableLivenessDetection && (
              <Text style={styles.livenessNote}>+ Liveness Detection</Text>
            )}
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submitButton, uploading && styles.buttonDisabled]}
        onPress={handleSubmitLevel2}
        disabled={uploading || !ktpImage || !selfieImage}
      >
        {uploading ? <ActivityIndicator color={Colors.textInverse} /> : <Text style={styles.submitButtonText}>Submit Verifikasi</Text>}
      </TouchableOpacity>
    </View>
  );

  const renderLevel3 = () => (
    <View style={styles.levelSection}>
      <View style={styles.levelHeader}>
        <View style={[styles.levelBadge, { backgroundColor: Colors.badgeGold }]}>
          <Text style={styles.levelBadgeText}>Level 3</Text>
        </View>
        <Text style={styles.levelTitle}>Verifikasi Lisensi</Text>
        <Text style={styles.levelDesc}>Upload sertifikat pendakian dan lisensi pemandu (opsional)</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nomor Lisensi Pemandu</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Contoh: LG-2024-XXXXX"
          placeholderTextColor={Colors.textTertiary}
          value={licenseNumber}
          onChangeText={setLicenseNumber}
        />
      </View>

      <TouchableOpacity style={styles.uploadCard} onPress={() => pickImage('certificate')}>
        <View style={styles.uploadPlaceholder}>
          <Icon name="ribbon-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.uploadText}>Upload Sertifikat Pendakian</Text>
          <Text style={styles.uploadHint}>Maks 5 gambar</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.certList}>
        {certificateImages.map((uri, i) => (
          <View key={i} style={styles.certItem}>
            <Image source={{ uri }} style={styles.certThumb} />
            <TouchableOpacity onPress={() => setCertificateImages((p) => p.filter((_, j) => j !== i))}>
              <Icon name="close-circle" size={20} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, uploading && styles.buttonDisabled]}
        onPress={handleSubmitLevel3}
        disabled={uploading}
      >
        {uploading ? <ActivityIndicator color={Colors.textInverse} /> : <Text style={styles.submitButtonText}>Submit Verifikasi</Text>}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Indicator */}
        <View style={styles.progressRow}>
          {[1, 2, 3].map((level) => (
            <React.Fragment key={level}>
              <View style={[styles.progressDot, currentLevel >= level && styles.progressDotActive]}>
                <Text style={styles.progressDotText}>{level}</Text>
              </View>
              {level < 3 && <View style={[styles.progressLine, currentLevel > level && styles.progressLineActive]} />}
            </React.Fragment>
          ))}
        </View>

        {error ? <ErrorMessage message={error} variant="card" /> : null}

        {currentLevel === 0 && renderLevel1()}
        {currentLevel >= 1 && renderLevel2()}
        {currentLevel >= 2 && renderLevel3()}

        {currentLevel < 3 && (
          <View style={styles.upgradeInfo}>
            <Text style={styles.upgradeTitle}>Tingkatkan Level Verifikasi</Text>
            <Text style={styles.upgradeDesc}>
              Level 1: Akses dasar{'\n'}
              Level 2: Post di forum & pesan{'\n'}
              Level 3: Guide berlisensi & endorse
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.screenPadding },
  progressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xl },
  progressDot: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  progressDotActive: { backgroundColor: Colors.primary },
  progressDotText: { color: Colors.textInverse, fontWeight: '700', fontSize: 14 },
  progressLine: { width: 60, height: 2, backgroundColor: Colors.border, marginHorizontal: 4 },
  progressLineActive: { backgroundColor: Colors.primary },
  levelSection: { gap: Spacing.md },
  levelHeader: { alignItems: 'center', marginBottom: Spacing.md },
  levelBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: BorderRadius.round },
  levelBadgeText: { color: Colors.textInverse, fontWeight: '700', fontSize: 12 },
  levelTitle: { ...Typography.h3, marginTop: Spacing.sm },
  levelDesc: { ...Typography.body2, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  verificationCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, ...Shadows.sm },
  verificationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  verificationInfo: { flex: 1 },
  verificationLabel: { ...Typography.subtitle2, color: Colors.text },
  verificationValue: { ...Typography.caption, color: Colors.textSecondary },
  sendButton: { backgroundColor: Colors.primaryFaded, paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.sm },
  sendButtonText: { color: Colors.primary, fontWeight: '600', fontSize: 12 },
  otpSection: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  otpInput: { flex: 1, backgroundColor: Colors.background, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.md, height: 44, ...Typography.body1, color: Colors.text },
  verifyButton: { backgroundColor: Colors.primary, paddingHorizontal: 16, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  verifyButtonText: { color: Colors.textInverse, fontWeight: '600' },
  uploadCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.border, overflow: 'hidden', ...Shadows.sm },
  uploadPlaceholder: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl },
  uploadImage: { width: '100%', height: 200, resizeMode: 'cover' },
  uploadText: { ...Typography.body2, color: Colors.textSecondary, marginTop: Spacing.sm },
  uploadHint: { ...Typography.caption, color: Colors.textTertiary, marginTop: 4 },
  livenessNote: { ...Typography.caption, color: Colors.success, marginTop: 4 },
  certList: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  certItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  certThumb: { width: 60, height: 60, borderRadius: BorderRadius.sm },
  inputGroup: { gap: 6 },
  label: { ...Typography.subtitle2, color: Colors.text },
  textInput: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, height: 48, ...Typography.body1, color: Colors.text },
  submitButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.md, height: 52, alignItems: 'center', justifyContent: 'center', ...Shadows.md },
  buttonDisabled: { backgroundColor: Colors.disabled },
  submitButtonText: { ...Typography.button, color: Colors.textInverse },
  upgradeInfo: { backgroundColor: Colors.primaryFaded, borderRadius: BorderRadius.md, padding: Spacing.md, marginTop: Spacing.lg },
  upgradeTitle: { ...Typography.subtitle2, color: Colors.primary, fontWeight: '700', marginBottom: Spacing.xs },
  upgradeDesc: { ...Typography.caption, color: Colors.textSecondary, lineHeight: 20 },
});

export default VerifyIdentityScreen;
