import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const GEAR_ITEMS = [
  { id: '1', title: 'Carrier Eiger Trail 45L - Like New', price: 'Rp 850.000', condition: 'Like New', category: 'Carrier', location: 'Bandung', seller: 'MiaHiker', rating: 4.8, image: null },
  { id: '2', title: 'Tenda Naturehike CloudUp 2P', price: 'Rp 1.200.000', condition: 'New', category: 'Tenda', location: 'Jakarta', seller: 'GearShopID', rating: 4.9, image: null },
  { id: '3', title: 'Sleeping Bag Consina Extreme -5°C', price: 'Rp 450.000', condition: 'Good', category: 'Sleeping Bag', location: 'Yogyakarta', seller: 'DoniTrek', rating: 4.5, image: null },
  { id: '4', title: 'Sepatu Eiger Blacknut Series 42', price: 'Rp 650.000', condition: 'Good', category: 'Sepatu', location: 'Surabaya', seller: 'JalanTerus', rating: 4.7, image: null },
  { id: '5', title: 'Kompor Camping Gas Portable', price: 'Rp 120.000', condition: 'New', category: 'Cookware', location: 'Malang', seller: 'BasecampStore', rating: 5.0, image: null },
  { id: '6', title: 'Jaket Eiger Aquaproof M', price: 'Rp 380.000', condition: 'Like New', category: 'Jaket', location: 'Bandung', seller: 'RainHunter', rating: 4.6, image: null },
];

const CATEGORIES = ['Semua', 'Tenda', 'Carrier', 'Sleeping Bag', 'Jaket', 'Sepatu', 'Cookware', 'Lampu', 'Lainnya'];
const SORT_OPTIONS = ['Terbaru', 'Harga Terendah', 'Harga Tertinggi'];

const MarketplaceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sort, setSort] = useState('Terbaru');
  const [isListView, setIsListView] = useState(true);

  const filteredItems = GEAR_ITEMS.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    return matchSearch && matchCategory;
  }).sort((a, b) => {
    if (sort === 'Harga Terendah') return parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, ''));
    if (sort === 'Harga Tertinggi') return parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, ''));
    return 0;
  });

  const getConditionColor = (c: string) => {
    switch (c) { case 'New': return '#2E7D32'; case 'Like New': return '#558B2F'; case 'Good': return '#F57C00'; default: return '#757575'; }
  };

  const renderItem = ({ item }: { item: typeof GEAR_ITEMS[0] }) => (
    <TouchableOpacity style={isListView ? styles.listCard : styles.gridCard} onPress={() => navigation.navigate('GearDetail', { item })}>
      <View style={isListView ? styles.listImage : styles.gridImage} />
      <View style={styles.cardContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemPrice}>{item.price}</Text>
        <View style={styles.itemMeta}>
          <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(item.condition) + '20' }]}>
            <Text style={[styles.conditionText, { color: getConditionColor(item.condition) }]}>{item.condition}</Text>
          </View>
          <Text style={styles.itemLocation}><Icon name="location-on" size={12} color="#757575" /> {item.location}</Text>
        </View>
        <View style={styles.sellerRow}>
          <View style={styles.sellerAvatar} />
          <Text style={styles.sellerName}>{item.seller}</Text>
          <Text style={styles.sellerRating}>⭐ {item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#757575" />
        <TextInput style={styles.searchInput} placeholder="Cari gear outdoor..." value={search} onChangeText={setSearch} placeholderTextColor="#757575" />
        <TouchableOpacity onPress={() => setIsListView(!isListView)}>
          <Icon name={isListView ? 'view-module' : 'view-list'} size={20} color="#757575" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContent}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} style={[styles.chip, selectedCategory === cat && styles.chipActive]} onPress={() => setSelectedCategory(cat)}>
            <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sortRow}>
        <Text style={styles.resultCount}>{filteredItems.length} hasil</Text>
        <TouchableOpacity style={styles.sortBtn}>
          <Icon name="sort" size={16} color="#757575" />
          <Text style={styles.sortText}>{sort}</Text>
        </TouchableOpacity>
      </View>

      <FlatList data={filteredItems} renderItem={renderItem} keyExtractor={item => item.id} contentContainerStyle={styles.listContent} numColumns={isListView ? 1 : 2} key={isListView ? 'list' : 'grid'} showsVerticalScrollIndicator={false} />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('CreateListing')}>
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, borderRadius: 10, paddingHorizontal: 12, elevation: 2, gap: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 15, color: '#212121' },
  chipScroll: { marginBottom: 8 },
  chipContent: { paddingHorizontal: 16, gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#fff', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  chipActive: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  chipText: { fontSize: 13, color: '#212121', fontWeight: '500' },
  chipTextActive: { color: '#fff' },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  resultCount: { fontSize: 13, color: '#757575' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sortText: { fontSize: 13, color: '#757575' },
  listContent: { paddingHorizontal: 16, paddingBottom: 80 },
  listCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, elevation: 1, gap: 12 },
  gridCard: { width: (width - 48) / 2, backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 8, marginRight: 8, elevation: 1 },
  listImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#E0E0E0' },
  gridImage: { width: '100%', height: 120, borderRadius: 8, backgroundColor: '#E0E0E0', marginBottom: 8 },
  cardContent: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#212121', marginBottom: 2 },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32', marginBottom: 4 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  conditionBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  conditionText: { fontSize: 11, fontWeight: '600' },
  itemLocation: { fontSize: 12, color: '#757575' },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sellerAvatar: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#E0E0E0' },
  sellerName: { fontSize: 12, color: '#757575' },
  sellerRating: { fontSize: 11, color: '#F57C00', marginLeft: 'auto' },
  fab: { position: 'absolute', bottom: 24, right: 16, backgroundColor: '#2E7D32', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
});

export default MarketplaceScreen;
