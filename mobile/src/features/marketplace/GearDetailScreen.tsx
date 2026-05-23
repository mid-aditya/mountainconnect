import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const GearDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { item } = route.params;
  const [selectedImage, setSelectedImage] = useState(0);

  const images = [1, 2, 3, 4];
  const reviews = [
    { user: 'Andi K.', rating: 5, comment: 'Sangat puas dengan kualitasnya. Seperti baru!', date: '10 Feb 2024' },
    { user: 'Lisa M.', rating: 4, comment: 'Good condition, pengiriman cepat.', date: '5 Jan 2024' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.imageGallery}>
          <View style={styles.mainImage} />
          <View style={styles.imageIndicators}>
            {images.map((_, i) => <View key={i} style={[styles.dot, i === selectedImage && styles.dotActive]} />)}
          </View>
        </View>

        <View style={styles.details}>
          <Text style={styles.price}>{item.price}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.badges}>
            <View style={styles.conditionBadge}><Text style={styles.conditionText}>{item.condition}</Text></View>
            <Text style={styles.category}>{item.category}</Text>
          </View>

          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar} />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{item.seller}</Text>
              <Text style={styles.sellerMeta}>⭐ {item.rating} · Terjual 23 · Bandung</Text>
            </View>
            <View style={styles.verifiedBadge}><Icon name="verified" size={14} color="#fff" /></View>
          </View>

          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <Text style={styles.description}>Gear dalam kondisi sangat terawat. Hanya dipakai 3 kali untuk pendakian ringan. Tidak ada kerusakan atau cacat. Semua zipper berfungsi normal. Include rainfly original.{'\n\n'}Bisa COD Bandung/Jakarta atau kirim via JNE/SiCepat. Warranty 7 hari jika ada masalah.</Text>

          <View style={styles.locationRow}>
            <Icon name="location-on" size={16} color="#757575" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>

        <View style={styles.reviews}>
          <Text style={styles.sectionTitle}>Review Transaksi ({reviews.length})</Text>
          {reviews.map((r, i) => (
            <View key={i} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewAvatar} />
                <View><Text style={styles.reviewUser}>{r.user}</Text><Text style={styles.reviewDate}>{r.date}</Text></View>
                <Text style={styles.reviewRating}>⭐ {r.rating}</Text>
              </View>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.chatBtn}>
          <Icon name="chat" size={18} color="#2E7D32" />
          <Text style={styles.chatBtnText}>Chat Seller</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyBtn}>
          <Icon name="shopping-cart" size={18} color="#fff" />
          <Text style={styles.buyBtnText}>Beli dengan Escrow</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.reportLink}>
        <Icon name="flag" size={14} color="#9E9E9E" />
        <Text style={styles.reportText}>Laporkan Iklan</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { paddingBottom: 140 },
  imageGallery: { height: 320, backgroundColor: '#E0E0E0', position: 'relative' },
  mainImage: { width, height: 320, backgroundColor: '#D5D5D5' },
  imageIndicators: { position: 'absolute', bottom: 16, flexDirection: 'row', justifyContent: 'center', width: '100%', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotActive: { backgroundColor: '#fff', width: 20 },
  details: { padding: 16 },
  price: { fontSize: 24, fontWeight: 'bold', color: '#2E7D32' },
  title: { fontSize: 17, fontWeight: '600', color: '#212121', marginTop: 4, marginBottom: 8 },
  badges: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  conditionBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  conditionText: { fontSize: 12, color: '#2E7D32', fontWeight: '600' },
  category: { fontSize: 12, color: '#757575', alignSelf: 'center' },
  sellerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 16, elevation: 1, gap: 10 },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E0E0E0' },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: 15, fontWeight: '600', color: '#212121' },
  sellerMeta: { fontSize: 12, color: '#757575' },
  verifiedBadge: { backgroundColor: '#2E7D32', padding: 6, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 8, marginTop: 8 },
  description: { fontSize: 14, color: '#424242', lineHeight: 22 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 4 },
  locationText: { fontSize: 13, color: '#757575' },
  reviews: { padding: 16, borderTopWidth: 8, borderTopColor: '#F0F0F0' },
  reviewCard: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 8, elevation: 1 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E0E0E0' },
  reviewUser: { fontSize: 14, fontWeight: '600', color: '#212121' },
  reviewDate: { fontSize: 11, color: '#BDBDBD' },
  reviewRating: { marginLeft: 'auto', fontSize: 13 },
  reviewComment: { fontSize: 13, color: '#424242', lineHeight: 18 },
  bottomActions: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E0E0E0', gap: 10 },
  chatBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderWidth: 2, borderColor: '#2E7D32', borderRadius: 10, gap: 6 },
  chatBtnText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 14 },
  buyBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2E7D32', padding: 14, borderRadius: 10, gap: 6 },
  buyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  reportLink: { position: 'absolute', bottom: 100, right: 16, flexDirection: 'row', alignItems: 'center', gap: 4 },
  reportText: { fontSize: 12, color: '#9E9E9E' },
});

export default GearDetailScreen;
