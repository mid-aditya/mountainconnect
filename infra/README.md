# Infrastructure — MountainConnect ID

Proyek ini **tidak menggunakan Docker**, Docker Compose, ECR, atau Kubernetes berbasis container.

## Yang disediakan

| Folder | Isi |
|--------|-----|
| `terraform/` | VPC, RDS MySQL, ElastiCache Redis, ALB, S3, CloudFront (tanpa ECR/ECS) |
| `monitoring/` | Konfigurasi Prometheus & Grafana |
| `k8s/` | *(dihapus)* — lihat catatan di folder tersebut |

## Deploy aplikasi (native Node.js)

Aplikasi dijalankan langsung di VM/EC2 dengan **Node.js 20+** dan **PM2** (atau systemd).

Lihat panduan lengkap: [docs/DEPLOYMENT_RUNBOOK.md](../docs/DEPLOYMENT_RUNBOOK.md)

Contoh singkat di server Linux:

```bash
cd backend && npm ci && npm run build
pm2 start ecosystem.config.cjs

cd web-dashboard && npm ci && npm run build
pm2 start ecosystem.config.cjs
```

Pastikan MySQL, Redis, dan variabel lingkungan (`.env`) sudah dikonfigurasi sebelum menjalankan PM2.
