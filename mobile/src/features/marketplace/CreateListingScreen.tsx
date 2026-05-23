import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];
const CATEGORIES = ['Tenda', 'Carrier', 'Sleeping Bag', 'Jaket', 'Sepatu', 'Cookware', 'Lampu', 'Aksesoris', 'Lainnya'];

const CreateListingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const isValid = title.length >= 5 && description.length >= 20 && price && condition && category && agreeTerms;

  const handleAddImage = () => {
    if (images.length >= 5) { Alert.alert('Maksimal 5 foto'); return; }
    Alert.alert('Tambah Foto', 'Pilih sumber foto', [
      { text: 'Kamera', onPress: () => setImages([...images, 'camera']) },
      { text: 'Galeri', onPress: () => setImages([...images, 'gallery']) },
      { text: 'Batal', style: 'cancel' },
    ]);
  };

  const handleSubmit = () => {
    if (!isValid) return;
    Alert.alert('✅ Listing Dibuat', 'Item Anda akan ditinjau dalam 24 jam.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Buat Iklan Baru</Text>

      <Text style={styles.label}>Foto ({images.length}/5)</Text>
      <View style={styles.imageGrid}>
        {images.map((_, i) => (
          <View key={i} style={styles.imageSlot}><View style={styles.slotPlaceholder}><Icon name="image" size={24} color="#BDBDBD" /></View></View>
        ))}
        {images.length < 5 && (
          <TouchableOpacity style={styles.addSlot} onPress={handleAddImage}>
            <Icon name="add-a-photo" size={24} color="#757575" />
            <Text style={styles.addSlotText}>Tambah Foto</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.label}>Judul</Text>
      <TextInput style={styles.input} placeholder="Contoh: Carrier Eiger Trail 45L - Like New" value={title} onChangeText={setTitle} maxLength={100} />
      <Text style={styles.charCount}>{title.length}/100</Text>

      <Text style={styles.label}>Deskripsi</Text>
      <TextInput style={[styles.input, styles.multiline]} placeholder="Jelaskan kondisi, ukuran, defect, dll" value={description} onChangeText={setDescription} multiline maxLength={1000} />
      <Text style={styles.charCount}>{description.length}/1000</Text>

      <Text style={styles.label}>Harga (Rp)</Text>
      <View style={styles.priceRow}>
        <Text style={styles.pricePrefix}>Rp</Text>
        <TextInput style={styles.priceInput} placeholder="850.000" value={price} onChangeText={setPrice} keyboardType="numeric" />
      </View>

      <Text style={styles.label}>Kondisi</Text>
      <View style={styles.chipRow}>
        {CONDITIONS.map(c => (
          <TouchableOpacity key={c} style={[styles.chip, condition === c && styles.chipActive]} onPress={() => setCondition(c)}>
            <Text style={[styles.chipText, condition === c && styles.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Kategori</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map(c => (
          <TouchableOpacity key={c} style={[styles.chip, category === c && styles.chipActive]} onPress={() => setCategory(c)}>
            <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Lokasi</Text>
      <TextInput style={styles.input} placeholder="Kota Anda (auto dari profil)" value={location} onChangeText={setLocation} />

      <View style={styles.termsRow}>
        <Switch value={agreeTerms} onValueChange={setAgreeTerms} trackColor={{ true: '#2E7D32' }} />
        <Text style={styles.termsText}>Saya setuju dengan <Text style={styles.termsLink}>Syarat & Ketentuan</Text> jual beli, termasuk penggunaan sistem escrow untuk keamanan transaksi.</Text>
      </View>

      <TouchableOpacity style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]} disabled={!isValid} onPress={handleSubmit}>
        <Text style={styles.submitBtnText}>Buat Iklan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { padding: 16, paddingBottom: 40 },
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: '#212121', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#212121', marginBottom: 8, marginTop: 12 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  imageSlot: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' },
  slotPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  addSlot: { width: 80, height: 80, borderRadius: 8, borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  addSlotText: { fontSize: 11, color: '#757575', marginTop: 2 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, fontSize: 14, color: '#212121', borderWidth: 1, borderColor: '#E0E0E0' },
  multiline: { height: 100, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: '#BDBDBD', textAlign: 'right', marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', paddingLeft: 12 },
  pricePrefix: { fontSize: 14, fontWeight: '600', color: '#212121' },
  priceInput: { flex: 1, height: 44, fontSize: 14, color: '#212121' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E0' },
  chipActive: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  chipText: { fontSize: 13, color: '#424242' },
  chipTextActive: { color: '#fff' },
  termsRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 20, marginBottom: 8, gap: 8 },
  termsText: { flex: 1, fontSize: 13, color: '#757575', lineHeight: 18 },
  termsLink: { color: '#2E7D32', fontWeight: '600' },
  submitBtn: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 12, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#BDBDBD' },
  submitBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default CreateListingScreen;
