# Kubernetes manifests — removed

Folder ini sebelumnya berisi manifest Kubernetes yang memakai **image Docker dari AWS ECR**.

MountainConnect ID **tidak lagi menggunakan Docker atau container registry** untuk deploy aplikasi.

Gunakan deploy native:

- [docs/DEPLOYMENT_RUNBOOK.md](../../docs/DEPLOYMENT_RUNBOOK.md)
- [infra/README.md](../README.md)
- `backend/ecosystem.config.cjs` dan `web-dashboard/ecosystem.config.cjs` (PM2)

Variabel lingkungan contoh untuk production: `infra/env.production.example.yaml` dan `backend/.env.example`.
