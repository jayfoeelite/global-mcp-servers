# MetuVerse Academy - Testing Strategy

**Last Updated:** 2025-11-14

---

## 📋 Overview

This document outlines the comprehensive testing strategy for MetuVerse Academy. Currently, the project has **0% test coverage** as testing infrastructure has not yet been implemented. This strategy serves as the blueprint for future test implementation.

---

## 🎯 Testing Goals

1. **Achieve 80%+ code coverage** across critical paths
2. **Prevent regressions** in translation engine and authentication
3. **Validate educational content** accuracy (dictionary, lessons)
4. **Ensure cross-browser compatibility** (Chrome, Firefox, Safari, Edge)
5. **Maintain fast test execution** (<30 seconds for unit tests, <5 minutes for E2E)

---

## 🏗️ Testing Pyramid Strategy

### Unit Tests (70% of test suite)
**Purpose:** Test individual functions and components in isolation

**Coverage Target:** 80%+ of services and utility functions

**Tools:**
- **Framework:** Vitest (fast, Vite-native)
- **React Testing:** @testing-library/react
- **Assertions:** Vitest assertions + @testing-library/jest-dom
- **Mocking:** Vitest mocks

**Priority Areas:**
1. **Translation Service** (`src/services/translationService.ts`)
   - Word tokenization accuracy
   - Dictionary lookup correctness
   - Confidence scoring algorithm
   - Format conversion (transliteration, MdC, Unicode)
   
2. **Dictionary Service** (`src/services/dictionaryService.ts`)
   - Singleton instance creation
   - Dictionary loading (Supabase + fallback)
   - Word search functionality
   - Category filtering

3. **Progress Service** (`src/services/progressService.ts`) (Sprint 6-7)
   - XP calculation
   - Rank progression thresholds
   - Lesson completion tracking
   
4. **Badge Service** (`src/services/badgeService.ts`) (Sprint 6-7)
   - Badge unlock conditions
   - Achievement tracking
   - Badge persistence

**Example Unit Test:**
```typescript
// src/services/__tests__/translationService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { translate } from '../translationService';
import { dictionaryService } from '../dictionaryService';

describe('Translation Service', () => {
  beforeEach(async () => {
    await dictionaryService.loadDictionary();
  });

  it('should translate simple greeting correctly', async () => {
    const result = await translate('hello');
    
    expect(result.formats.transliteration).toBe('ḥtp');
    expect(result.formats.mdc).toBe('Htp');
    expect(result.formats.unicode).toContain('𓊵');
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  it('should handle unknown words gracefully', async () => {
    const result = await translate('xyz123');
    
    expect(result.matches).toHaveLength(0);
    expect(result.confidence).toBe(0);
  });

  it('should calculate confidence based on match rate', async () => {
    const result = await translate('hello unknown world');
    
    // 2 of 3 words matched
    expect(result.confidence).toBeCloseTo(0.67, 1);
  });
});
```

---

### Integration Tests (20% of test suite)
**Purpose:** Test component interactions and data flow

**Coverage Target:** Critical user flows and component integrations

**Tools:**
- **Framework:** Vitest
- **React Testing:** @testing-library/react
- **API Mocking:** MSW (Mock Service Worker)
- **Supabase Mocking:** Supabase mock client

**Priority Areas:**
1. **Authentication Flow**
   - Signup → profile creation → redirect
   - Login → session restore → protected route access
   - Logout → session clear → redirect to home

2. **Translation Flow**
   - Input text → translate → display all 3 formats
   - Change format tab → correct format shown
   - Export PNG/SVG → file downloaded

3. **Learning Flow** (Sprint 6-7)
   - Start lesson → view content → complete → XP awarded
   - Take quiz → submit answers → score calculated → badge unlocked
   - Premium lesson locked for free user → upgrade CTA shown

**Example Integration Test:**
```typescript
// src/components/__tests__/Translator.integration.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Translator } from '../Translator';
import { dictionaryService } from '../../services/dictionaryService';

describe('Translator Integration', () => {
  it('should translate and display all formats', async () => {
    await dictionaryService.loadDictionary();
    
    render(<Translator />);
    
    const input = screen.getByPlaceholderText(/enter text/i);
    await userEvent.type(input, 'hello');
    
    const translateBtn = screen.getByRole('button', { name: /translate/i });
    await userEvent.click(translateBtn);
    
    await waitFor(() => {
      expect(screen.getByText(/ḥtp/i)).toBeInTheDocument();
    });
    
    // Switch to MdC format
    const mdcTab = screen.getByRole('tab', { name: /mdc/i });
    await userEvent.click(mdcTab);
    
    expect(screen.getByText(/Htp/i)).toBeInTheDocument();
  });
});
```

---

### End-to-End Tests (10% of test suite)
**Purpose:** Test complete user journeys in real browser

**Coverage Target:** Critical user paths and regression prevention

**Tools:**
- **Framework:** Playwright
- **Browsers:** Chromium, Firefox, WebKit
- **Visual Regression:** Playwright screenshots + Percy (optional)

**Priority Scenarios:**
1. **New User Onboarding**
   ```gherkin
   Given I am a new visitor
   When I click "Sign Up"
   And I enter valid email and password
   And I submit the form
   Then I should see my profile
   And I should have 0 XP and "Initiate" rank
   ```

2. **Translation Journey**
   ```gherkin
   Given I am logged in
   When I enter "peace god sun" in translator
   And I click "Translate"
   Then I should see hieroglyphs
   When I click "Export PNG"
   Then a file should download
   ```

3. **Learning Journey** (Sprint 6-7)
   ```gherkin
   Given I am a free user
   When I complete Lesson 1
   Then I should earn 50 XP
   And my rank should update if threshold met
   When I try to access Lesson 4 (premium)
   Then I should see upgrade prompt
   ```

**Example E2E Test:**
```typescript
// e2e/translation-journey.spec.ts
import { test, expect } from '@playwright/test';

test('complete translation and export flow', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Login
  await page.click('text=Login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button:has-text("Sign In")');
  
  // Navigate to translator
  await page.click('text=Translator');
  
  // Enter text
  await page.fill('textarea[placeholder*="Enter"]', 'hello peace');
  await page.click('button:has-text("Translate")');
  
  // Verify hieroglyphs appear
  await expect(page.locator('svg')).toBeVisible();
  
  // Export PNG
  const downloadPromise = page.waitForEvent('download');
  await page.click('button:has-text("Export PNG")');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('.png');
});
```

---

## 🧪 Specialized Testing Strategies

### A. Dictionary Accuracy Testing
**Purpose:** Ensure linguistic correctness of translations

**Approach:**
1. **Gold Standard Dataset:** Create 50 verified translation pairs
2. **Expert Validation:** Egyptologist review of dictionary entries
3. **Automated Comparison:** Test output against expected translations
4. **Cultural Note Validation:** Verify historical accuracy of notes

**Test Data:**
```typescript
// src/data/__tests__/goldStandard.ts
export const goldStandardTranslations = [
  {
    input: 'peace',
    expected: {
      transliteration: 'ḥtp',
      mdc: 'Htp',
      unicode: '𓊵𓏏𓊪',
      culturalNote: 'Offering table, represents peace and satisfaction'
    }
  },
  // ... 49 more verified entries
];
```

### B. Hieroglyph Rendering Testing
**Purpose:** Ensure visual consistency across platforms

**Approach:**
1. **Visual Regression:** Screenshot comparison with baseline
2. **Cross-Browser:** Test on Chrome, Firefox, Safari, Edge
3. **Font Fallback:** Verify Unicode rendering with/without custom fonts
4. **Export Quality:** Validate PNG/SVG output fidelity

**Tools:**
- Playwright screenshots
- Percy visual testing (optional)
- Image comparison algorithms

### C. Gamification Logic Testing
**Purpose:** Validate XP, rank, and badge systems

**Approach:**
1. **Threshold Testing:** Verify rank-up triggers at exact XP values
2. **Badge Unlock Logic:** Test all achievement conditions
3. **Concurrent Updates:** Ensure race conditions don't duplicate XP
4. **Retroactive Badges:** Test badge unlocks for past achievements

**Example Test:**
```typescript
// src/services/__tests__/progressService.test.ts
describe('Rank Progression', () => {
  it('should promote Initiate to Scribe at 100 XP', async () => {
    const userId = 'test-user';
    
    // Start at 95 XP
    await setUserXP(userId, 95);
    
    // Award 10 XP
    await progressService.awardXP(userId, 10);
    
    const profile = await getProfile(userId);
    expect(profile.xp).toBe(105);
    expect(profile.rank).toBe('Scribe');
  });
});
```

### D. Premium Gating Testing
**Purpose:** Ensure free users cannot access premium content

**Approach:**
1. **API-Level Blocking:** Test RLS policies block premium lesson queries
2. **UI-Level Blocking:** Test premium components show lock state
3. **Bypass Attempts:** Test direct URL access, API manipulation
4. **Upgrade Flow:** Test premium unlock on payment success

---

## 🔒 Security Testing

### Authentication & Authorization
**Tests:**
- ✅ Weak passwords rejected (min 8 chars, complexity)
- ✅ Email validation prevents invalid formats
- ✅ Session tokens expire after logout
- ✅ Protected routes redirect unauthenticated users
- ✅ RLS policies prevent cross-user data access

### Data Validation
**Tests:**
- ✅ SQL injection attempts fail
- ✅ XSS attempts sanitized
- ✅ CSRF tokens validated
- ✅ Input length limits enforced

---

## ⚡ Performance Testing

### Load Testing
**Purpose:** Ensure app handles expected user load

**Tools:** K6 or Artillery

**Scenarios:**
1. **Concurrent Translations:** 100 users translating simultaneously
2. **Dictionary Load:** 1000 users loading dictionary at once
3. **Quiz Submissions:** 50 simultaneous quiz completions

**Success Criteria:**
- P95 response time < 500ms
- No errors under load
- Database connection pool stable

### Bundle Size Monitoring
**Purpose:** Keep initial load fast

**Tools:** Vite bundle analyzer

**Targets:**
- Initial JS bundle: <200KB gzipped
- CSS bundle: <50KB gzipped
- Largest chunk: <100KB

---

## ♿ Accessibility Testing

### Automated Testing
**Tools:** 
- axe-core via @axe-core/playwright
- Pa11y CI

**Coverage:**
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios

### Manual Testing
**Checklist:**
- ✅ All interactive elements keyboard accessible
- ✅ Focus indicators visible
- ✅ ARIA labels present on custom components
- ✅ Forms have proper labels and error messages
- ✅ Alt text on images

---

## 📊 Test Coverage Requirements

### By Component Type
| Component Type | Coverage Target |
|---------------|----------------|
| Services | 90% |
| Utilities | 85% |
| React Components | 70% |
| Pages | 60% |
| Config Files | 50% |

### Critical Paths (100% Required)
- Authentication flow
- Translation engine
- Payment processing (Sprint 10)
- XP award system (Sprint 6-7)
- Premium content gating

---

## 🚀 Test Execution Strategy

### Development (Local)
```bash
# Run unit tests in watch mode
npm run test:watch

# Run all tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### CI/CD Pipeline
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

---

## 📝 Test Implementation Roadmap

### Phase 1: Foundation (Sprint 7)
- [ ] Setup Vitest configuration
- [ ] Add @testing-library/react
- [ ] Configure MSW for API mocking
- [ ] Write first 20 unit tests (services)
- [ ] Setup CI/CD test pipeline

### Phase 2: Component Coverage (Sprint 8)
- [ ] Test Translator component
- [ ] Test Auth components
- [ ] Test HieroglyphCanvas
- [ ] Achieve 50% overall coverage

### Phase 3: E2E & Integration (Sprint 9)
- [ ] Setup Playwright
- [ ] Write 10 critical E2E scenarios
- [ ] Add visual regression testing
- [ ] Achieve 70% overall coverage

### Phase 4: Specialized Testing (Sprint 10)
- [ ] Dictionary accuracy suite
- [ ] Performance benchmarks
- [ ] Security penetration tests
- [ ] Accessibility audit

### Phase 5: Continuous Improvement (Ongoing)
- [ ] Maintain 80%+ coverage
- [ ] Add tests for all new features
- [ ] Review and update flaky tests
- [ ] Performance regression monitoring

---

## 🐛 Bug Tracking & Test Failures

### When Tests Fail
1. **Investigate:** Check test output and stack trace
2. **Reproduce:** Run test locally in isolation
3. **Fix or Skip:** Fix bug or mark test as `.skip` with ticket
4. **Document:** Add comment explaining skip reason

### Test Flakiness
**Causes:**
- Race conditions
- Network timing issues
- Non-deterministic data

**Solutions:**
- Add explicit waits
- Mock time/dates
- Use deterministic test data
- Increase timeout limits

---

## 📚 Testing Resources

### Documentation
- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev/)
- [MSW Docs](https://mswjs.io/)

### Team Training
- React Testing Best Practices workshop (planned)
- E2E testing patterns guide (planned)
- TDD workflow training (planned)

---

## 📊 Current Status

**Test Coverage:** 0%  
**Tests Written:** 0  
**Test Files:** 0  
**Testing Framework:** Not yet configured  
**CI/CD:** Not yet configured  

**Next Steps:**
1. Complete Sprint 6-7 LMS implementation
2. Implement Phase 1 testing foundation
3. Write initial service tests
4. Setup CI/CD pipeline

---

**Document Version:** 1.0  
**Next Review:** After Phase 1 testing implementation  
**Maintained By:** Development team + AI orchestration system