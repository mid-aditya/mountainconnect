import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CATEGORIES = ['Semua', 'Info Jalur', 'Gear Review', 'Trip Report', 'Q&A Ranger'];

const FORUM_THREADS = [
  { id: '1', title: 'Info Terbaru Jalur Cibodas setelah Longsor', author: 'Ranger Budi', category: 'Info Jalur', replies: 23, lastActivity: '2 jam lalu', isPinned: true, preview: 'Halo pendaki, setelah longsor bulan lalu...' },
  { id: '2', title: 'Review Carrier Eiger 45L setelah 5 Pendakian', author: 'DewiPendaki', category: 'Gear Review', replies: 15, lastActivity: '4 jam lalu', isPinned: false, preview: 'Setelah 5 kali bawa carrier ini...' },
  { id: '3', title: 'Trip Report: Rinjani Summit via Torean', author: 'AlexMerbabu', category: 'Trip Report', replies: 31, lastActivity: '1 hari lalu', isPinned: false, preview: 'Rinjani via Torean lebih sepi tapi tantangan...' },
  { id: '4', title: 'Tips First Aid untuk Hipotermia Ringan', author: 'Ranger Sari', category: 'Q&A Ranger', replies: 19, lastActivity: '3 jam lalu', isPinned: true, preview: 'Musim hujan sudah tiba, banyak pendaki...' },
  { id: '5', title: 'Rekomendasi Sleeping Bag untuk Semeru', author: 'PemulaJuga', category: 'Q&A Ranger', replies: 8, lastActivity: '6 jam lalu', isPinned: false, preview: 'Mau naik Semeru bulan depan, sleeping bag...' },
  { id: '6', title: 'Jalur Alternatif Gunung Merbabu via Thekelan', author: 'JogjaHiker', category: 'Info Jalur', replies: 12, lastActivity: '8 jam lalu', isPinned: false, preview: 'Thekelan lebih landai dibanding Selo...' },
  { id: '7', title: 'Review Sepatu Hiking Salomon XA Pro 3D', author: 'GearHead', category: 'Gear Review', replies: 9, lastActivity: '1 hari lalu', isPinned: false, preview: 'Setelah 2 tahun pemakaian, sepatu ini...' },
  { id: '8', title: 'Trip Report: Sunrise di Gunung Prau', author: 'SunriseHunter', category: 'Trip Report', replies: 20, lastActivity: '2 hari lalu', isPinned: false, preview: 'Prau adalah gunung favorit untuk sunrise...' },
];

const ForumScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  const filteredThreads = FORUM_THREADS.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'Semua' || t.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const renderThread = ({ item }: { item: typeof FORUM_THREADS[0] }) => (
    <TouchableOpacity style={styles.threadCard} onPress={() => navigation.navigate('ThreadDetail', { thread: item })}>
      {item.isPinned && <View style={styles.pinnedBadge}><Icon name="push-pin" size={12} color="#fff" /><Text style={styles.pinnedText}>Pinned</Text></View>}
      <Text style={styles.threadTitle}>{item.title}</Text>
      <Text style={styles.threadPreview} numberOfLines={2}>{item.preview}</Text>
      <View style={styles.threadMeta}>
        <TouchableOpacity style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </TouchableOpacity>
        <Text style={styles.authorText}>{item.author}</Text>
        <View style={styles.metaRight}>
          <Icon name="chat-bubble-outline" size={14} color="#757575" />
          <Text style={styles.replyCount}>{item.replies}</Text>
          <Text style={styles.activityText}>{item.lastActivity}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#757575" />
        <TextInput style={styles.searchInput} placeholder="Cari forum..." value={search} onChangeText={setSearch} placeholderTextColor="#757575" />
        {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}><Icon name="close" size={20} color="#757575" /></TouchableOpacity>}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContent}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} style={[styles.catChip, selectedCategory === cat && styles.catChipActive]} onPress={() => setSelectedCategory(cat)}>
            <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList data={filteredThreads} renderItem={renderThread} keyExtractor={item => item.id} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} />

      <TouchableOpacity style={styles.fab}>
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, borderRadius: 10, paddingHorizontal: 12, elevation: 2 },
  searchInput: { flex: 1, height: 44, fontSize: 15, color: '#212121', marginLeft: 8 },
  categoryScroll: { marginBottom: 8 },
  categoryContent: { paddingHorizontal: 16, gap: 8 },
  catChip: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#fff', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  catChipActive: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  catText: { fontSize: 13, color: '#212121', fontWeight: '500' },
  catTextActive: { color: '#fff' },
  listContent: { paddingHorizontal: 16, paddingBottom: 80 },
  threadCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, elevation: 1 },
  pinnedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2E7D32', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 6, gap: 2 },
  pinnedText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },
  threadTitle: { fontSize: 15, fontWeight: 'bold', color: '#212121', marginBottom: 4 },
  threadPreview: { fontSize: 13, color: '#757575', lineHeight: 18, marginBottom: 8 },
  threadMeta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  categoryBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  categoryText: { fontSize: 11, color: '#2E7D32', fontWeight: '600' },
  authorText: { fontSize: 12, color: '#757575' },
  metaRight: { flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', gap: 4 },
  replyCount: { fontSize: 12, color: '#757575', fontWeight: '600' },
  activityText: { fontSize: 12, color: '#BDBDBD' },
  fab: { position: 'absolute', bottom: 24, right: 16, backgroundColor: '#2E7D32', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 4 },
});

export default ForumScreen;
