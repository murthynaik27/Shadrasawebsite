# Shadrasa — Product Requirements Document

## Overview
Premium homemade Malenadu food brand single-page website (Shadrasa) + full dynamic admin CMS panel.

## Personas
- **Public visitor / customer** — Discovers products, reads brand story, sends contact/enquiry via WhatsApp or form.
- **Distributor / Dealer** — Reaches out for partnership.
- **Admin / Owner** — Manages content, products, banners, categories, enquiries from the admin panel (no code edits required).

## Tech Stack
- Backend: FastAPI + MongoDB (motor) + JWT auth (bcrypt) + Resend (optional emails)
- Frontend: React 19 + React Router + Tailwind + framer-motion + shadcn/ui + lucide-react + sonner
- Image storage: Base64 strings inside MongoDB (no external storage)

## Core Requirements (static, brand requested)
- Brand colors: Deep Green #0f4d2e, Gold #d4a017, Brown #6b3e1f, Cream #fdfbf7
- Single-page sticky-nav homepage with luxury typography (Playfair Display + Manrope)
- 100% dynamic — no hardcoded products/text. Everything served from `/api/site/*`.
- Premium feel similar to top FMCG/organic export brands

## Implemented (with dates)
### 2026-04-29 — MVP launch (iteration 1)
- Single-page premium homepage: Navbar, Hero slideshow, About, Why Us (8 cards), Products, Gallery, Heritage parallax, Trust counters, Business CTA, Testimonials, Contact form, Footer
- Floating WhatsApp + Scroll-to-top + Loader + SEO meta tags
- Basic admin login + dashboard (contacts + enquiries)
- Backend: JWT auth, contact/enquiry persistence, Resend stub
- Tested: 13/13 backend + all frontend flows

### 2026-05-16 — Full Admin CMS (iteration 2)
- Backend CMS: Categories CRUD, Products CRUD (with base64 image + sale price + premium badge + stock + featured/active flags), Banners CRUD (toggle active), Content GET/PUT (single doc upsert covering hero/about/mission/vision/heritage/trust counters/business CTA/contact info/footer)
- Status updates for enquiries (new → contacted → confirmed → delivered → cancelled) and contacts (new → read → replied → closed)
- Seeded default content + 2 categories + 2 products + 4 banners on startup (idempotent)
- Admin panel UI: nested layout with sidebar (Overview, Products, Categories, Banners, Story/Content, Enquiries, Contacts), reusable ImageInput component (file upload to base64 ≤2MB or URL), responsive mobile
- Homepage refactored to fully dynamic via `useSiteData()` hook
- Tested: 30/30 backend pytest + all frontend critical flows

## Backlog (deferred)
### P0
- (none — Phase 1 scope complete)

### P1 (e-commerce extension)
- Full cart + checkout flow (Add to Cart, Customer Details, Order summary)
- Payment integration (Razorpay or Stripe placeholder)
- Order management page in admin (separate from enquiries)

### P2 (per user's Phase 2 picks)
- Customer reviews moderation (model, public submit, admin approve/reject)
- Multiple admin users with roles (admin / editor / viewer)
- SEO settings per page (meta title, description, og image, canonical)
- Coupon codes (deferred — user didn't pick)
- In-panel notifications (deferred — user didn't pick)

## Auth / Credentials
Admin: `admin@shadrasa.com` / `Shadrasa@2026` — stored in `/app/backend/.env` (ADMIN_EMAIL, ADMIN_PASSWORD) — admin user upserted on every backend startup.

## API Surface
- Public: `/api/contact`, `/api/enquiry`, `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`, `/api/site/{content,products,banners,categories}`
- Admin (auth required): `/api/admin/{dashboard,stats,categories,products,banners,content,contacts,enquiries}` (full REST), plus `PUT /api/admin/{enquiries,contacts}/{id}/status`

## Integrations
- **Resend** (email) — optional, set `RESEND_API_KEY` in `/app/backend/.env`. Backend gracefully skips email when key missing.

## Next Actions
- Wait for user direction on Phase 2 (cart/checkout, reviews, multi-admin, SEO).
