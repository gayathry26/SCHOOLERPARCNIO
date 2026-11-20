# EdvoNest Production Deployment & Security Hardening Checklist

**Platform:** EdvoNest Enterprise School Management ERP  
**Architecture:** Next.js 16 (App Router), TypeScript 5, Prisma ORM, PostgreSQL 16  
**Tagline:** Learn • Grow • Succeed  

---

## Pre-Deployment Verification Matrix

| Category | Item Description | Status | Verification Mechanism |
| :--- | :--- | :---: | :--- |
| **Database** | PostgreSQL 16+ Clustered Instance | Required | Managed RDS Aurora / Dedicated PgBouncer |
| **Database** | Multi-Tenant Data Isolation Enforced | Verified | Tenant authorization checks (`schoolId`) on all tables |
| **Backup** | Automated AES-256-GCM Encrypted Snapshots | Operational | `src/lib/backup/backup-manager.ts` |
| **Backup** | Scheduled Backups & Retention Policy (7d/4w/12m) | Operational | `src/scripts/backup/scheduler.ts` |
| **Backup** | Tested Database Restoration Drill | Verified | `src/scripts/backup/run_restore.ts` (100% SHA-256 checksum match) |
| **Security** | Rate Limiting on Auth & Payment Endpoints | Operational | `src/lib/security/rate-limiter.ts` (5 req/min auth, 10 req/min pay) |
| **Security** | Secure File Uploads (MIME & Size Whitelist) | Operational | `src/lib/storage/secure-storage.ts` (10MB limit, no executable types) |
| **Security** | Sensitive API Routes SW Cache Bypass | Operational | `public/sw.js` blacklist bypass for `/api/fees`, `/api/finance`, etc. |
| **Security** | Environment Variable Validation at Startup | Operational | `src/lib/env.ts` (validates keys >= 32 chars in production) |
| **Monitoring** | Subsystem Health Check Endpoint (`/api/health`) | Operational | Returns DB status, latency, memory RSS/heap, uptime |
| **Monitoring** | Container Readiness Probe (`/api/health/ready`) | Operational | Kubernetes / AWS ALB target group health probe |
| **Monitoring** | Structured JSON Logging & Data Redaction | Operational | `src/lib/monitoring/logger.ts` (passwords/tokens redacted) |
| **Monitoring** | API Latency & Slow Query Alarms (>300ms) | Operational | `src/lib/monitoring/metrics.ts` |
| **PWA** | Installable PWA Manifest & Multi-Resolution Icons | Operational | `/public/manifest.json` & `/public/icons/` |
| **PWA** | Branded Offline Fallback Screen | Operational | `/public/offline.html` |
| **PWA** | Web Push Notification Dispatch Service | Operational | `/api/pwa/push` |

---

## Production Deployment Step-by-Step Procedure

### Stage 1: Server & Infrastructure Provisioning
1. Provision Ubuntu 24.04 LTS or Amazon Linux 2023 host (Min: 4 vCPU, 8GB RAM).
2. Install Node.js 20 LTS and Nginx / Caddy reverse proxy.
3. Configure Let's Encrypt SSL/TLS Certificate (Strict HTTPS, HSTS enabled).
4. Configure Firewall (`ufw`): Allow ports 80, 443, block direct database port 5432 externally.

### Stage 2: Database Setup & Migration
1. Provision managed PostgreSQL database (e.g. AWS RDS or Supabase).
2. Apply schema migrations:
   ```bash
   npx prisma db push
   ```
3. Run data migration if upgrading from development SQLite:
   ```bash
   npx tsx src/scripts/database/migrate_sqlite_to_postgres.ts
   ```

### Stage 3: Environment Secrets Injection
Inject verified production environment variables:
```bash
NODE_ENV="production"
DATABASE_URL="postgresql://user:pass@host:5432/edvonest_prod?sslmode=require"
JWT_SECRET="<MIN_32_CHARACTERS_HIGH_ENTROPY_KEY>"
BACKUP_ENCRYPTION_KEY="<MIN_32_CHARACTERS_HIGH_ENTROPY_KEY>"
BACKUP_STORAGE_PATH="/var/backups/edvonest"
BACKUP_RETENTION_DAYS="30"
```

### Stage 4: Build & Service Launch
1. Build Next.js application:
   ```bash
   npm run build
   ```
2. Start application service via PM2 / systemd:
   ```bash
   pm2 start npm --name "edvonest-erp" -- start
   pm2 startup
   pm2 save
   ```
3. Start the automated backup daemon:
   ```bash
   pm2 start "npx tsx src/scripts/backup/scheduler.ts" --name "edvonest-backup-scheduler"
   ```

### Stage 5: Verification & Smoke Test
1. Execute health check:
   ```bash
   curl -I https://app.edvonest-academy.edu.in/api/health
   # Expected: HTTP/2 200 OK
   ```
2. Execute automated production readiness test:
   ```bash
   npx tsx src/scripts/audit/test_production_readiness.ts
   ```
3. Verify PWA install prompt triggers in mobile Chrome and Safari.
