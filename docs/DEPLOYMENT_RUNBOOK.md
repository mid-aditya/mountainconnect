# Deployment Runbook - MountainConnect ID

> **Kebijakan:** Proyek ini **tidak memakai Docker**, Docker Compose, ECR, ECS, atau Kubernetes container. Deploy memakai **Node.js native** (build + PM2 atau systemd) di VM/EC2.

## Pre-requisites

- [ ] Node.js 20+ terpasang di server
- [ ] MySQL 8+ (RDS atau server lokal)
- [ ] Redis 7+ (ElastiCache atau server lokal)
- [ ] PM2 (`npm install -g pm2`) — direkomendasikan
- [ ] (Production AWS) Terraform >= 1.5, AWS CLI — hanya untuk RDS/Redis/ALB, bukan container

## Environment Setup

```bash
export ENVIRONMENT=staging   # atau production
export PROJECT_NAME=mountainconnect
export DEPLOY_PATH=/opt/mountainconnect
```

Salin dan sesuaikan env:

- `backend/.env` — dari `backend/.env.example`
- `web-dashboard/.env.local` — `NEXT_PUBLIC_API_URL`, `NEXTAUTH_*`

## Build Aplikasi

```bash
# Backend API
cd backend
npm ci
npm run build

# Web dashboard
cd ../web-dashboard
npm ci
npm run build
```

## Deploy ke Server (PM2)

### 1. Salin kode ke server

```bash
rsync -av --exclude node_modules ./ ${DEPLOY_PATH}/
# atau git pull di server setelah clone repo
```

### 2. Install dependensi & build (di server)

```bash
cd ${DEPLOY_PATH}/backend && npm ci --omit=dev && npm run build
cd ${DEPLOY_PATH}/web-dashboard && npm ci && npm run build
```

### 3. Jalankan dengan PM2

```bash
cd ${DEPLOY_PATH}/backend
pm2 start ecosystem.config.cjs --env production

cd ${DEPLOY_PATH}/web-dashboard
pm2 start ecosystem.config.cjs --env production

pm2 save
pm2 startup   # ikuti instruksi agar auto-start saat reboot
```

### 4. Update rilis (zero-downtime ringan)

```bash
git pull
cd backend && npm ci --omit=dev && npm run build && pm2 reload mountainconnect-api
cd ../web-dashboard && npm ci && npm run build && pm2 reload mountainconnect-dashboard
```

## Deploy alternatif: systemd

Contoh unit API (`/etc/systemd/system/mountainconnect-api.service`):

```ini
[Unit]
Description=MountainConnect API
After=network.target mysql.service redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/mountainconnect/backend
EnvironmentFile=/opt/mountainconnect/backend/.env
ExecStart=/usr/bin/node dist/main.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mountainconnect-api
```

Ulangi pola serupa untuk dashboard: `npm run start` di folder `web-dashboard` setelah `npm run build`.

## Health Check

| Service | Endpoint | Expected |
|---------|----------|----------|
| API | `GET http://localhost:4000/api/v1` (Swagger) | 200 |
| API | `GET /health` *(jika endpoint ditambahkan)* | 200 |
| Dashboard | `GET http://localhost:3000` | 200 |

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/docs
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

## Database (MySQL)

Development: TypeORM `synchronize: true` membuat schema otomatis.

Production: gunakan migrasi TypeORM (setelah folder `migrations/` ditambahkan) atau backup manual sebelum deploy.

```bash
# Backup manual
mysqldump -u root -p mountainconnect > backup-$(date +%Y%m%d).sql
```

### RDS (AWS)

- Automated backups harian
- Snapshot manual sebelum rilis besar

```bash
aws rds create-db-snapshot \
  --db-instance-identifier ${PROJECT_NAME}-${ENVIRONMENT} \
  --db-snapshot-identifier ${PROJECT_NAME}-pre-deploy-$(date +%Y%m%d-%H%M)
```

## Redis

Pastikan `REDIS_HOST` / `REDIS_PORT` di `backend/.env` mengarah ke instance Redis yang aktif (wajib untuk BullMQ).

## Monitoring

- `infra/monitoring/prometheus.yml` — scrape target arahkan ke host:port API (bukan container)
- Grafana: dashboard di `infra/monitoring/grafana-dashboard.json`

## Rollback

```bash
git checkout <commit-sebelumnya>
cd backend && npm ci --omit=dev && npm run build && pm2 reload mountainconnect-api
cd ../web-dashboard && npm ci && npm run build && pm2 reload mountainconnect-dashboard
```

Restore database dari dump jika migrasi schema gagal.

## Post-Deployment Checklist

- [ ] API & dashboard merespons health check
- [ ] Login admin dashboard berhasil
- [ ] Redis terhubung (tidak ada error BullMQ di log)
- [ ] Backup database terjadwal
- [ ] `pm2 status` semua proses `online`
