# SafeChoice ZW - Technical Architecture

## 1. Project Structure

### Mobile (React Native / Expo)
```text
mobile/
├── assets/             # Icons, splash screen, onboarding graphics
├── src/
│   ├── api/            # Generic API client (axios/fetch)
│   ├── components/     # Reusable UI (Buttons, Cards, Badges)
│   ├── constants/      # Colors, Typography, API URLs
│   ├── context/        # Global state (Session, Theme)
│   ├── hooks/          # useLocation, useForum, useRiskEngine
│   ├── navigation/     # BottomTabNavigator, StackNavigators
│   ├── screens/        # Main module screens
│   │   ├── forum/
│   │   ├── clinic/
│   │   ├── qna/
│   │   └── assessment/
│   └── utils/          # Helpers (formatDate, distanceCalc)
└── app.json            # Expo config
```

### Web Admin (React JS)
```text
web-admin/
├── src/
│   ├── components/     # Admin-only dashboard components
│   ├── pages/          # Moderation queue, Clinic management
│   └── store/          # Admin auth & data management
└── tailwind.config.js
```

## 2. Database Schema (PostgreSQL)

### `questions`
- `id`: UUID (Primary Key)
- `content`: TEXT
- `category`: ENUM ('HIV', 'PREGNANCY', 'GENERAL')
- `status`: ENUM ('PENDING', 'ANSWERED')
- `created_at`: TIMESTAMP
- `answer_text`: TEXT (Nullable)
- `answered_at`: TIMESTAMP (Nullable)

### `clinics`
- `id`: UUID
- `name`: VARCHAR(255)
- `address`: TEXT
- `city`: VARCHAR(100)
- `province`: VARCHAR(100)
- `location`: GEOGRAPHY(POINT) # For PostGIS distance queries
- `services`: TEXT[]
- `hours`: JSONB
- `is_youth_friendly`: BOOLEAN
- `verified`: BOOLEAN

### `forum_posts` & `comments`
- Standard relational structure with `anonymous_username` field (e.g., "SilverAntelope_23")

## 3. Security Considerations
- **Total Anonymity**: No PII (names, emails, phone numbers) stored for standard modules.
- **Session-Based Identity**: Use random UUIDs stored in secure local storage to track user's own posts/votes.
- **Data Encryption**: All traffic via HTTPS; sensitive health fields encrypted at rest if PII were to be added.
- **Rate Limiting**: Prevent abuse of the anonymous Q&A and Forum modules.
