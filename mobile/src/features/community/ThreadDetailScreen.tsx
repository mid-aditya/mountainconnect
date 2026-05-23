import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ThreadDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { thread } = route.params;
  const [reply, setReply] = useState('');
  const [likes, setLikes] = useState(42);
  const [liked, setLiked] = useState(false);

  const replies = [
    { id: '1', author: 'AndiPendaki', avatar: null, content: 'Terima kasih info-nya! Jadi siap-siap dari sekarang.', time: '1 jam lalu', likes: 5 },
    { id: '2', author: 'Ranger Sari', avatar: null, content: 'Hati-hati di sektor 3 ya, tanahnya masih labil. Gunakan footwear yang grippy.', time: '45 menit lalu', likes: 12, isRanger: true },
    { id: '3', author: 'Hikersatu', avatar: null, content: 'Berangkat dari kapan? Biar bisa koordinasi.', time: '30 menit lalu', likes: 2 },
    { id: '4', author: 'ClimberBaru', avatar: null, content: 'Boleh gabung? First time ke Gede nih.', time: '15 menit lalu', likes: 0 },
  ];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.threadHeader}>
          <View style={styles.authorRow}>
            <View style={styles.avatar} />
            <View>
              <Text style={styles.authorName}>{thread.author}</Text>
              <Text style={styles.threadTime}>2 jam lalu · {thread.category}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.reportBtn}>
            <Icon name="flag" size={18} color="#757575" />
          </TouchableOpacity>
        </View>

        <Text style={styles.threadTitle}>{thread.title}</Text>
        <Text style={styles.threadBody}>Halo pendaki sekalian!{'n'}{'n'}Setelah longsor yang terjadi bulan lalu di sektor 2 jalur Cibodas, berikut update terbaru:{'\n'}{'\n'}1. Jalur sudah dibersihkan dan dinyatakan aman oleh Tim Ranger{'\n'}2. Beberapa titik masih berlumpur, siapkan footwear yang tepat{'\n'}3. Pos 3 dipindahkan 200 meter ke arah timur{'\n'}4. Check-in basecamp wajib dilakukan sebelum pukul 09.00{'\n'}{'\n'}Semoga membantu dan tetap safe semua!{'🌿'}</Text>

        <Image source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500' }} style={styles.threadImage} />

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.likeBtn} onPress={() => { setLiked(!liked); setLikes(liked ? likes - 1 : likes + 1); }}>
            <Icon name={liked ? 'thumb-up' : 'thumb-up-outlined'} size={20} color={liked ? '#2E7D32' : '#757575'} />
            <Text style={[styles.likeCount, liked && styles.likeCountActive]}>{likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <Icon name="share" size={20} color="#757575" />
            <Text style={styles.actionText}>Bagikan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.replyDivider}>
          <Text style={styles.replyCount}>{replies.length} Balasan</Text>
          <View style={styles.divider} />
        </View>

        {replies.map(r => (
          <View key={r.id} style={styles.replyCard}>
            <View style={styles.replyHeader}>
              <View style={styles.replyAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.replyAuthor}>{r.author}</Text>
                {r.isRanger && <View style={styles.rangerBadge}><Icon name="verified" size={12} color="#fff" /><Text style={styles.rangerText}>Ranger</Text></View>}
              </View>
              <Text style={styles.replyTime}>{r.time}</Text>
            </View>
            <Text style={styles.replyContent}>{r.content}</Text>
            <View style={styles.replyActions}>
              <TouchableOpacity style={styles.replyLike}>
                <Icon name="thumb-up-outlined" size={16} color="#757575" />
                <Text style={styles.replyLikeCount}>{r.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.replyReplyBtn}>
                <Icon name="reply" size={16} color="#757575" />
                <Text style={styles.replyReplyText}>Balas</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.attachBtn}>
          <Icon name="image" size={20} color="#757575" />
        </TouchableOpacity>
        <TextInput style={styles.replyInput} placeholder="Tulis balasan..." value={reply} onChangeText={setReply} placeholderTextColor="#9E9E9E" />
        <TouchableOpacity style={[styles.sendBtn, !reply && styles.sendBtnDisabled]} disabled={!reply}>
          <Icon name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  threadHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0E0E0' },
  authorName: { fontSize: 15, fontWeight: 'bold', color: '#212121' },
  threadTime: { fontSize: 12, color: '#757575' },
  reportBtn: { padding: 8 },
  threadTitle: { fontSize: 20, fontWeight: 'bold', color: '#212121', paddingHorizontal: 16, marginBottom: 12 },
  threadBody: { fontSize: 15, color: '#424242', lineHeight: 22, paddingHorizontal: 16, marginBottom: 12 },
  threadImage: { width: '100%', height: 220, marginBottom: 12 },
  actionRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likeCount: { fontSize: 14, color: '#757575', fontWeight: '600' },
  likeCountActive: { color: '#2E7D32' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: 14, color: '#757575' },
  replyDivider: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  replyCount: { fontSize: 15, fontWeight: 'bold', color: '#212121' },
  divider: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  replyCard: { backgroundColor: '#fff', padding: 14, marginHorizontal: 16, marginBottom: 8, borderRadius: 10, elevation: 1 },
  replyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  replyAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E0E0E0' },
  replyAuthor: { fontSize: 14, fontWeight: '600', color: '#212121' },
  rangerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2E7D32', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, gap: 2, marginTop: 2 },
  rangerText: { fontSize: 10, color: '#fff', fontWeight: 'bold' },
  replyTime: { fontSize: 11, color: '#BDBDBD', marginLeft: 'auto' },
  replyContent: { fontSize: 14, color: '#424242', lineHeight: 20 },
  replyActions: { flexDirection: 'row', marginTop: 8, gap: 16 },
  replyLike: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  replyLikeCount: { fontSize: 13, color: '#757575' },
  replyReplyBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  replyReplyText: { fontSize: 13, color: '#757575' },
  inputBar: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E0E0E0', gap: 8 },
  attachBtn: { padding: 8 },
  replyInput: { flex: 1, backgroundColor: '#F0F0F0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#212121' },
  sendBtn: { backgroundColor: '#2E7D32', padding: 10, borderRadius: 20 },
  sendBtnDisabled: { backgroundColor: '#BDBDBD' },
});

export default ThreadDetailScreen;
