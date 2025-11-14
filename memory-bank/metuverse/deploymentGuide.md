# MetuVerse Academy - Deployment Guide

**Last Updated:** 2025-11-14

---

## 📋 Overview

This guide provides comprehensive deployment procedures for MetuVerse Academy across different environments. Currently, the project is **in local development** with deployment infrastructure planned for Sprint 14.

---

## 🏗️ Deployment Architecture

### Production Stack (Planned)

```
┌─────────────────────────────────────────────────────────┐
│                   Cloudflare DNS                        │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│              Vercel Edge Network                        │
│  (Frontend hosting, CDN, SSL, automatic deployments)   │
└─────────────────┬───────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼──────────┐
│ React SPA      │  │ Supabase Cloud  │
│ (Static files) │  │ - PostgreSQL DB │
│                │  │ - Auth service  │
│                │  │ - Storage       │
└────────────────┘  └─────────────────┘
```

### Services

| Service | Provider | Purpose | Status |
|---------|----------|---------|--------|
| Frontend | Vercel | Static site hosting | Planned |
| Database | Supabase | PostgreSQL + Auth | Active (Dev) |
| Storage | Supabase Storage | User uploads, media | Planned |
| DNS | Cloudflare | Domain management | Planned |
| Monitoring | Sentry | Error tracking | Planned |
| Analytics | Plausible | Privacy-friendly analytics | Planned |

---

## 🌍 Environments

### 1. Local Development
**Purpose:** Feature development and testing

**Access:** `http://localhost:5173`

**Configuration:**
```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ENVIRONMENT=local
```

**Database:** Supabase development project

**Commands:**
```bash
npm install
npm run dev
```

---

### 2. Staging (Planned)
**Purpose:** Pre-production testing and QA

**URL:** `https://staging.metuverse.academy` (planned)

**Configuration:**
```bash
# .env.staging
VITE_SUPABASE_URL=https://staging-project.supabase.co
VITE_SUPABASE_ANON_KEY=staging-anon-key
VITE_ENVIRONMENT=staging
```

**Database:** Separate Supabase staging project

**Deployment:** Auto-deploy from `develop` branch

---

### 3. Production
**Purpose:** Live user-facing application

**URL:** `https://metuverse.academy` (planned)

**Configuration:**
```bash
# .env.production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
VITE_ENVIRONMENT=production
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

**Database:** Supabase production project

**Deployment:** Auto-deploy from `main` branch

---

## 🚀 Deployment Procedures

### Vercel Deployment (Frontend)

#### Initial Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link
```

#### Configuration File
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  },
  "routes": [
    {
      "src": "/assets/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

#### Manual Deployment
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Automated Deployment (GitHub Actions)
```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

### Supabase Deployment (Backend)

#### Database Migrations

**Local to Staging:**
```bash
# Generate migration from local changes
supabase db diff --use-migra -f new_migration_name

# Push to staging
supabase db push --db-url postgresql://postgres:[PASSWORD]@[STAGING-HOST]:5432/postgres
```

**Staging to Production:**
```bash
# Review migration SQL
cat supabase/migrations/YYYYMMDDHHMMSS_migration_name.sql

# Apply to production (with caution!)
supabase db push --db-url postgresql://postgres:[PASSWORD]@[PROD-HOST]:5432/postgres
```

#### Seed Data Deployment
```bash
# Run seed script on production
npm run seed:prod

# Or via Supabase CLI
supabase db seed --db-url postgresql://postgres:[PASSWORD]@[PROD-HOST]:5432/postgres
```

---

## 🔐 Environment Variables Management

### Required Variables

**Frontend (.env):**
```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Environment
VITE_ENVIRONMENT=production|staging|local

# Stripe (Sprint 10)
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# OpenAI (Sprint 8)
VITE_OPENAI_API_KEY=sk-...
```

### Security Best Practices

1. **Never commit `.env` files**
   ```bash
   # .gitignore
   .env
   .env.local
   .env.production
   .env.staging
   ```

2. **Use Vercel environment variables**
   - Navigate to Project Settings → Environment Variables
   - Add variables for Production, Preview, Development

3. **Rotate keys regularly**
   - Supabase: Generate new anon keys quarterly
   - Stripe: Rotate API keys after any security incident

---

## 📊 Monitoring & Observability

### Error Tracking (Sentry - Planned)

**Setup:**
```bash
npm install @sentry/react
```

**Configuration:**
```typescript
// src/lib/sentry.ts
import * as Sentry from "@sentry/react";

if (import.meta.env.VITE_ENVIRONMENT === 'production') {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1,
    beforeSend(event) {
      // Don't send errors from local development
      if (window.location.hostname === 'localhost') return null;
      return event;
    }
  });
}
```

### Performance Monitoring

**Metrics to Track:**
- **Lighthouse Scores:** Performance, Accessibility, Best Practices, SEO
- **Web Vitals:** LCP, FID, CLS
- **Bundle Size:** Track via `npm run build` output
- **API Latency:** Monitor Supabase query times

**Tools:**
- Vercel Analytics (built-in)
- Supabase Dashboard (database metrics)
- Custom Plausible events

---

## 🗄️ Database Management

### Backup Strategy

**Supabase Automatic Backups:**
- Daily backups for Pro tier
- Point-in-time recovery (7 days)

**Manual Backup:**
```bash
# Export full database
pg_dump -h db.your-project.supabase.co -U postgres -F c -b -v -f backup_$(date +%Y%m%d).dump postgres

# Restore from backup
pg_restore -h db.your-project.supabase.co -U postgres -d postgres -v backup_20250114.dump
```

### Scaling Considerations

**Database Scaling (when needed):**
1. Upgrade Supabase tier (Pro → Team → Enterprise)
2. Add read replicas for heavy read workloads
3. Implement connection pooling (Supabase has built-in PgBouncer)

**Performance Optimization:**
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_dictionary_english ON dictionary(english);
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run type-check
      
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:ci
      
  build:
    runs-on: ubuntu-latest
    needs: [lint, type-check, test]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
```

---

## 🚨 Rollback Procedures

### Frontend Rollback (Vercel)

**Option 1: Vercel Dashboard**
1. Go to Vercel project → Deployments
2. Find previous stable deployment
3. Click "Promote to Production"

**Option 2: Git Revert**
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Vercel auto-deploys the reverted state
```

### Database Rollback

**Migration Rollback:**
```bash
# Revert last migration
supabase migration revert

# Or manually run down migration
psql -h db.your-project.supabase.co -U postgres -c "DROP TABLE IF EXISTS new_table;"
```

**Full Database Restore:**
```bash
# Restore from backup (see Backup Strategy section)
pg_restore -h db.your-project.supabase.co -U postgres -d postgres -v backup_20250113.dump
```

---

## 🎯 Pre-Deployment Checklist

### Before Every Production Deploy

- [ ] All tests passing (`npm run test`)
- [ ] Type-check clean (`npm run type-check`)
- [ ] Linter clean (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables configured in Vercel
- [ ] Database migrations tested in staging
- [ ] Breaking changes documented
- [ ] Rollback plan prepared

### Before Major Releases

- [ ] Performance audit with Lighthouse
- [ ] Security audit (npm audit, Snyk)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsive testing
- [ ] Accessibility audit (axe DevTools)
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Marketing/announcement prepared

---

## 📝 Deployment Commands Reference

### Development
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler
```

### Database
```bash
npm run db:migrate       # Apply pending migrations
npm run db:seed          # Seed database
npm run db:reset         # Reset and reseed database
npm run db:pull          # Pull remote schema to local
```

### Deployment
```bash
vercel                   # Deploy to preview
vercel --prod            # Deploy to production
npm run deploy:staging   # Deploy to staging (custom script)
npm run deploy:prod      # Deploy to production (custom script)
```

---

## 🌐 DNS & Domain Configuration

### Domain Setup (Planned)

**Domain:** `metuverse.academy`

**DNS Records (Cloudflare):**
```
Type    Name                Value                       TTL
A       @                   76.76.21.21                 Auto
CNAME   www                 cname.vercel-dns.com        Auto
CNAME   staging             staging-cname.vercel.com    Auto
TXT     @                   v=spf1 include:...          Auto
```

**Vercel Domain Configuration:**
1. Add domain in Vercel project settings
2. Verify DNS records
3. Enable HTTPS (automatic via Let's Encrypt)
4. Configure redirects (www → apex or vice versa)

---

## 📈 Post-Deployment Monitoring

### First 24 Hours After Deploy

**Monitor:**
- Error rate (Sentry dashboard)
- API response times (Supabase dashboard)
- User login success rate
- Translation success rate
- Payment success rate (Sprint 10+)

**Thresholds:**
- Error rate: <1%
- API P95 latency: <500ms
- Login success: >98%
- Translation success: >95%

### Weekly Health Checks

- [ ] Review Sentry error reports
- [ ] Check database disk usage
- [ ] Review Vercel bandwidth usage
- [ ] Check SSL certificate expiry
- [ ] Review security alerts (Dependabot, npm audit)

---

## 🔒 Security Hardening

### Production Security Checklist

- [ ] HTTPS enforced (Vercel automatic)
- [ ] CORS configured correctly
- [ ] CSP headers set
- [ ] XSS protection headers
- [ ] Supabase RLS policies active
- [ ] API rate limiting configured
- [ ] SQL injection prevention verified
- [ ] Dependency vulnerabilities patched

### Headers Configuration

```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

---

## 📊 Current Deployment Status

**Environment:** Local Development Only  
**Production URL:** Not yet deployed  
**Staging URL:** Not yet deployed  
**CI/CD:** Not yet configured  
**Monitoring:** Not yet configured  

**Next Steps:**
1. Complete Sprint 14 (Analytics & Optimization)
2. Setup Vercel project
3. Configure production Supabase
4. Implement CI/CD pipeline
5. Deploy to staging
6. QA testing
7. Deploy to production

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Deployment Guide](https://supabase.com/docs/guides/hosting/overview)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Sentry React Setup](https://docs.sentry.io/platforms/javascript/guides/react/)

---

**Document Version:** 1.0  
**Next Review:** After Sprint 14 deployment implementation  
**Maintained By:** Development team + AI orchestration system