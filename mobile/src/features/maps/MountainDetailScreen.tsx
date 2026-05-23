import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

const TABS = ['Rute', 'Cuaca', 'Perizinan', 'Review'];

const MountainDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { mountain } = route.params;
  const [activeTab, setActiveTab] = useState('Rute');

  const getDifficultyColor = (level: number) => {
    if (level <= 3) return '#2E7D32'; if (level <= 6) return '#F57C00'; if (level <= 8) return '#E64A19'; return '#D32F2F';
  };

  const DifficultyBar = ({ level }: { level: number }) => (
    <View style={styles.difficultyRow}>
      {[1,2,3,4,5,6,7,8,9,10].map(i => <View key={i} style={[styles.dDot, { backgroundColor: i <= level ? getDifficultyColor(level) : '#E0E0E0' }]} />)}
    </View>
  );

  const routes = [
    { name: 'Cibodas', duration: '8-10 jam', distance: '8.5km', elevationGain: 1800, waypoints: ['Cibodas', 'Telaga Biru', 'Alun-Alun Suryakencana', 'Puncak'], dangerZones: ['Sektor 2 (tanah longsor)'] },
    { name: 'Putri', duration: '10-12 jam', distance: '12km', elevationGain: 2100, waypoints: ['Putri', 'Pondok Mentri', 'Alun-Alun', 'Puncak'], dangerZones: ['Jalur sempit di tebing'] },
  ];

  const forecast = [
    { day: 'Hari Ini', icon: 'wb-sunny', condition: 'Berawan', temp: 18, humidity: 78, wind: 12 },
    { day: 'Besok', icon: 'cloud', condition: 'Hujan Ringan', temp: 15, humidity: 85, wind: 18 },
    { day: 'H+2', icon: 'wb-cloudy', condition: 'Kabut Tebal', temp: 12, humidity: 92, wind: 8 },
    { day: 'H+3', icon: 'wb-sunny', condition: 'Cerah', temp: 20, humidity: 65, wind: 10 },
    { day: 'H+4', icon: 'cloud-queue', condition: 'Mendung', temp: 17, humidity: 75, wind: 14 },
  ];

  const permits = [
    { name: 'Simaksi Dasar', price: 'Rp 15.000', required: 'KTP/SIM', info: 'Wajib untuk semua pendaki' },
    { name: 'SIMAKSI Lengkap', price: 'Rp 50.000', required: 'KTP + Surat Keterangan Sehat', info: 'Termasuk asuransi' },
    { name: 'Izin Kelompok (10+)', price: 'Rp 200.000', required: 'Surat dari Basecamp', info: 'Pendaftaran H-7' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.heroContainer}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600' }} style={styles.heroImage} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn}>
          <Icon name="share" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{mountain.name}</Text>
            <Text style={styles.region}>{mountain.region} · {mountain.elevation}mdpl</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.difficultyLabel}>Difficulty {mountain.difficulty}/10</Text>
            <DifficultyBar level={mountain.difficulty} />
          </View>
        </View>

        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}><Icon name="timer" size={16} color="#757575" /><Text style={styles.quickStatText}>8-12 jam</Text></View>
          <View style={styles.quickStatItem}><Icon name="thermostat" size={16} color="#757575" /><Text style={styles.quickStatText}>12-22°C</Text></View>
          <View style={styles.quickStatItem}><Icon name="flag" size={16} color="#757575" /><Text style={styles.quickStatText}>3 rute</Text></View>
        </View>

        <View style={styles.tabBar}>
          {TABS.map(tab => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'Rute' && (
          <View>
            {routes.map((rt, idx) => (
              <View key={idx} style={styles.routeCard}>
                <View style={styles.routeHeader}>
                  <Text style={styles.routeName}>{rt.name}</Text>
                  <Text style={styles.routeDuration}>{rt.duration}</Text>
                </View>
                <View style={styles.routeMeta}>
                  <Text style={styles.routeMetaText}>Jarak: {rt.distance}</Text>
                  <Text style={styles.routeMetaText}>Elevasi: +{rt.elevationGain}m</Text>
                </View>
                <Text style={styles.routeSectionTitle}>Waypoints:</Text>
                {rt.waypoints.map((wp, i) => (
                  <View key={i} style={styles.waypointRow}>
                    <View style={styles.waypointDot} />
                    <Text style={styles.waypointText}>{wp}</Text>
                  </View>
                ))}
                <View style={styles.dangerZone}>
                  <Icon name="warning" size={14} color="#D32F2F" />
                  <Text style={styles.dangerText}>{rt.dangerZones[0]}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Cuaca' && (
          <View>
            <View style={styles.currentWeather}>
              <Icon name="wb-cloudy" size={48} color="#757575" />
              <Text style={styles.currentTemp}>18°C</Text>
              <Text style={styles.currentCondition}>Berawan · Angin 12km/j · Kelembapan 78%</Text>
            </View>
            <Text style={styles.hazardTitle}>⚠️ Peringatan Dini</Text>
            <View style={styles.hazardCard}>
              <View style={styles.hazardRow}><View style={[styles.hazardDot, { backgroundColor: '#FFC107' }]} /><Text style={styles.hazardText}>Kabut tebal berpotensi terjadi (H+2)</Text></View>
              <View style={styles.hazardRow}><View style={[styles.hazardDot, { backgroundColor: '#4CAF50' }]} /><Text style={styles.hazardText}>Kondisi aman untuk pendakian hari ini</Text></View>
            </View>
            <Text style={styles.forecastTitle}>Prakiraan 5 Hari</Text>
            {forecast.map((f, i) => (
              <View key={i} style={styles.forecastRow}>
                <Text style={styles.forecastDay}>{f.day}</Text>
                <Icon name={f.icon as any} size={20} color="#757575" />
                <Text style={styles.forecastTemp}>{f.temp}°C</Text>
                <Text style={styles.forecastCondition}>{f.condition}</Text>
                <Text style={styles.forecastDetail}>H:{f.humidity}% W:{f.wind}km</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Perizinan' && (
          <View>
            <Text style={styles.permitsDesc}>Persyaratan perizinan untuk {mountain.name}</Text>
            {permits.map((p, i) => (
              <View key={i} style={styles.permitsCard}>
                <Text style={styles.permitsName}>{p.name}</Text>
                <Text style={styles.permitsPrice}>{p.price}</Text>
                <Text style={styles.permitsRequired}>Diperlukan: {p.required}</Text>
                <Text style={styles.permitsInfo}>{p.info}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>Ajukan Perizinan</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'Review' && (
          <View>
            {[1,2,3].map(i => (
              <View key={i} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar} />
                  <View><Text style={styles.reviewName}>Pendaki {i}</Text><Text style={styles.reviewDate}>12 Mar 2024</Text></View>
                  <View style={styles.stars}><Text>⭐⭐⭐⭐⭐</Text></View>
                </View>
                <Text style={styles.reviewText}>Pendakian luar biasa! Jalur terawat, pemandangan indah dari puncak. Pastikan bawa jaket tebal karena dingin banget.</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  heroContainer: { position: 'relative', height: 250 },
  heroImage: { width, height: 250 },
  backBtn: { position: 'absolute', top: 16, left: 16, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 8 },
  shareBtn: { position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: 8 },
  content: { padding: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#212121' },
  region: { fontSize: 13, color: '#757575', marginTop: 2 },
  difficultyLabel: { fontSize: 12, color: '#757575', marginBottom: 4 },
  difficultyRow: { flexDirection: 'row', gap: 2 },
  dDot: { width: 16, height: 5, borderRadius: 2.5 },
  quickStats: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  quickStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  quickStatText: { fontSize: 13, color: '#757575' },
  tabBar: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#E0E0E0', marginBottom: 16, gap: 0 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#2E7D32', marginBottom: -2 },
  tabText: { fontSize: 14, color: '#757575', fontWeight: '500' },
  tabTextActive: { color: '#2E7D32', fontWeight: 'bold' },
  routeCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  routeName: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  routeDuration: { fontSize: 13, color: '#757575' },
  routeMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  routeMetaText: { fontSize: 12, color: '#757575' },
  routeSectionTitle: { fontSize: 13, fontWeight: '600', color: '#212121', marginBottom: 6 },
  waypointRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, paddingLeft: 4 },
  waypointDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2E7D32', marginRight: 8 },
  waypointText: { fontSize: 13, color: '#424242' },
  dangerZone: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: '#FFEBEE', padding: 8, borderRadius: 6, gap: 4 },
  dangerText: { fontSize: 12, color: '#D32F2F', flex: 1 },
  currentWeather: { alignItems: 'center', padding: 24, backgroundColor: '#fff', borderRadius: 12, marginBottom: 12 },
  currentTemp: { fontSize: 36, fontWeight: 'bold', color: '#212121', marginVertical: 4 },
  currentCondition: { fontSize: 14, color: '#757575' },
  hazardTitle: { fontSize: 15, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  hazardCard: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12 },
  hazardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  hazardDot: { width: 10, height: 10, borderRadius: 5 },
  hazardText: { fontSize: 13, color: '#424242', flex: 1 },
  forecastTitle: { fontSize: 15, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  forecastRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 4, gap: 8 },
  forecastDay: { width: 50, fontSize: 13, fontWeight: '600', color: '#212121' },
  forecastTemp: { width: 40, fontSize: 14, fontWeight: 'bold', color: '#212121' },
  forecastCondition: { flex: 1, fontSize: 13, color: '#757575' },
  forecastDetail: { fontSize: 11, color: '#9E9E9E' },
  permitsDesc: { fontSize: 13, color: '#757575', marginBottom: 12 },
  permitsCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, elevation: 1 },
  permitsName: { fontSize: 15, fontWeight: 'bold', color: '#212121' },
  permitsPrice: { fontSize: 14, color: '#2E7D32', fontWeight: '600', marginVertical: 4 },
  permitsRequired: { fontSize: 13, color: '#757575' },
  permitsInfo: { fontSize: 12, color: '#757575', marginTop: 2 },
  applyBtn: { backgroundColor: '#2E7D32', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  applyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  reviewCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  reviewAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E0E0E0' },
  reviewName: { fontSize: 14, fontWeight: '600', color: '#212121' },
  reviewDate: { fontSize: 11, color: '#757575' },
  stars: { marginLeft: 'auto' },
  reviewText: { fontSize: 13, color: '#424242', lineHeight: 20 },
});

export default MountainDetailScreen;
