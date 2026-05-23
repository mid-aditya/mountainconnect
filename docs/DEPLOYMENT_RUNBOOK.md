# Deployment Runbook - MountainConnect ID

## Pre-requisites

- [ ] AWS CLI configured with appropriate IAM credentials
- [ ] kubectl configured for EKS cluster
- [ ] Docker installed for local builds
- [ ] Helm 3.x installed
- [ ] Terraform >= 1.5 installed
- [ ] Access to ECR repositories (push access)
- [ ] Domain configured in Route53
- [ ] SSL certificates provisioned via ACM

## Environment Setup

### Variables

```bash
# Environment
export ENVIRONMENT=staging  # or production
export REGION=ap-southeast-1
export PROJECT_NAME=mountainconnect

# Docker
export ECR_REPO_API=${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${PROJECT_NAME}-api
export ECR_REPO_WORKER=${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${PROJECT_NAME}-worker
export ECR_REPO_DASHBOARD=${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/${PROJECT_NAME}-dashboard

# Kubernetes
export CLUSTER_NAME=${PROJECT_NAME}-${ENVIRONMENT}
export NAMESPACE=${PROJECT_NAME}
```

## Database Migration

```bash
# 1. Pull latest migration files
git pull origin main

# 2. Run migrations (production requires maintenance window)
kubectl exec -n ${NAMESPACE} deployment/api-primary -- \
  npm run migrate:latest

# 3. Verify migration status
kubectl exec -n ${NAMESPACE} deployment/api-primary -- \
  npm run migrate:status

# 4. Rollback if needed
kubectl exec -n ${NAMESPACE} deployment/api-primary -- \
  npm run migrate:rollback -- --to=previous
```

## Docker Image Build & Push

```bash
# 1. Authenticate to ECR
aws ecr get-login-password --region ${REGION} | \
  docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com

# 2. Build API image
docker build -t ${ECR_REPO_API}:${GIT_SHA} \
  --build-arg GIT_SHA=${GIT_SHA} \
  --build-arg NODE_ENV=production \
  -f Dockerfile.api .

# 3. Build Worker image
docker build -t ${ECR_REPO_WORKER}:${GIT_SHA} \
  --build-arg NODE_ENV=production \
  -f Dockerfile.worker .

# 4. Build Dashboard image
docker build -t ${ECR_REPO_DASHBOARD}:${GIT_SHA} \
  --build-arg NODE_ENV=production \
  -f Dockerfile.dashboard .

# 5. Push to ECR
docker push ${ECR_REPO_API}:${GIT_SHA}
docker push ${ECR_REPO_WORKER}:${GIT_SHA}
docker push ${ECR_REPO_DASHBOARD}:${GIT_SHA}

# 6. Tag as latest
docker tag ${ECR_REPO_API}:${GIT_SHA} ${ECR_REPO_API}:latest
docker push ${ECR_REPO_API}:latest
```

## Service Deployment

### Rolling Update (Zero Downtime)

```bash
# 1. Update image tag in deployment
kubectl set image deployment/api-primary \
  api=${ECR_REPO_API}:${GIT_SHA} \
  -n ${NAMESPACE}

# 2. Monitor rollout
kubectl rollout status deployment/api-primary -n ${NAMESPACE} --timeout=300s

# 3. Update worker
kubectl set image deployment/worker \
  worker=${ECR_REPO_WORKER}:${GIT_SHA} \
  -n ${NAMESPACE}

kubectl rollout status deployment/worker -n ${NAMESPACE} --timeout=300s

# 4. Update dashboard
kubectl set image deployment/dashboard \
  dashboard=${ECR_REPO_DASHBOARD}:${GIT_SHA} \
  -n ${NAMESPACE}

kubectl rollout status deployment/dashboard -n ${NAMESPACE} --timeout=300s
```

### Helm Deployment

```bash
# Update helm values
helm upgrade --install ${PROJECT_NAME}-api ./charts/api \
  --namespace ${NAMESPACE} \
  --set image.tag=${GIT_SHA} \
  --set environment=${ENVIRONMENT} \
  --atomic \
  --timeout 5m

helm upgrade --install ${PROJECT_NAME}-worker ./charts/worker \
  --namespace ${NAMESPACE} \
  --set image.tag=${GIT_SHA} \
  --set environment=${ENVIRONMENT} \
  --atomic \
  --timeout 5m
```

## Health Check Endpoints

| Service | Endpoint | Expected |
|---------|----------|----------|
| API | `GET /health` | `200 OK` + `{status: "ok"}` |
| API | `GET /health/ready` | `200 OK` + `{status: "ready", db: true, redis: true}` |
| API | `GET /metrics` | Prometheus metrics |
| Dashboard | `GET /api/health` | `200 OK` |

```bash
# Verify API health
curl https://api.${PROJECT_NAME}.id/health

# Verify dashboard health
curl https://dashboard.${PROJECT_NAME}.id/api/health

# Check pod status
kubectl get pods -n ${NAMESPACE} -l app=api
```

## Monitoring Setup

### Prometheus

Scrape endpoints are automatically configured via service monitors. Verify:

```bash
# Check Prometheus targets
kubectl exec -n monitoring deployment/prometheus -- \
  promtool query targets

# Verify metrics are being collected
kubectl exec -n monitoring deployment/prometheus -- \
  promtool query instant \
  --prometheus-url=http://prometheus:9090 \
  'up{job="mountainconnect-api"}'
```

### Grafana

Access at: `https://grafana.${PROJECT_NAME}.id`

Default dashboards:
- MountainConnect - API Overview
- MountainConnect - SOS Real-time
- MountainConnect - Business Metrics

## Backup Strategy

### PostgreSQL (RDS)

- **Automated backups**: Daily at 02:00 UTC, retention 35 days
- **Manual snapshots**: Before major deployments
- **Point-in-time recovery**: Available within retention window

```bash
# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier ${PROJECT_NAME}-${ENVIRONMENT} \
  --db-snapshot-identifier ${PROJECT_NAME}-pre-deploy-$(date +%Y%m%d-%H%M)
```

### Redis (ElastiCache)

- **Automatic backups**: Daily at 03:00 UTC, retention 7 days
- **Cluster mode**: Enabled for production

### S3 Assets

- **Versioning**: Enabled
- **Lifecycle**: Move to IA after 90 days, Glacier after 1 year
- **Cross-region replication**: Enabled for disaster recovery

## Rollback Procedure

### Application Rollback

```bash
# 1. Get previous successful deployment
kubectl rollout history deployment/api-primary -n ${NAMESPACE}

# 2. Rollback to previous version
kubectl rollout undo deployment/api-primary -n ${NAMESPACE}

# 3. Verify rollback
kubectl rollout status deployment/api-primary -n ${NAMESPACE}
```

### Database Rollback

```bash
# 1. STOP - Do not proceed if data is critical
# 2. Create snapshot of current state
aws rds create-db-snapshot \
  --db-instance-identifier ${PROJECT_NAME}-${ENVIRONMENT} \
  --db-snapshot-identifier ${PROJECT_NAME}-pre-rollback-$(date +%Y%m%d)

# 3. Restore from previous backup (creates new instance)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier ${PROJECT_NAME}-${ENVIRONMENT}-restored \
  --db-snapshot-identifier ${PROJECT_NAME}-backup-YYYY-MM-DD-HH-MM

# 4. Update connection string in Secrets Manager
# 5. Deploy restored instance
```

## Scaling Guide

### Horizontal Scaling (Pods)

```bash
# Manual scale
kubectl scale deployment/api-primary --replicas=5 -n ${NAMESPACE}

# Or use HPA
kubectl autoscale deployment/api-primary \
  --min=2 \
  --max=10 \
  --cpu-percent=70 \
  -n ${NAMESPACE}
```

### Vertical Scaling (Resources)

Update resource requests/limits in values file and redeploy.

### Database Scaling

- **Read replicas**: For read-heavy workloads
- **Vertical scaling**: Change instance class (requires downtime)
- **Connection pooling**: PgBouncer for connection management

## Alert Response

| Alert | Severity | Action |
|-------|----------|--------|
| API latency > 2s | P2 | Check pods, scale if needed |
| API error rate > 1% | P1 | Rollback to previous version |
| Service down | P1 | Immediate rollback, page on-call |
| Disk usage > 80% | P2 | Clean up logs, scale storage |
| SOS queue > 100 | P1 | Scale worker, check worker health |
| DB connections > 80% | P2 | Review connection pooling |

## Emergency Contacts

| Role | Contact |
|------|---------|
| DevOps Lead | [on-call rotation] |
| Security | security@mountainconnect.id |
| DPO | dpo@mountainconnect.id |
| AWS Support | Enterprise Support |

## Post-Deployment Checklist

- [ ] Verify health checks pass
- [ ] Check error rates in Grafana
- [ ] Verify critical user flows (login, booking, SOS)
- [ ] Confirm backup completed
- [ ] Update deployment log
- [ ] Notify stakeholders (Slack #deployments)
- [ ] Monitor for 30 minutes post-deploy
