# EdvoNest Disaster Recovery & Business Continuity Plan

**System:** EdvoNest Enterprise School Management Operating System  
**Tagline:** Learn • Grow • Succeed  
**Classification:** Confidential — System Operations Runbook  

---

## 1. Disaster Recovery Objectives (SLA)

| Metric | Target SLA | Strategy |
| :--- | :--- | :--- |
| **Recovery Point Objective (RPO)** | **< 1 Hour** | Daily full AES-256-GCM encrypted snapshots + transactional WAL logging |
| **Recovery Time Objective (RTO)** | **< 15 Minutes** | Single-command automated restore with pre-flight rollback safety snapshots |
| **Data Integrity Verification** | **100% Guaranteed** | Dual SHA-256 checksums + authenticated GCM tags to prevent bit-rot or tampering |
| **Encryption Standard** | **AES-256-GCM** | PBKDF2 key derivation (100,000 iterations), 96-bit unique IVs, 128-bit auth tags |

---

## 2. Backup Topology & Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │       ACTIVE PRODUCTION DATABASE             │
                    │   (PostgreSQL Aurora / Development SQLite)   │
                    └──────────────────────┬───────────────────────┘
                                           │
                             Scheduled Cron / Trigger
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │         COMPRESSION (Gzip Level 9)           │
                    └──────────────────────┬───────────────────────┘
                                           │
                             Key Derivation (PBKDF2)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │       AES-256-GCM ENCRYPTED ARCHIVE          │
                    │    SHA-256 Digest + Auth Tag Signature       │
                    └──────────────────────┬───────────────────────┘
                                           │
                ┌──────────────────────────┴──────────────────────────┐
                ▼                                                     ▼
    ┌────────────────────────┐                             ┌────────────────────────┐
    │  PRIMARY DISK BACKUP   │                             │  OFF-SITE S3 STORAGE   │
    │  ./backups/*.enc       │                             │  Immutable Bucket      │
    └────────────────────────┘                             └────────────────────────┘
```

---

## 3. Retention Policy Rules

Backups are classified and retained automatically according to the following schedule:

- **Daily Snapshots**: 7 most recent days retained.
- **Weekly Archives**: 4 most recent weeks retained.
- **Monthly Milestones**: 12 months retained for academic year audits.
- **Automatic Pruning**: Expired backups beyond the policy threshold are deleted automatically during every backup run to conserve storage.

---

## 4. Disaster Recovery & Restoration Procedures

### Scenario A: Accidental Data Corruption or User Mistake

1. **Locate Latest Valid Backup**:
   ```bash
   npx tsx src/scripts/backup/run_backup.ts list
   ```
2. **Execute Automated Restore**:
   ```bash
   npx tsx src/scripts/backup/run_restore.ts <backup_filename_or_id>
   ```
3. **Automated Rollback Protection**:
   Before modifying any active database, the restore manager automatically snapshots the current state into `*.pre_restore_rollback_<timestamp>.bak`.
4. **Verification**:
   Verify the restored database passes the health check:
   ```bash
   curl http://localhost:3000/api/health
   ```

### Scenario B: Catastrophic Server / Hardware Failure

1. Provision a fresh compute instance with Node.js 20+ and Next.js 16 runtime.
2. Clone repository:
   ```bash
   git clone <repo_url> /var/www/edvonest
   cd /var/www/edvonest
   npm ci --production
   ```
3. Copy environment configuration and the `BACKUP_ENCRYPTION_KEY`:
   ```bash
   cp /etc/edvonest/.env.production .env
   ```
4. Transfer the encrypted `.enc` and `.meta.json` archives from S3/cold-storage to `./backups/`.
5. Execute restore:
   ```bash
   npx tsx src/scripts/backup/run_restore.ts latest
   ```
6. Run database migrations:
   ```bash
   npx prisma generate
   ```
7. Start application daemon:
   ```bash
   npm run start
   ```
8. Confirm HTTP `200 OK` on `/api/health`.

---

## 5. Security & Key Management

- Never commit `BACKUP_ENCRYPTION_KEY` to Git repositories.
- In production, manage the encryption key via AWS Secrets Manager, HashiCorp Vault, or Google Cloud Secret Manager.
- Periodically rotate encryption keys during academic term transitions.
