# Football Stars ⚽

אפליקציית טפטים של שחקני כדורגל לילדים — React Native Expo

---

## דרישות מוקדמות

- Node.js 18+ מותקן
- npm או yarn
- חשבון Expo (חינמי) — [expo.dev](https://expo.dev)

---

## התקנה והפעלה מהירה

```bash
# 1. כנס לתיקיה
cd football

# 2. התקן תלויות
npm install

# 3. הפעל את Expo
npx expo start
```

---

## בדיקה על מכשיר Android אמיתי (ללא APK!)

### שיטה מהירה — Expo Go

1. הורד את **Expo Go** מ-Google Play Store על הטלפון
2. הרץ `npx expo start` על המחשב
3. סרוק את **QR Code** שמופיע בטרמינל עם האפליקציה Expo Go
4. האפליקציה נפתחת מיד!

> שים לב: בגרסת Expo Go לא יהיו פרסומות AdMob אמיתיות — הן יוחלפו ב-placeholder.

---

## בנייה ל-APK (להתקנה ישירה ללא Play Store)

### שלב 1: התקן EAS CLI
```bash
npm install -g eas-cli
```

### שלב 2: התחבר לחשבון Expo
```bash
npx eas login
```

### שלב 3: הגדר EAS
```bash
npx eas build:configure
```

### שלב 4: בנה APK (preview)
```bash
npx eas build --platform android --profile preview
```

- הבנייה מתבצעת בענן (~10-15 דקות)
- בסוף מקבלים קישור להורדת קובץ `.apk`
- העבר את הקובץ לטלפון והתקן אותו (יש לאפשר "מקורות לא ידועים" בהגדרות)

### קובץ eas.json לדוגמה:
```json
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

---

## הגדרת AdMob (Google Ads)

### שלב 1: צור חשבון AdMob
1. גש ל-[admob.google.com](https://admob.google.com)
2. הירשם עם חשבון Google
3. צור אפליקציה חדשה → Platform: Android

### שלב 2: קבל את ה-App ID
1. ב-AdMob: Apps → [האפליקציה שלך] → App settings
2. העתק את **App ID** (נראה כך: `ca-app-pub-XXXXXXXXX~XXXXXXXXX`)

### שלב 3: עדכן app.json
```json
"plugins": [
  [
    "react-native-google-mobile-ads",
    {
      "androidAppId": "ca-app-pub-XXXXX~XXXXX"  // <- שנה לזה
    }
  ]
]
```

### שלב 4: צור Ad Units
1. ב-AdMob: Apps → [האפליקציה] → Ad units → Add ad unit
2. צור **Banner** ad unit → קבל ID → עדכן ב-`components/AdBanner.tsx`
3. צור **Interstitial** ad unit → קבל ID → עדכן ב-`components/InterstitialAdModal.tsx`

> למבדקים, השתמש ב-IDs הנוכחיים (test IDs) — הם כבר מוגדרים.

---

## הגדרת Supabase (backend אופציונלי)

### שלב 1: צור פרויקט
1. גש ל-[supabase.com](https://supabase.com) → New Project
2. תן שם לפרויקט ובחר אזור

### שלב 2: קבל credentials
1. Settings → API
2. העתק את **Project URL** ואת **anon/public key**

### שלב 3: צור קובץ .env
```bash
cp .env.example .env
```
ערוך את `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### שלב 4: צור טבלת favorites (אופציונלי)
```sql
-- ב-Supabase SQL Editor:
create table favorites (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  player_id text not null,
  created_at timestamp with time zone default timezone('utc', now())
);

alter table favorites enable row level security;
```

---

## מבנה הפרויקט

```
football/
├── app/
│   ├── _layout.tsx          # Root layout
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Tab bar
│   │   ├── index.tsx        # מסך הבית
│   │   ├── gallery.tsx      # גלריה
│   │   └── generate.tsx     # AI Generate
│   └── wallpaper/
│       └── [id].tsx         # מסך טפט מלא
├── components/
│   ├── WallpaperCard.tsx
│   ├── PlayerAvatar.tsx
│   ├── AdBanner.tsx
│   ├── InterstitialAdModal.tsx
│   ├── SearchBar.tsx
│   └── CategoryFilter.tsx
├── constants/
│   ├── theme.ts             # צבעים ועיצוב
│   └── players.ts           # רשימת 32 שחקנים
├── hooks/
│   └── usePlayerImages.ts   # טעינת תמונות
├── lib/
│   ├── supabase.ts          # Supabase client
│   └── sportsApi.ts         # TheSportsDB API
├── services/
│   └── imageService.ts      # הורדה ושיתוף
└── assets/                  # אייקונים
```

---

## API — TheSportsDB

האפליקציה משתמשת ב-[TheSportsDB](https://www.thesportsdb.com/free_sports_api) API חינמי.
- לא דרוש API key
- Rate limit: נדיב לשימוש רגיל
- בגרסה הבאה: אפשר לשדרג ל-Patreon tier לקבל fanart ותמונות נוספות

---

## שאלות נפוצות

**שאלה: האפליקציה לא מציגה תמונות**
תשובה: TheSportsDB עלול להיות איטי. המתן כמה שניות. הכרטיסים יציגו gradient עם ראשי תיבות עד שהתמונות נטענות.

**שאלה: פרסומות לא מופיעות**
תשובה: בגרסת Expo Go הפרסומות מוצגות כ-placeholder. בניה עם EAS נדרשת לפרסומות אמיתיות.

**שאלה: איך מוסיפים שחקן חדש?**
תשובה: ערוך `constants/players.ts` והוסף אובייקט `Player` חדש לרשימה `PLAYERS`.

---

## רישיון

MIT — לשימוש חינמי
