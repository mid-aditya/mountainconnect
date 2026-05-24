# MountainConnect ID
### Platform Terintegrasi untuk Ekosistem Pendakian Indonesia

![MountainConnect ID](https://img.shields.io/badge/version-1.0.0--alpha-green) ![Node](https://img.shields.io/badge/node-20+-green) ![React Native](https://img.shields.io/badge/react--native-0.73+-blue) ![Next.js](https://img.shields.io/badge/next.js-14-black) ![NestJS](https://img.shields.io/badge/nestjs-10-red)

---

## 🌄 Gambaran Umum

**MountainConnect ID** adalah ekosistem digital terpadu yang menghubungkan solo traveler, open trip organizer, basecamp, dan pengelola taman nasional di Indonesia. Platform ini dirancang dengan arsitektur **offline-first** untuk beroperasi di area minim sinyal, dengan fitur keselamatan real-time sebagai prioritas utama.

### Target Pengguna
- Solo traveler (pemula hingga expert)
- Open trip operator & guide bersertifikasi
- Basecamp & penginapan sekitar gunung
- Pengelola Taman Nasional / Balai Konservasi
- Komunitas pendaki & konten kreator outdoor

---

## 🏗️ Arsitektur

```
mountainconnect-app/
├── backend/           # NestJS microservices API
│   ├── src/
│   │   ├── modules/   # Auth, User, Mountain, Trip, Emergency, Weather, Marketplace, Community, Notification
│   │   ├── adapters/  # BMKG, InaRISK, Midtrans, Twilio integrations
│   │   ├── workers/   # BullMQ background jobs (checkout alert, weather polling, offline sync)
│   │   ├── common/    # Guards, decorators, filters, interceptors
│   │   └── config/    # Database, app, environment configs
│
├── mobile/            # React Native app (iOS/Android)
│   ├── src/
│   │   ├── features/  # Auth, Maps, Emergency, Community, Marketplace, Dashboard
│   │   ├── shared/    # Components, services, store, utils, hooks
│   │   └── navigation/ # React Navigation setup
│   └── App.tsx
│
├── web-dashboard/     # Next.js 14 admin dashboard
│   ├── src/
│   │   ├── pages/     # Dashboard, Users, Mountains, Emergency, Marketplace, Analytics
│   │   ├── components/ # Layout, Sidebar, DataTable, StatCard, MapWidget
│   │   └── services/  # API client, auth
│   ├── operator-portal/  # Operator-specific dashboard
│   ├── tn-admin-portal/  # Taman Nasional admin dashboard
│   └── moderation-tools/  # Content moderation tools
│
├── infra/             # Infrastructure as Code (tanpa Docker)
│   ├── terraform/     # AWS RDS MySQL, Redis, ALB, S3, CloudFront
│   └── monitoring/    # Prometheus + Grafana dashboards
│
├── docs/              # Technical documentation
│   ├── API_SPEC.md
│   ├── OFFLINE_SYNC_PROTOCOL.md
│   ├── EMERGENCY_FLOW_DIAGRAM.md
│   ├── COMPLIANCE_CHECKLIST.md
│   └── DEPLOYMENT_RUNBOOK.md
│
└── testing/           # E2E, integration, offline scenarios
    ├── e2e/
    ├── integration/
    └── offline-scenarios/
```

---

## ⚡ Fitur Utama

### 1. Auth & Profil
- Social login (Google, Facebook, Instagram) + email/phone
- Verifikasi bertingkat: Level 1 (email/phone), Level 2 (KTP+selfie), Level 3 (sertifikat guide)
- Profil dengan emergency contact + medical info (end-to-end encrypted)

### 2. Navigasi & Informasi Gunung
- Database gunung Indonesia dengan rute, difficulty (1-10), waypoints
- **Peta offline** berbasis Mapbox/OSM (download per-area)
- GPS tracking real-time + breadcrumb trail + export GPX
- AI recommendation engine berdasarkan level, cuaca, kuota, budget

### 3. Safety & Emergency (PRIORITAS TINGGI)
- **SOS Button** — tekan 3 detik, kirim GPS + profil medis ke kontak darurat + SAR
- **Offline-capable** — simpan log & auto-kirim saat dapat sinyal
- **Check-in/check-out otomatis** — alert jika overdue (ETA + 30 menit buffer)
- **Weather alert real-time** — integrasi BMKG untuk hujan, petir, kabut
- Semua critical path berfungsi 100% offline

### 4. Komunitas & Koordinasi
- Forum berbasis kategori (Info Jalur, Gear Review, Trip Report, Q&A Ranger)
- Fitur "Cari Tim Pendakian" dengan filter & host verification
- Trip planner kolaboratif dengan shared itinerary

### 5. Marketplace Terintegrasi
- Jual-beli gear outdoor (escrow payment, verifikasi kondisi)
- Booking open trip & basecamp (kalender real-time, dynamic pricing)
- Rating & review transaksi dua arah

### 6. Dashboard Stakeholder
- **Operator Portal**: kelola trip, verifikasi dokumen, analytics
- **TN Admin Portal**: monitoring kuota, publikasi regulasi, insiden
- **Moderation Tools**: queue konten, flag & approve/reject

---

## 🛠️ Stack Teknologi

| Layer | Technology |
|-------|-----------|
| **Mobile** | React Native 0.73+, TypeScript, Redux Toolkit, React Navigation 6, Mapbox GL |
| **Backend** | NestJS 10, TypeORM, MySQL 8, Redis (BullMQ), Socket.io |
| **Web** | Next.js 14, TypeScript, Tailwind CSS, TanStack Query, Zustand |
| **Infra** | AWS (RDS MySQL, ElastiCache, S3, CloudFront), Terraform, deploy native Node.js + PM2 |
| **Monitoring** | Prometheus, Grafana, Firebase Crashlytics |

### External Integrations
- **BMKG API** — cuaca real-time & peringatan dini
- **InaRISK API** — info bencana geografis
- **Midtrans/Xendit** — payment gateway (QRIS, VA, e-wallet)
- **Twilio** — SMS gateway untuk fallback notification
- **Mapbox** — peta offline dengan vector tiles

---

## 🚀 Cara Menjalankan

> **Tanpa Docker:** Proyek ini tidak memerlukan Docker, Docker Compose, atau container. Jalankan MySQL, Redis, dan Node.js **langsung di mesin Anda** (XAMPP/Laragon/MySQL Server + Redis for Windows, atau instalasi native di Linux).

### Prerequisites
- Node.js 20+
- **MySQL 8+** (install lokal: XAMPP, Laragon, atau MySQL Server)
- **Redis 7+** (install lokal atau Redis for Windows)

### 0. Database MySQL
Buat database sekali:
```sql
CREATE DATABASE mountainconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 1. Backend (NestJS)
```bash
cd backend
cp .env.example .env   # Sesuaikan DB_USERNAME, DB_PASSWORD
npm install
npm run start:dev
# API tersedia di http://localhost:4000/api/v1
# Swagger docs di http://localhost:4000/api/docs
```

### 2. Mobile (React Native)
```bash
cd mobile
cp .env.example .env
npm install
# iOS
cd ios && pod install && cd ..
npx react-native run-ios
# Android
npx react-native run-android
```

### 3. Web Dashboard (Next.js)
```bash
cd web-dashboard
cp .env.local.example .env.local
npm install
npm run dev
# Dashboard tersedia di http://localhost:3000
```

### 4. Redis (jika belum jalan)
Pastikan Redis aktif di `localhost:6379` sebelum menjalankan backend (untuk BullMQ).

### 5. Production (opsional, tanpa Docker)
```bash
cd backend && npm run build && pm2 start ecosystem.config.cjs --env production
cd web-dashboard && npm run build && pm2 start ecosystem.config.cjs --env production
```
Detail: [docs/DEPLOYMENT_RUNBOOK.md](docs/DEPLOYMENT_RUNBOOK.md)

---

## 🚫 Kebijakan: Tidak Memakai Docker

| Tidak dipakai | Digunakan sebagai gantinya |
|---------------|---------------------------|
| Docker / Docker Compose | `npm run dev` / `npm run start` |
| AWS ECR / container images | Build artefak `dist/` + PM2 di VM/EC2 |
| Kubernetes manifests | Dihapus — lihat `infra/k8s/README.md` |

---

## 🔐 Keamanan & Privasi

- **Enkripsi E2E** untuk: chat, medical info, lokasi real-time
- **JWT + Refresh Token** dengan short expiry (15 menit access, 7 hari refresh)
- **Rate limiting** & bot detection untuk API publik
- **GDPR/UU PDP compliant** — anonymisasi analytics, right to be forgotten
- **Audit log** untuk aksi kritis (booking, SOS, perubahan kuota)

---

## 📊 Offline Strategy

- **Service Workers** (web) + **Background Sync** (mobile)
- **Local DB**: WatermelonDB/Realm untuk sync conflict resolution
- **Kompresi**: MessagePack untuk hemat bandwidth
- **Conflict Resolution**: last-write-wins + manual review untuk data kritis
- **Queue System**: auto-retry dengan exponential backoff

---

## 📈 Acceptance Criteria

| Metric | Target |
|--------|--------|
| SOS trigger | < 10 detik (saat ada sinyal) |
| Peta offline load | < 3 detik |
| Check-out alert | Tepat 30 menit setelah ETA + buffer |
| Fitur emergency offline | 100% setelah initial download |
| Crash-free rate | > 99.5% |
| API response P95 | < 500ms (Singapore region) |
| App size | < 50MB awal |
| Battery drain | < 5%/jam (GPS aktif) |

---

## 📝 Lisensi

MIT License — MountainConnect ID Team 2026

---

## 👥 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b fitur/nama-fitur`)
3. Commit changes (`git commit -m 'Add: fitur baru'`)
4. Push ke branch (`git push origin fitur/nama-fitur`)
5. Buat Pull Request

### Coding Standards
- TypeScript strict mode
- ESLint + Prettier untuk semua project
- Commit message conventional commits
- Unit test wajib untuk services

---

> **"Aplikasi ini bukan sekadar kode — ini bisa menyelamatkan nyawa."**
> Setiap baris kode untuk fitur emergency, setiap optimasi offline, setiap verifikasi mitra adalah komitmen pada keselamatan dan keberlanjutan pendakian Indonesia.
