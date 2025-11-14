# MetuVerse Academy - System Patterns

**Last Updated:** 2025-11-14

---

## 🏗️ Architectural Patterns

### 1. **Service Layer Pattern**

**Purpose:** Centralize business logic and data access in reusable service modules

**Implementation:**
- **Location:** [`src/services/`](../src/services/)
- **Pattern:** Singleton services with caching
- **Current Services:**
  - [`dictionaryService.ts`](../src/services/dictionaryService.ts:1) - Dictionary data access
  - [`translationService.ts`](../src/services/translationService.ts:1) - Translation engine
  - [`authService.ts`](../src/services/authService.ts:1) - Authentication helpers (planned)
  - [`progressService.ts`](../src/services/progressService.ts:1) - Progress tracking (planned for Sprint 6-7)
  - [`badgeService.ts`](../src/services/badgeService.ts:1) - Achievement system (planned for Sprint 6-7)

**Example:**
```typescript
// Singleton pattern with caching
class DictionaryService {
  private static instance: DictionaryService;
  private dictionaryCache: DictionaryEntry[] = [];

  private constructor() {}

  public static getInstance(): DictionaryService {
    if (!DictionaryService.instance) {
      DictionaryService.instance = new DictionaryService();
    }
    return DictionaryService.instance;
  }

  public async loadDictionary(): Promise<void> {
    // Load from Supabase with fallback to JSON
  }
}

export const dictionaryService = DictionaryService.getInstance();
```

**Benefits:**
- ✅ Single source of truth for data operations
- ✅ Easy to test and mock
- ✅ Prevents duplicate API calls via caching
- ✅ Consistent error handling

---

### 2. **Component Composition Pattern**

**Purpose:** Build complex UIs from small, reusable components

**Implementation:**
- **Structure:** Atomic Design-inspired hierarchy
  - **Atoms:** Basic UI elements (buttons, inputs)
  - **Molecules:** Combinations (TranslationCard, WordBreakdown)
  - **Organisms:** Complex sections (Translator, LearningDashboard)
  - **Pages:** Full screens (Home, Profile, Lessons)

**Directory Structure:**
```
src/components/
├── translator/
│   ├── HieroglyphCanvas.tsx      # SVG renderer organism
│   ├── WordBreakdown.tsx          # Translation detail molecule
│   └── TranslationFormatTabs.tsx  # Format switcher molecule
├── auth/
│   ├── LoginModal.tsx             # Authentication organism
│   ├── SignupModal.tsx            # Registration organism
│   └── UserProfileDropdown.tsx    # Profile display molecule
├── learning/                      # Sprint 6-7 components
│   ├── LessonPlayer.tsx           # Lesson content organism (planned)
│   ├── QuizComponent.tsx          # Quiz interface organism (planned)
│   └── PracticeCanvas.tsx         # Tracing practice organism (planned)
└── shared/
    ├── Button.tsx                 # Reusable button atom
    └── Modal.tsx                  # Reusable modal atom
```

**Benefits:**
- ✅ Highly reusable components
- ✅ Easy to maintain and update
- ✅ Clear separation of concerns
- ✅ Testable in isolation

---

### 3. **React Context + Custom Hooks Pattern**

**Purpose:** Manage global state without prop drilling

**Implementation:**
- **Location:** [`src/contexts/`](../src/contexts/)
- **Current Contexts:**
  - `AuthContext` - User authentication state
  - `DictionaryContext` - Loaded dictionary data
  - `ProgressContext` - User learning progress (planned for Sprint 6-7)

**Example:**
```typescript
// Context definition
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook for easy access
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Usage in components
function Profile() {
  const { user, signOut } = useAuth();
  // ...
}
```

**Benefits:**
- ✅ No prop drilling through multiple component levels
- ✅ Type-safe with TypeScript
- ✅ Easy to test with custom providers
- ✅ Single source of truth for state

---

### 4. **Supabase Backend Pattern**

**Purpose:** Leverage Backend-as-a-Service for rapid development

**Implementation:**
- **Client:** [`src/lib/supabase.ts`](../src/lib/supabase.ts:1)
- **Features Used:**
  - **Database:** PostgreSQL with Row Level Security (RLS)
  - **Auth:** Email/password + OAuth providers
  - **Storage:** User uploads, lesson media (planned)
  - **Real-time:** Live progress updates (planned)

**Database Schema:**
```sql
-- Core tables with RLS policies
user_profiles (id, user_id, xp, rank, is_premium, badges)
lessons (id, title, content, is_free, order)
dictionary (id, english, transliteration, mdc, unicode, category)
lesson_progress (user_id, lesson_id, completed, score)
quiz_attempts (user_id, quiz_id, score, completed_at)
```

**Security Pattern - Row Level Security:**
```sql
-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

**Benefits:**
- ✅ No backend server to maintain
- ✅ Built-in authentication
- ✅ Database-level security with RLS
- ✅ Real-time subscriptions ready

---

### 5. **Translation Pipeline Pattern**

**Purpose:** Convert user input through multiple transformation stages

**Implementation:**
- **Location:** [`src/services/translationService.ts`](../src/services/translationService.ts:114-189)
- **Pipeline Stages:**
  1. **Input Normalization** - Lowercase, trim, remove punctuation
  2. **Word Tokenization** - Split into individual words
  3. **Dictionary Lookup** - Match each word to Medu Neter entry
  4. **Confidence Scoring** - Rate translation quality
  5. **Format Conversion** - Generate transliteration, MdC, Unicode
  6. **Result Assembly** - Combine into structured output

**Flow Diagram:**
```
User Input → Normalize → Tokenize → Dictionary Lookup → Score Confidence
                                                              ↓
    Display ← Format (3 views) ← Assemble Result ← Convert Formats
```

**Example:**
```typescript
export async function translate(text: string): Promise<TranslationResult> {
  // Stage 1: Normalize
  const normalized = text.toLowerCase().trim();
  
  // Stage 2: Tokenize
  const words = normalized.split(/\s+/);
  
  // Stage 3: Dictionary Lookup
  const matches = words.map(word => dictionaryService.findWord(word));
  
  // Stage 4: Confidence Scoring
  const confidence = calculateConfidence(matches);
  
  // Stage 5: Format Conversion
  const formats = {
    transliteration: matches.map(m => m.transliteration).join(' '),
    mdc: matches.map(m => m.mdc).join(' '),
    unicode: matches.map(m => m.unicode).join(' ')
  };
  
  // Stage 6: Result Assembly
  return { words, matches, confidence, formats };
}
```

**Benefits:**
- ✅ Clear separation of transformation steps
- ✅ Easy to debug each stage
- ✅ Extensible (add new formats or stages)
- ✅ Testable in isolation

---

### 6. **Progressive Enhancement Pattern**

**Purpose:** Build features incrementally with graceful degradation

**Implementation:**
- **Free Tier:** Core features available to all users
  - Translation engine (unlimited)
  - First 3 lessons
  - Dictionary browsing
  - Profile & progress tracking
- **Premium Tier:** Enhanced features for paying users
  - Lessons 4-8 (advanced topics)
  - Unlimited AI Seshat queries
  - Export features (PNG, SVG, PDF)
  - Certification system

**Gating Pattern:**
```typescript
function LessonCard({ lesson }: { lesson: Lesson }) {
  const { user } = useAuth();
  const isPremium = user?.is_premium || false;
  const isLocked = !lesson.is_free && !isPremium;

  if (isLocked) {
    return <LockedLessonCard lesson={lesson} />;
  }

  return <AccessibleLessonCard lesson={lesson} />;
}
```

**Benefits:**
- ✅ Users can try before buying
- ✅ Clear value proposition for premium
- ✅ Easy to add/remove gated features
- ✅ Fair pricing model

---

### 7. **Gamification Pattern**

**Purpose:** Motivate continued learning through game mechanics

**Implementation:**
- **XP System:** Points for completing lessons, quizzes, translations
- **Rank Progression:** 5 ranks with increasing thresholds
  - Initiate (0-99 XP)
  - Scribe (100-499 XP)
  - Priest (500-1499 XP)
  - High Priest (1500-4999 XP)
  - Pharaoh (5000+ XP)
- **Badge System:** 20+ achievement badges
- **Streak Tracking:** Daily login rewards

**XP Award Table:**
| Action | XP Awarded |
|--------|-----------|
| Complete lesson | 50 XP |
| Pass quiz (70%+) | 30 XP |
| Pass quiz (90%+) | 50 XP |
| First translation | 10 XP |
| 10 translations | 25 XP |
| 7-day streak | 100 XP |

**Database Pattern:**
```typescript
// Award XP and check for rank-up
async function awardXP(userId: string, amount: number) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('xp, rank')
    .eq('user_id', userId)
    .single();

  const newXP = profile.xp + amount;
  const newRank = calculateRank(newXP);

  await supabase
    .from('user_profiles')
    .update({ xp: newXP, rank: newRank })
    .eq('user_id', userId);

  // Check for new badges
  await checkBadgeUnlocks(userId, newXP);
}
```

**Benefits:**
- ✅ Increases user engagement
- ✅ Clear progress indicators
- ✅ Social sharing potential
- ✅ Retention through streaks

---

### 8. **Error Boundary Pattern**

**Purpose:** Gracefully handle React component errors

**Implementation:**
- **Location:** [`src/components/ErrorBoundary.tsx`](../src/components/ErrorBoundary.tsx:1) (planned)
- **Usage:** Wrap route components to prevent full app crashes

**Example:**
```typescript
class ErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service (e.g., Sentry)
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <Translator />
</ErrorBoundary>
```

**Benefits:**
- ✅ Prevents white screen crashes
- ✅ User-friendly error messages
- ✅ Error logging for debugging
- ✅ Partial app recovery

---

### 9. **Data Caching Pattern**

**Purpose:** Minimize API calls and improve performance

**Implementation:**
- **Dictionary Cache:** Load once on app init, persist in memory
- **User Profile Cache:** Refresh on auth state change only
- **Lesson Content Cache:** Load on-demand, cache for session

**Example:**
```typescript
class DictionaryService {
  private dictionaryCache: DictionaryEntry[] = [];
  private isLoaded = false;

  async loadDictionary(): Promise<void> {
    if (this.isLoaded) return; // Skip if already loaded

    try {
      const { data } = await supabase.from('dictionary').select('*');
      this.dictionaryCache = data || [];
      this.isLoaded = true;
    } catch (error) {
      // Fallback to local JSON
      const localData = await import('../data/dictionary.json');
      this.dictionaryCache = localData.default;
      this.isLoaded = true;
    }
  }
}
```

**Benefits:**
- ✅ Faster subsequent operations
- ✅ Reduced API costs
- ✅ Offline fallback capability
- ✅ Better user experience

---

### 10. **Design System Pattern**

**Purpose:** Maintain consistent visual identity across components

**Implementation:**
- **Location:** [`src/index.css`](../src/index.css:1) + Tailwind config
- **Theme Variables:**
  ```css
  :root {
    --color-background: #000000;
    --color-gold: #d4af37;
    --color-indigo: #436ff9;
    --color-crimson: #b5354b;
    --color-text: #ffffff;
  }
  ```

- **Tailwind Custom Classes:**
  ```javascript
  // tailwind.config.js
  theme: {
    extend: {
      colors: {
        kemet: {
          gold: '#d4af37',
          indigo: '#436ff9',
          crimson: '#b5354b',
        }
      },
      fontFamily: {
        heading: ['Cinzel Decorative', 'serif'],
        body: ['Poppins', 'sans-serif'],
      }
    }
  }
  ```

**Usage:**
```tsx
<button className="bg-kemet-gold text-black hover:bg-kemet-indigo transition-colors">
  Translate
</button>
```

**Benefits:**
- ✅ Consistent branding
- ✅ Easy to update theme globally
- ✅ Accessible color contrasts
- ✅ Reusable utility classes

---

## 🔄 Emerging Patterns (Sprint 6-7+)

### 11. **Lesson Player Pattern** (Planned)
- **Purpose:** Deliver structured educational content
- **Components:** Video embed, text sections, code examples, interactive quizzes
- **Navigation:** Previous/Next lesson, progress bar, bookmark

### 12. **Quiz Engine Pattern** (Planned)
- **Question Types:** Multiple choice, fill-blank, matching, T/F
- **Scoring:** Immediate feedback, XP rewards, retake logic
- **Randomization:** Shuffle questions and options

### 13. **AI Context Window Pattern** (Sprint 8)
- **Purpose:** Manage conversation history for AI Seshat
- **Implementation:** Store last 10 messages, truncate older context
- **Cost Optimization:** Limit tokens per query

---

## 📊 Pattern Metrics

**Current Usage:**
- Service Layer: 3 services implemented, 2 planned
- Component Composition: ~15 components in atomic hierarchy
- Context/Hooks: 2 contexts active, 1 planned
- Supabase Integration: 5 tables with RLS
- Translation Pipeline: 6-stage pipeline functional
- Gamification: Fully designed, awaiting Sprint 6-7 implementation

**Adherence Rate:** ~95% (all new code follows established patterns)

---

**Document Version:** 1.0  
**Next Review:** After Sprint 8 completion  
**Maintained By:** Development team + AI orchestration system

---

## 📝 Pattern Change Log

### [2025-11-14 09:42:00] - Initial System Patterns Documentation
- **Action:** Created comprehensive architectural patterns documentation
- **Patterns Documented:** 10 core patterns + 3 emerging patterns
- **Purpose:** Enable consistent development across AI sessions and human developers
- **Impact:** Establishes clear architectural guidelines for Sprint 6-7 LMS and beyond