import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState } from '../../shared/store';

const QUICK_ACTIONS = [
  { id: '1', label: 'SOS', icon: 'warning', color: '#D32F2F', route: 'Emergency', bg: '#FFEBEE' },
  { id: '2', label: 'Check In', icon: 'login', color: '#F57C00', route: 'CheckInOut', bg: '#FFF8E1' },
  { id: '3', label: 'Cari Tim', icon: 'group', color: '#2E7D32', route: 'FindTeam', bg: '#E8F5E9' },
  { id: '4', label: 'Forum', icon: 'forum', color: '#1565C0', route: 'Forum', bg: '#E3F2FD' },
  { id: '5', label: 'Map', icon: 'map', color: '#558B2F', route: 'Maps', bg: '#F1F8E9' },
  { id: '6', label: 'Market', icon: 'store', color: '#6A1B9A', route: 'Marketplace', bg: '#F3E5F5' },
];

const RECOMMENDATIONS = [
  { id: '1', name: 'Gunung Merbabu', match: '95% Match', reason: 'Level Intermediate, budget pas, cuaca cerah', difficulty: 5, image: null },
  { id: '2', name: 'Gunung Prau', match: '88% Match', reason: 'Sunrise view terbaik, cocok pemula', difficulty: 3, image: null },
  { id: '3', name: 'Gunung Lawu', match: '82% Match', reason: 'Jalur landai, banyak air, trek sepi', difficulty: 4, image: null },
];

const RECENT_POSTS = [
  { id: '1', title: 'Info Terbaru Jalur Cibodas', author: 'Ranger Budi', category: 'Info Jalur' },
  { id: '2', title: 'Review Carrier Eiger 45L', author: 'DewiPendaki', category: 'Gear Review' },
];

const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [hasActiveTrip] = useState(true);
  const [weatherAlert] = useState<{ type: string; msg: string } | null>({ type: 'yellow', msg: 'Kabut tebal terpantau di Gede-Pangrango. Hati-hati.' });

  const getWeatherBg = (type: string) => {
    switch (type) {
      case 'red': return '#FFEBEE'; case 'yellow': return '#FFF8E1'; case 'green': return '#E8F5E9'; default: return '#FFF8E1';
    }
  };
  const getWeatherTextColor = (type: string) => {
    switch (type) {
      case 'red': return '#D32F2F'; case 'yellow': return '#F57C00'; case 'green': return '#2E7D32'; default: return '#F57C00';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.greetingRow}>
          <View style={styles.avatar} />
          <View style={styles.greetingText}>
            <Text style={styles.greetingTitle}>Hai, {user?.fullName?.split(' ')[0] || 'Pendaki'}!</Text>
            <Text style={styles.greetingSub}>Siap berpetualang hari ini?</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Icon name="account-circle" size={28} color="#757575" />
          </TouchableOpacity>
        </View>
      </View>

      {hasActiveTrip && (
        <TouchableOpacity style={styles.activeTripCard} onPress={() => navigation.navigate('GPSTracker')}>
          <View style={styles.tripCardHeader}>
            <Icon name="terrain" size={20} color="#fff" />
            <Text style={styles.tripCardTitle}>Pendakian Aktif</Text>
            <View style={styles.tripStatusBadge}><Text style={styles.tripStatus}>LIVE</Text></View>
          </View>
          <Text style={styles.tripMountain}>Gunung Gede - Cibodas</Text>
          <View style={styles.tripProgress}>
            <View style={styles.progressBarBg}><View style={styles.progressBarFill} /></View>
            <Text style={styles.tripProgressText}>3.2/8.5 km · 2j 15m</Text>
          </View>
          <View style={styles.tripActions}>
            <TouchableOpacity style={styles.tripActionBtn}><Icon name="pause" size={16} color="#fff" /></TouchableOpacity>
            <TouchableOpacity style={styles.tripActionBtn}><Icon name="flag" size={16} color="#fff" /></TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {weatherAlert && (
        <View style={[styles.weatherBanner, { backgroundColor: getWeatherBg(weatherAlert.type) }]}>
          <Icon name="warning" size={20} color={getWeatherTextColor(weatherAlert.type)} />
          <Text style={[styles.weatherText, { color: getWeatherTextColor(weatherAlert.type) }]}>{weatherAlert.msg}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Aksi Cepat</Text>
      <View style={styles.actionsGrid}>
        {QUICK_ACTIONS.map(action => (
          <TouchableOpacity key={action.id} style={styles.actionCard} onPress={() => navigation.navigate(action.route)}>
            <View style={[styles.actionIcon, { backgroundColor: action.bg }]}>
              <Icon name={action.icon as any} size={24} color={action.color} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>AI Rekomendasi ⚡</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendScroll}>
        {RECOMMENDATIONS.map(rec => (
          <TouchableOpacity key={rec.id} style={styles.recommendCard} onPress={() => navigation.navigate('MountainDetail', { mountain: rec })}>
            <View style={styles.recommendImage} />
            <View style={styles.recommendBadge}><Text style={styles.recommendMatch}>{rec.match}</Text></View>
            <Text style={styles.recommendName}>{rec.name}</Text>
            <Text style={styles.recommendReason} numberOfLines={2}>{rec.reason}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Forum Terbaru</Text>
        <FlatList data={RECENT_POSTS} keyExtractor={i => i.id} scrollEnabled={false} renderItem={({ item }) => (
          <TouchableOpacity style={styles.postCard} onPress={() => navigation.navigate('ThreadDetail', { thread: item })}>
            <View style={styles.postAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.postMeta}>{item.author} · {item.category}</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#BDBDBD" />
          </TouchableOpacity>
        )} />
        <TouchableOpacity style={styles.viewAll}><Text style={styles.viewAllText}>Lihat Semua →</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { paddingBottom: 40 },
  header: { backgroundColor: '#fff', padding: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  greetingRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E0E0E0', marginRight: 12 },
  greetingText: { flex: 1 },
  greetingTitle: { fontSize: 18, fontWeight: 'bold', color: '#212121' },
  greetingSub: { fontSize: 13, color: '#757575', marginTop: 2 },
  activeTripCard: { margin: 16, backgroundColor: '#2E7D32', borderRadius: 16, padding: 16, elevation: 4 },
  tripCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tripCardTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15, flex: 1 },
  tripStatusBadge: { backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  tripStatus: { color: '#D32F2F', fontWeight: 'bold', fontSize: 10 },
  tripMountain: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 4, marginBottom: 8 },
  tripProgress: { gap: 4 },
  progressBarBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 },
  progressBarFill: { width: '40%', height: '100%', backgroundColor: '#fff', borderRadius: 2 },
  tripProgressText: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  tripActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  tripActionBtn: { padding: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8 },
  weatherBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, marginHorizontal: 16, borderRadius: 10, gap: 8 },
  weatherText: { flex: 1, fontSize: 13, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 12, paddingHorizontal: 16 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginBottom: 16 },
  actionCard: { width: '33%', alignItems: 'center', paddingVertical: 8 },
  actionIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  actionLabel: { fontSize: 12, color: '#424242', fontWeight: '500' },
  recommendScroll: { paddingLeft: 16, marginBottom: 16 },
  recommendCard: { width: 180, backgroundColor: '#fff', borderRadius: 12, marginRight: 12, elevation: 2, overflow: 'hidden' },
  recommendImage: { width: 180, height: 100, backgroundColor: '#D5D5D5' },
  recommendBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#2E7D32', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  recommendMatch: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  recommendName: { fontSize: 15, fontWeight: 'bold', color: '#212121', padding: 8, paddingBottom: 2 },
  recommendReason: { fontSize: 12, color: '#757575', paddingHorizontal: 8, paddingBottom: 8 },
  recentSection: { marginBottom: 16 },
  postCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, marginHorizontal: 16, marginBottom: 4, borderRadius: 8, gap: 8 },
  postAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E0E0E0' },
  postTitle: { fontSize: 14, fontWeight: '600', color: '#212121' },
  postMeta: { fontSize: 12, color: '#757575' },
  viewAll: { paddingHorizontal: 16, paddingVertical: 8 },
  viewAllText: { color: '#2E7D32', fontWeight: '600', fontSize: 13 },
});

export default DashboardScreen;
