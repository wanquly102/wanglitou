# Wanglitou MVP Strategy

## Product framing

Wanglitou is positioned as a family-centered learning companion with three early monetizable modules:

- English dictation
- Chinese dictation
- Math practice

The primary buyer is the parent, while the primary user is the child. The product therefore needs two layers at the same time:

- A calm, trust-building parent-facing product experience
- A simple, action-first training interface for the child

## Product decisions

### Target users

- Parents of primary-school children
- Families preparing for KET, PET, CET-4, CET-6, TOEFL, and IELTS
- Community partners or promoters who may share referral links

### Core funnel

1. Visitor lands on the site
2. Visitor sees clear value and starts a free practice attempt
3. After the free limit is reached, the visitor is prompted to log in or upgrade
4. Logged-in parents can add children, manage practice history, and share referral links
5. Payment is handled through WeChat contact and manual VIP activation

### Monetization

- Guest users: 1 free practice attempt total
- Logged-in users: 10 free practice attempts total
- VIP users: unlimited practice attempts
- Affiliate/referral: every logged-in user gets a personal promotion link

### Registration model

- Email + password registration for the MVP
- Invite-code registration flow for private growth campaigns
- Customer-service WeChat shown as the operational backstop

## Technical decisions

### Recommended MVP stack

- Runtime: Node.js 22
- Backend: built-in `node:http`
- Local database: SQLite via `node:sqlite`
- Frontend: multi-page app with vanilla HTML, CSS, and JavaScript
- Speech: browser `speechSynthesis` for dictation

This stack is intentionally lightweight:

- No dependency installation is required for the first running version
- SQLite is enough for early-stage users, settings, content, invite codes, and usage limits
- It is easy to move later to Postgres and a modern frontend framework if growth demands it

### Why SQLite first

SQLite is the right local small database here because:

- it is zero-config
- it is reliable for small-to-medium traffic
- it supports structured admin operations well
- it is ideal for a single-server MVP and quick product iteration

## Architecture choices

### Modules

- Public marketing site
- Parent portal
- Practice engines
- Admin console
- SQLite data layer

### Data model

- `users`: parents, admins, VIP status, referral code
- `sessions`: login sessions
- `children`: child profiles under each parent account
- `practice_attempts`: quota control and analytics
- `invite_codes`: growth and operational control
- `english_words`: English dictation bank
- `chinese_words`: Chinese dictation bank
- `site_settings`: payment and operational settings

### Training engine

The MVP training engine is browser-first:

- English and Chinese dictation use browser speech synthesis
- Math generates random question sets server-side
- The frontend controls playback, pause, resume, and answer review

## Marketing and operations

### Messaging

- "快乐教育" should be translated into visible benefits, not only a slogan
- Parent-facing value should stress structure, confidence, and habit formation
- Product pages should explain why repeated short practice sessions outperform one-off pressure

### Early operational loop

- Admin tracks new registrations
- Admin activates VIP manually after WeChat confirmation
- Admin expands content banks for popular levels
- Referral links are used to test partner growth

## Delivery phases

### Phase 1

- Login and registration
- SQLite data model
- Trial gating and VIP gating
- English dictation
- Chinese dictation
- Math practice
- Admin overview, settings, users, invite codes

### Phase 2

- Practice history and reports
- Content-bank CRUD in the admin
- WeChat QR asset management
- Manual order tracking
- Referral attribution reports

### Phase 3

- Teacher or institution accounts
- AI-assisted content generation
- Personalized recommendations
- Better analytics and conversion dashboards
