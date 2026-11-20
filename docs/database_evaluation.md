# EdvoNest Production Database Architecture Evaluation

**Target Deployment:** Enterprise Multi-Tenant CBSE & ICSE School Management ERP  
**Tagline:** Learn • Grow • Succeed  

---

## 1. Executive Summary: Why SQLite Cannot Be Used in Production

While SQLite is outstanding for local development, zero-config prototyping, and single-user embedded tools, it is strictly disqualified as a production database for multi-tenant school ERPs for the following critical reasons:

1. **File-Level Concurrency Locking**:
   - SQLite locks the entire database file on write transactions (`database is locked` error).
   - In a school environment with 200+ teachers taking morning attendance simultaneously, 1,500 parents checking fee status, and automated background notifications, SQLite write queues inevitably stall or reject transactions.
2. **No Native Connection Pooling**:
   - Next.js serverless and server runtime scaling creates multiple concurrent Node.js processes, leading to file-lock contention.
3. **No Multi-Region Replication & Point-in-Time Recovery (PITR)**:
   - Enterprise compliance (CBSE audit guidelines, ISO 27001) mandates continuous transaction archiving and sub-minute recovery points.

---

## 2. In-Depth Comparison: PostgreSQL vs. MySQL for EdvoNest

| Architecture Dimension | PostgreSQL 16+ (Recommended) | MySQL 8.0+ | EdvoNest Requirement Impact |
| :--- | :--- | :--- | :--- |
| **JSON Support & Queries** | **Superior (JSONB)** with GIN indexing, binary storage, and nested JSON queries | Basic JSON type; slower functional indexing | **High:** EdvoNest stores dynamic schemas (`itemsJson`, `blueprintJson`, `answersJson`) in fee invoices and exams |
| **Multi-Tenant Isolation** | **Native Row-Level Security (RLS)** and multi-schema (`search_path`) capability | Manual WHERE clauses only | **Critical:** PostgreSQL RLS guarantees zero cross-tenant data leaks at the database engine level |
| **Concurrency & MVCC** | Multi-Version Concurrency Control with fine-grained row locks | InnoDB row locks with potential gap-lock deadlocks | **High:** Smooth concurrent fee payments, grade submissions, and attendance logs |
| **Connection Pooling** | Native compatibility with **PgBouncer**, Supabase, Neon, AWS RDS Proxy | MySQL Router / ProxySQL | **High:** Essential for Next.js horizontal scale-out |
| **Prisma ORM Synergy** | 100% feature coverage in Prisma (enums, full-text search, composite types) | Enums supported; limited advanced indexing | **Medium:** Full native Prisma typing |
| **Backup & Recovery** | `pg_dump`, `wal-g`, continuous streaming replication | `mysqldump`, binary logs | **High:** Disaster recovery RPO < 1 hour |

---

## 3. Recommended Production Architecture: PostgreSQL

For production deployment, EdvoNest is architectured around **PostgreSQL 16** hosted on managed cloud infrastructure:

- **Option A (AWS)**: Amazon Aurora PostgreSQL Serverless v2 with RDS Proxy.
- **Option B (Dedicated)**: PostgreSQL on Ubuntu 24.04 LTS paired with PgBouncer connection pooler and automated S3 WAL archiving (`wal-g`).
- **Option C (Managed Cloud)**: Supabase Enterprise / Neon Serverless Postgres.

### Multi-Tenant Strategy
Every query continues to be partitioned by `schoolId`, reinforced by PostgreSQL foreign keys with `ON DELETE RESTRICT` for financial and academic ledger entries.

---

## 4. Migration Path from Development SQLite to Production PostgreSQL

1. **Provision PostgreSQL Database**:
   ```bash
   createdb -O edvonest_user edvonest_production
   ```
2. **Update Environment**:
   ```bash
   DATABASE_URL="postgresql://edvonest_user:PASSWORD@host:5432/edvonest_production?sslmode=require"
   ```
3. **Push Prisma Schema to PostgreSQL**:
   ```bash
   npx prisma db push --schema=prisma/schema.postgresql.prisma
   ```
4. **Run Data Migration Utility**:
   ```bash
   npx tsx src/scripts/database/migrate_sqlite_to_postgres.ts
   ```
5. **Verify Data Integrity**:
   ```bash
   npx tsx src/scripts/audit/test_production_readiness.ts
   ```
