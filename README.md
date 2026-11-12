# துணை AI (Thunai AI)

**Thunai AI** is a Tamil-first, voice-friendly public welfare scheme assistant designed for citizens in Tamil Nadu — including farmers, daily-wage workers, women, students, and senior citizens.

Many intended beneficiaries have low literacy, use entry-level smartphones, and have limited English proficiency. Thunai AI enables users to discover the government schemes they are eligible for, required documents, and application steps simply by speaking or typing in natural Tamil or English.

---

## 🌟 Key Features

- **🗣️ Tamil-First Voice Navigation**:
  - Voice input powered by browser Web Speech API (`SpeechRecognition`, language `ta-IN`).
  - Voice audio playback powered by browser `speechSynthesis` ("Listen / கேள்" button on every card and question).
- **🤖 LLM-Assisted Extraction & Explanation (Google Gemini API)**:
  - Gemini extracts structured profile attributes from conversational user speech or text.
  - **Zero LLM Hallucinations on Eligibility**: The LLM **never** decides eligibility.
  - Gemini rewrites results into simple, reassuring spoken Tamil/English based **only** on matched scheme data.
- **⚡ Deterministic Rules Engine**:
  - Pure TypeScript rules engine evaluating age, gender, occupation, income ceiling, land holding, and disability against structured scheme rules.
  - Classifies schemes into **Eligible (`matched`)** and **Needs Confirmation (`maybe`)**.
- **📋 Interactive Document Checklist**:
  - Touch-friendly checkboxes for Aadhaar, Ration Card, Patta, Income Certificate, etc.
- **📱 Mobile-First Accessible Design**:
  - Large touch targets (minimum 48px to 56px).
  - High contrast colors (Tamil Nadu greenery & warm amber accents).
  - High readability fonts (`Noto Sans Tamil` from Google Fonts).
- **🔒 Privacy First & Serverless Ready**:
  - No database required, no user data or authentication stored.
  - API keys are strictly kept server-side in Next.js API route handlers.

---

## 🏗️ Folder Structure

```
Thunai AI/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── extract/
│   │   │   │   └── route.ts          # POST: Gemini AI extraction (Tamil/English speech -> Profile JSON)
│   │   │   ├── match/
│   │   │   │   └── route.ts          # POST: Deterministic rules-based eligibility matching engine
│   │   │   └── explain/
│   │   │       └── route.ts          # POST: Gemini AI plain Tamil/English audio explanation
│   │   ├── layout.tsx                # Root layout with Noto Sans Tamil & Inter Google Fonts
│   │   ├── page.tsx                  # Main app container (Landing -> Conversational Chat -> Results)
│   │   └── globals.css               # Tailwind CSS base and pulse animation styles
│   ├── components/
│   │   ├── Header.tsx                # Sticky header with logo, language toggle (ta/en), audio guide
│   │   ├── DisclaimerBanner.tsx      # Prominent guidance disclaimer
│   │   ├── LandingHero.tsx           # Welcome hero, beneficiary category cards, big Start button
│   │   ├── ChatInterface.tsx         # Conversational assistant with voice input, quick-tap options, input bar
│   │   ├── ResultsView.tsx           # Matched scheme cards, tabs, and AI audio summary
│   │   ├── SchemeCard.tsx            # Scheme card with benefit, reasons, checklist, apply steps, official link
│   │   ├── ProfileSummary.tsx        # Profile details card with quick badges and edit button
│   │   ├── VoiceButton.tsx           # Large interactive microphone button with listening animation
│   │   └── AudioPlayerButton.tsx     # Reusable "Listen / கேள்" TTS player button
│   ├── lib/
│   │   ├── gemini.ts                 # Google Gemini SDK client with fallback heuristic extraction
│   │   ├── matcher.ts                # Deterministic eligibility engine (pure TS, 100% testable)
│   │   ├── types.ts                  # TypeScript types for UserProfile, Scheme, SchemeMatch
│   │   ├── speech.ts                 # Web Speech API helpers (SpeechRecognition & SpeechSynthesis)
│   │   └── rate-limiter.ts           # IP sliding-window rate limiter & input length validation
│   └── data/
│       └── schemes.json              # 10 Tamil Nadu government welfare schemes with structured rules
├── tests/
│   └── matcher.test.ts               # Unit test suite with 10 distinct profile scenarios
├── .env.example                      # Sample environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.mjs
├── vercel.json                       # Vercel deployment configuration
└── README.md
```

---

## 🏛️ Schemes Included (in `src/data/schemes.json`)

1. **Kalaignar Magalir Urimai Thittam (KMUT)** - ₹1,000/month basic income for women heads of households.
2. **Pudhumai Penn Thittam** - ₹1,000/month for female students from government schools in higher education.
3. **Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS)** - ₹5 Lakhs cashless health coverage.
4. **PM-KISAN (Central & TN)** - ₹6,000/year income support for landholding farmers.
5. **Tamil Nadu Old Age Pension (OAP)** - ₹1,000/month destitute elderly pension.
6. **TN Construction Workers Welfare Board Assistance** - Accident cover, children education, marriage aid & pension.
7. **Tamil Nadu Differently Abled Maintenance Allowance** - ₹2,000/month maintenance grant.
8. **Chief Minister's Uzhavar Pathukappu Thittam** - Social security for small farmers and landless agricultural labourers.
9. **Tamil Nadu Free Laptop Scheme for Students** - Free laptop for govt/aided school and college students.
10. **Moovalur Ramamirtham Ammiyar Marriage Assistance Scheme** - Financial aid (₹25k-₹50k) + 8g Gold Coin for poor brides.

*All entries in `schemes.json` are marked with `"verification_status": "TODO: verify from official site"` and link directly to official government portals.*

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node.js 20 & 24)
- npm or yarn

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <repo-url>
cd "Thunai AI"
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> **Note**: Even if `GEMINI_API_KEY` is not provided, Thunai AI includes a built-in heuristic Tamil/English extractor and template generator, so the application remains fully functional for testing and local evaluation!

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Unit Tests
Thunai AI includes a unit test suite testing the deterministic rules engine across 10 sample user profiles (female farmer, college student, construction worker, senior citizen, disabled individual, etc.):
```bash
npm test
```

### 6. Production Build
Verify that the production build passes:
```bash
npm run build
```

---

## 🚢 Deploy to Vercel

Thunai AI is architected specifically for zero-configuration deployment on Vercel:

### Option A: Via Vercel Web Dashboard (Recommended)
1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [https://vercel.com/new](https://vercel.com/new).
3. Import your `Thunai AI` repository.
4. In **Environment Variables**, add:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: `<Your Google Gemini API Key>`
5. Click **Deploy**. Vercel will build and deploy the Next.js App Router application automatically.

### Option B: Via Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```
When prompted, link your project and add the environment variable:
```bash
vercel env add GEMINI_API_KEY
vercel --prod
```

---

## ⚠️ Guidance & Legal Disclaimer
> **தகவல்கள் பொது வழிகாட்டலுக்கு மட்டுமே. / Information is for guidance only.**
> Thunai AI is an independent civic technology initiative and is **not** an official government agency. Scheme eligibility criteria, income ceilings, and benefits are subject to government notifications. Users must verify details and submit official applications at their local Village Administrative Officer (VAO), e-Sevai / CSC centre, or Taluk office.
