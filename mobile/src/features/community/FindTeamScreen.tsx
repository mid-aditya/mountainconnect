import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TEAMS = [
  { id: '1', host: 'Fitri Hiker', title: 'Open Trip Gede 15-16 Mar', mountain: 'Gunung Gede', date: '15-16 Mar 2024', members: 4, maxMembers: 8, price: 'Rp 350K', level: 'Intermediate', desc: 'Trip santai lewat jalur Cibodas. Include porter & konsumsi.', isJoined: false },
  { id: '2', host: 'Rinjani Pro', title: 'Rinjani Summit via Senaru', mountain: 'Gunung Rinjani', date: '22-25 Mar 2024', members: 6, maxMembers: 6, price: 'Rp 1.2jt', level: 'Advanced', desc: 'Full service termasuk guide expert, sudah full capacity.', isJoined: true },
  { id: '3', host: 'Sahabat Alam', title: 'Merbabu Sunrise via Selo', mountain: 'Gunung Merbabu', date: '10-11 Mar 2024', members: 3, maxMembers: 10, price: 'Rp 250K', level: 'Pemula', desc: 'Cocok untuk pemula. Include sarapan & dokumentasi.', isJoined: false },
  { id: '4', host: 'Summit Club', title: 'Semeru 3 Hari 2 Malam', mountain: 'Gunung Semeru', date: '5-7 Apr 2024', members: 8, maxMembers: 12, price: 'Rp 800K', level: 'Expert', desc: 'Rute Ranupane. Wajib pengalaman minimal Rinjani.', isJoined: false },
  { id: '5', host: 'Basecamp Gede', title: 'Weekend Escape Gede', mountain: 'Gunung Gede', date: '17-18 Mar 2024', members: 5, maxMembers: 10, price: 'Rp 285K', level: 'Intermediate', desc: 'Include camping gear, tent, sleeping bag.', isJoined: false },
];

const MOUNTAINS = ['Semua Gunung', 'Gunung Gede', 'Gunung Rinjani', 'Gunung Semeru', 'Gunung Merbabu', 'Gunung Merapi'];
const LEVELS = ['Semua Level', 'Pemula', 'Intermediate', 'Advanced', 'Expert'];

const FindTeamScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ mountain: 'Semua Gunung', level: 'Semua Level', minBudget: '', maxBudget: '' });

  const filteredTeams = TEAMS.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.mountain.toLowerCase().includes(search.toLowerCase());
    const matchMountain = filters.mountain === 'Semua Gunung' || t.mountain === filters.mountain;
    const matchLevel = filters.level === 'Semua Level' || t.level === filters.level;
    return matchSearch && matchMountain && matchLevel;
  });

  const renderTeam = ({ item }: { item: typeof TEAMS[0] }) => (
    <View style={styles.teamCard}>
      <View style={styles.cardHeader}>
        <View style={styles.hostAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.hostName}>{item.host}</Text>
          <Text style={styles.teamDate}>{item.date}</Text>
        </View>
        <View style={[styles.levelBadge, { backgroundColor: item.level === 'Pemula' ? '#E8F5E9' : item.level === 'Intermediate' ? '#FFF8E1' : '#FFEBEE' }]}>
          <Text style={[styles.levelText, { color: item.level === 'Pemula' ? '#2E7D32' : item.level === 'Intermediate' ? '#F57C00' : '#D32F2F' }]}>{item.level}</Text>
        </View>
      </View>
      <Text style={styles.teamTitle}>{item.title}</Text>
      <View style={styles.teamMeta}>
        <View style={styles.metaItem}><Icon name="terrain" size={14} color="#757575" /><Text style={styles.metaText}>{item.mountain}</Text></View>
        <View style={styles.metaItem}><Icon name="people" size={14} color="#757575" /><Text style={styles.metaText}>{item.members}/{item.maxMembers}</Text></View>
        <View style={styles.metaItem}><Icon name="attach-money" size={14} color="#757575" /><Text style={styles.metaText}>{item.price}</Text></View>
      </View>
      <Text style={styles.teamDesc} numberOfLines={2}>{item.desc}</Text>
      {item.isJoined ? (
        <TouchableOpacity style={styles.chatBtn} onPress={() => navigation.navigate('Chat', { team: item })}>
          <Icon name="chat" size={16} color="#fff" /><Text style={styles.chatBtnText}>Chat Group</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.joinBtn}>
            <Text style={styles.joinBtnText}>Request Join</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailBtn}>
            <Text style={styles.detailBtnText}>Detail</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput style={styles.searchInput} placeholder="Cari tim atau gunung..." value={search} onChangeText={setSearch} placeholderTextColor="#757575" />
        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilters(true)}>
          <Icon name="filter-list" size={22} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <FlatList data={filteredTeams} renderItem={renderTeam} keyExtractor={item => item.id} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} />

      <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Pencarian</Text>
            <Text style={styles.filterLabel}>Gunung</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipScroll}>
              {MOUNTAINS.map(m => (
                <TouchableOpacity key={m} style={[styles.filterChip, filters.mountain === m && styles.filterChipActive]} onPress={() => setFilters({ ...filters, mountain: m })}>
                  <Text style={[styles.filterChipText, filters.mountain === m && styles.filterChipTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.filterLabel}>Level</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipScroll}>
              {LEVELS.map(l => (
                <TouchableOpacity key={l} style={[styles.filterChip, filters.level === l && styles.filterChipActive]} onPress={() => setFilters({ ...filters, level: l })}>
                  <Text style={[styles.filterChipText, filters.level === l && styles.filterChipTextActive]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.filterLabel}>Budget</Text>
            <View style={styles.budgetRow}>
              <TextInput style={styles.budgetInput} placeholder="Min" value={filters.minBudget} onChangeText={t => setFilters({ ...filters, minBudget: t })} keyboardType="numeric" />
              <Text style={styles.budgetSep}>-</Text>
              <TextInput style={styles.budgetInput} placeholder="Max" value={filters.maxBudget} onChangeText={t => setFilters({ ...filters, maxBudget: t })} keyboardType="numeric" />
            </View>
            <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilters(false)}>
              <Text style={styles.applyBtnText}>Terapkan Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  searchRow: { flexDirection: 'row', padding: 16, gap: 10 },
  searchInput: { flex: 1, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, height: 44, fontSize: 14, color: '#212121', elevation: 1 },
  filterBtn: { width: 44, height: 44, backgroundColor: '#fff', borderRadius: 10, justifyContent: 'center', alignItems: 'center', elevation: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  teamCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  hostAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E0E0E0' },
  hostName: { fontSize: 14, fontWeight: '600', color: '#212121' },
  teamDate: { fontSize: 11, color: '#757575' },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  levelText: { fontSize: 11, fontWeight: '600' },
  teamTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  teamMeta: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12, color: '#757575' },
  teamDesc: { fontSize: 13, color: '#757575', lineHeight: 18, marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 8 },
  joinBtn: { flex: 1, backgroundColor: '#2E7D32', padding: 10, borderRadius: 8, alignItems: 'center' },
  joinBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  detailBtn: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8 },
  detailBtnText: { color: '#757575', fontSize: 13 },
  chatBtn: { flexDirection: 'row', backgroundColor: '#2E7D32', padding: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', gap: 4 },
  chatBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121', marginBottom: 16 },
  filterLabel: { fontSize: 14, fontWeight: '600', color: '#212121', marginBottom: 8, marginTop: 8 },
  filterChipScroll: { marginBottom: 4 },
  filterChip: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: '#F0F0F0', borderRadius: 16, marginRight: 8 },
  filterChipActive: { backgroundColor: '#2E7D32' },
  filterChipText: { fontSize: 13, color: '#424242' },
  filterChipTextActive: { color: '#fff' },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  budgetInput: { flex: 1, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, padding: 10, fontSize: 14, color: '#212121' },
  budgetSep: { fontSize: 16, color: '#757575' },
  applyBtn: { backgroundColor: '#2E7D32', padding: 14, borderRadius: 10, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});

export default FindTeamScreen;
