import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import MapViewComponent from '../../shared/components/MapView';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const MOUNTAINS = [
  { id: '1', name: 'Gunung Gede', region: 'Jawa Barat', elevation: 2958, difficulty: 6, lat: -6.789, lng: 106.822, routes: 3, weather: 'Berawan', temp: 18 },
  { id: '2', name: 'Gunung Rinjani', region: 'NTB', elevation: 3726, difficulty: 8, lat: -8.41, lng: 116.46, routes: 5, weather: 'Cerah', temp: 15 },
  { id: '3', name: 'Gunung Semeru', region: 'Jawa Timur', elevation: 3676, difficulty: 9, lat: -8.108, lng: 112.92, routes: 2, weather: 'Kabut', temp: 10 },
  { id: '4', name: 'Gunung Merbabu', region: 'Jawa Tengah', elevation: 3145, difficulty: 5, lat: -7.455, lng: 110.44, routes: 4, weather: 'Cerah', temp: 14 },
  { id: '5', name: 'Gunung Merapi', region: 'DIY', elevation: 2930, difficulty: 7, lat: -7.541, lng: 110.446, routes: 3, weather: 'Hujan Ringan', temp: 16 },
  { id: '6', name: 'Gunung Bromo', region: 'Jawa Timur', elevation: 2329, difficulty: 4, lat: -7.942, lng: 112.953, routes: 2, weather: 'Berkabut', temp: 12 },
];

const REGIONS = ['Semua', 'Jawa', 'Sumatra', 'Kalimantan', 'Sulawesi', 'Bali'];

const MapsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('Semua');
  const [selectedMountain, setSelectedMountain] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const filteredMountains = MOUNTAINS.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchRegion = selectedRegion === 'Semua' || m.region.includes(selectedRegion);
    return matchSearch && matchRegion;
  });

  const handleMarkerPress = (mountain: any) => {
    setSelectedMountain(mountain);
    setShowCard(true);
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 3) return '#2E7D32';
    if (level <= 6) return '#F57C00';
    if (level <= 8) return '#E64A19';
    return '#D32F2F';
  };

  const DifficultyBar = ({ level }: { level: number }) => (
    <View style={styles.difficultyBar}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
        <View key={i} style={[styles.difficultyDot, { backgroundColor: i <= level ? getDifficultyColor(level) : '#E0E0E0' }]} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <MapViewComponent
        centerCoordinate={{ latitude: -6.9, longitude: 110.5 }}
        zoomLevel={5}
        style={{ width, height }}
        markers={filteredMountains.map(m => ({ id: m.id, coordinate: { latitude: m.lat, longitude: m.lng }, title: m.name }))}
        onMarkerPress={(id) => {
          const m = MOUNTAINS.find(mt => mt.id === id);
          if (m) handleMarkerPress(m);
        }}
        showUserLocation
        showBreadcrumb={false}
      />

      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#757575" style={styles.searchIcon} />
        <TextInput style={styles.searchInput} placeholder="Cari gunung..." value={search} onChangeText={setSearch} placeholderTextColor="#757575" />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close" size={20} color="#757575" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipContainer}>
        {REGIONS.map(region => (
          <TouchableOpacity key={region} style={[styles.chip, selectedRegion === region && styles.chipActive]} onPress={() => setSelectedRegion(region)}>
            <Text style={[styles.chipText, selectedRegion === region && styles.chipTextActive]}>{region}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {showCard && selectedMountain && (
        <View style={styles.mountainCard}>
          <TouchableOpacity style={styles.closeCard} onPress={() => setShowCard(false)}>
            <Icon name="close" size={20} color="#757575" />
          </TouchableOpacity>
          <View style={styles.cardHeader}>
            <Text style={styles.mountainName}>{selectedMountain.name}</Text>
            <View style={[styles.weatherBadge, { backgroundColor: selectedMountain.weather === 'Cerah' ? '#E8F5E9' : selectedMountain.weather.includes('Hujan') ? '#E3F2FD' : '#FFF8E1' }]}>
              <Text style={styles.weatherText}>{selectedMountain.weather} · {selectedMountain.temp}°C</Text>
            </View>
          </View>
          <View style={styles.cardStats}>
            <View style={styles.statItem}><Icon name="terrain" size={16} color="#757575" /><Text style={styles.statText}>{selectedMountain.elevation}mdpl</Text></View>
            <View style={styles.statItem}><Icon name="trending-up" size={16} color="#757575" /><Text style={styles.statText}>Level {selectedMountain.difficulty}/10</Text></View>
            <View style={styles.statItem}><Icon name="route" size={16} color="#757575" /><Text style={styles.statText}>{selectedMountain.routes} rute</Text></View>
          </View>
          <DifficultyBar level={selectedMountain.difficulty} />
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.detailBtn} onPress={() => navigation.navigate('MountainDetail', { mountain: selectedMountain })}>
              <Text style={styles.detailBtnText}>Lihat Detail</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.offlineBtn} onPress={() => navigation.navigate('OfflineMapManager')}>
              <Icon name="download" size={16} color="#2E7D32" />
              <Text style={styles.offlineBtnText}>Offline</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.layersToggle}>
        <TouchableOpacity style={styles.layerBtn}>
          <Icon name="layers" size={20} color="#757575" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { position: 'absolute', top: 50, left: 16, right: 16, backgroundColor: '#FFFFFF', borderRadius: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 15, color: '#212121' },
  chipScroll: { position: 'absolute', top: 110, left: 0 },
  chipContainer: { paddingHorizontal: 16, gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 20, elevation: 2, marginRight: 8 },
  chipActive: { backgroundColor: '#2E7D32' },
  chipText: { fontSize: 13, color: '#212121', fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF' },
  mountainCard: { position: 'absolute', bottom: 24, left: 16, right: 16, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
  closeCard: { position: 'absolute', top: 12, right: 12, zIndex: 1, padding: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  mountainName: { fontSize: 18, fontWeight: 'bold', color: '#212121', flex: 1 },
  weatherBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  weatherText: { fontSize: 12, color: '#212121' },
  cardStats: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 13, color: '#757575' },
  difficultyBar: { flexDirection: 'row', gap: 4, marginBottom: 16 },
  difficultyDot: { width: 20, height: 6, borderRadius: 3 },
  cardActions: { flexDirection: 'row', gap: 10 },
  detailBtn: { flex: 1, backgroundColor: '#2E7D32', padding: 12, borderRadius: 10, alignItems: 'center' },
  detailBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  offlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: '#2E7D32', borderRadius: 10, gap: 4 },
  offlineBtnText: { color: '#2E7D32', fontWeight: '600', fontSize: 14 },
  layersToggle: { position: 'absolute', bottom: showCard => showCard ? 200 : 24, right: 16, backgroundColor: '#FFFFFF', borderRadius: 10, elevation: 3 },
  layerBtn: { padding: 12 },
});

export default MapsScreen;
