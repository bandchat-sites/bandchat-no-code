# Changelog

All notable changes to the Frozen Assets website will be documented in this file.

## [1.0.10] - 2026-02-15

### Added
- **Contact Form Email** - Serverless API endpoint (`api/contact.js`) using Resend SDK to send form submissions as emails to `info@frozen-assets.band`
- Contact form now POSTs to `/api/contact` with loading state, error handling, and success feedback

### Fixed
- Logo not appearing on deployed site (logo PNG was excluded by `*.png` in `.gitignore`)
- Updated `.gitignore` to allow `public/images/logos/*.png`

### Changed
- Contact email changed from `contact@` to `info@frozen-assets.band`

## [1.0.8] - 2026-02-15

### Added
- **Gig Detail Page Overhaul** - Hero section with venue photo background, info cards (date, venue, songs, duration), styled setlist with set cards and song durations, lineup section with member photo thumbnails inferred from band member stints, auto-generated gig stats (total songs, artists covered, longest/shortest song, debut songs, longest set)
- **Setlist Matching** - Gig detail and archive pages now match setlists from `setlists.json` by date + venue when the gig's own setlists are empty
- **Prev/Next Gig Navigation** - Arrow links at bottom of gig detail page for chronological browsing between gigs
- **Archive Page Views** - 3 switchable view modes:
  - **Cards** - Photo card grid with year filter tabs, hover zoom effects, gradient overlays
  - **Timeline** - Vertical timeline with alternating left/right cards, center line with dot markers
  - **Compact** - Collapsible year accordions with alternating row colors
- **Archive Enhancements** - Member avatar thumbnails, song counts, and set durations on all archive views

### Fixed
- Header logo broken image (URL-encoded space in filename)
- Hamburger menu showing on desktop (CSS cascade order fix)
- Accordion view title/venue running together (added flex column layout)

### Changed
- Gig detail page: all inline styles moved to `styles/pages/gig-detail.css`
- Archive page: upgraded from `container--narrow` to full `container` width for card/timeline views

## [1.0.3] - 2026-02-15

### Added
- **Songs Page** - Full repertoire browser with search and sort (by title, artist, key)
- **Stats Page** - Band stats dashboard with top venues, shows per year, and most played songs (bar charts)
- **Dynamic Timeline** - Member stint Gantt chart showing instrument roles and tenure periods
- **Scroll Reveal** - IntersectionObserver-based reveal animations for timeline events
- **BandChat Sync** - `scripts/sync.js` now pulls real data from BandChat production API
- Stats computed during sync: total gigs, songs, members, venues, top venues

### Changed
- Timeline page now shows member history visualization above event timeline
- Sync script writes `stats.json` with computed aggregates
- About page uses live stats from synced data

### Fixed
- Data files now populated with real band data from BandChat

## [1.0.2] - 2026-02-15

### Fixed
- Corrected artist references in trivia to match actual repertoire (Van Halen, Black Crowes, Steppenwolf, etc.)
- Fixed venue names to match real Tokyo venues (What The Dickens, Bauhaus)
- Updated song trivia facts for accuracy

## [1.0.1] - 2026-02-15

### Added
- **Core Website** - React 18 + Vite SPA with dark rock-and-roll theme
- **Home Page** - Hero section, next-gig banner, upcoming shows preview, CTA
- **Shows Page** - Upcoming gigs list with date/venue/status cards
- **Gig Detail Page** - Full gig view with setlist, lineup, media gallery
- **Archive Page** - Past gigs grouped by year with thumbnails
- **About Page** - Band story, current/guest/past member cards with instruments
- **Setlists Page** - All setlists with song positions, keys, and performers
- **Timeline Page** - Band history events grouped by year
- **Media Page** - Photo grid with lightbox + video links
- **Blog** - Blog listing and single post pages (static JSON)
- **Community Page** - Announcements and polls from BandChat
- **Contact Page** - Booking form (mailto-based) + social links
- **Merch Page** - Placeholder merch grid (coming soon)
- **Privacy & Cookie Policy** - Legal pages
- **Trivia Popup** - Periodic rock trivia toast notifications
- **Admin Panel** - Login, dashboard, content viewer, guest list manager, blog editor, merch manager
- **AI Agents** - Amp (design), Buzz (social media), Riff (content) chat agents
- **Layout** - Fixed header with scroll detection, mobile hamburger nav, footer with socials, sticky footer bar with version
- **BandChat Integration** - Sync script to pull data from BandChat API into static JSON
- **Deployment** - Vercel config with SPA rewrites
- **Design System** - CSS variables for colors, typography, spacing; Oswald + Inter fonts
- Lazy loading for secondary pages
- Responsive design with mobile navigation
- Open Graph and Twitter Card meta tags
