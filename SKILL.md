# CPSC Project Skill
## Common Physical Security Controls — Pine Risk Management

---

## What this project is

A public-facing vulnerability reference library for physical security professionals. Built for Pine Risk Management (pinerisk.com). Each page covers one physical security vulnerability — how it works, how to mitigate it, and what products/standards address it.

**URL:** To be determined (hosted on Vercel, connected to GitHub)
**Stack:** Pure static HTML/CSS/JS — no framework, no build step
**Deploys:** Push to GitHub main → Vercel auto-deploys

---

## File structure

```
/
├── index.html              ← Landing page with all vulnerability cards
├── css/
│   └── style.css           ← Shared design system (edit colors here)
├── vulns/
│   ├── canned-air.html     ← CPSC-001: REX sensor spoofing
│   ├── under-door.html     ← CPSC-002: Under-door lever manipulation
│   └── lock-shimming.html  ← CPSC-003: Spring latch shimming
└── SKILL.md                ← This file
```

**Rule:** Each vulnerability is one self-contained HTML file in `/vulns/`. All shared styles are in `css/style.css`. Never put page-specific styles in `style.css` — use a `<style>` block in the page file.

---

## How to add a new vulnerability

### Step 1 — Add a card to index.html

Inside `<div class="card-grid" id="vuln-grid">`, add a new `<a>` tag following this pattern:

```html
<a href="vulns/YOUR-SLUG.html" class="vuln-card" data-cats="CATEGORY1 CATEGORY2">
  <div class="card-top">
    <span class="card-number">CPSC-00X</span>
    <span class="severity-badge sev-critical">Critical</span>
    <!-- severity: sev-critical | sev-high | sev-medium | sev-low -->
  </div>
  <div class="card-title">Vulnerability name</div>
  <div class="card-vector-tag">Attack vector short name</div>
  <p class="card-desc">1-2 sentence description of the attack.</p>
  <div class="card-tags">
    <span class="tag">Tag 1</span>
    <span class="tag">Tag 2</span>
  </div>
  <div class="card-footer">
    <span class="card-cta">View explainer →</span>
    <span class="card-meta">Category · Access control</span>
  </div>
</a>
```

**data-cats** must match the filter buttons: `access-control`, `sensor`, `lock`, `door`. Add new categories here if needed and add a matching filter button.

Also update the stats bar numbers (vulnerabilities, mitigations, product references).

---

### Step 2 — Create the vulnerability detail page

Copy an existing vuln page (e.g. `canned-air.html`) to `vulns/YOUR-SLUG.html`. Update:

1. `<title>` tag
2. `CPSC-00X` number
3. Severity badge class
4. Category badges in `.vuln-meta-row`
5. `<h1>` — vulnerability name
6. `.lead` — 2-3 sentence intro
7. `.fast-facts` — 5 fact cards (tool, time, skill, detection risk, alert generated)
8. Explainer prose (two `<p>` blocks minimum, plus `.attack-steps`)
9. Warning box (red team observation)
10. SVG diagram (see diagram guidelines below)
11. Mitigation cards (4 categories, each with 4 bullet points minimum)
12. Product cards (6-8 products, real US market products only)
13. Footer vuln name
14. States array in `<script>` (3 states: secured → attack → unlocked/open)

---

## Diagram guidelines

Each vuln page has an SVG attack diagram with 3 click-through states. The diagram uses a schematic/blueprint style — minimal, technical, no illustrations.

**SVG viewBox:** Always `0 0 360 280` or `0 0 360 260`
**Background:** `url(#grid)` pattern — already defined in each page; sits on the light diagram panel
**Colors:** Light "blueprint" palette. SVG doesn't support CSS vars in all attributes, so use hardcoded hex that matches the light design system:
- Door/frame fill: `#e3e9f1`, deep fill/panel: `#eef2f7`, stroke: `#9aa6b8`
- Grid lines: `#d6dde7`
- Text labels: `#7a869b` (muted), `#586780` (secondary)
- Accent: `#b8382c` (Pine Risk red)
- Attack elements: `#c9821c` (amber/warning)
- Alert state: `#cf3f31` (critical red)
- Normal state: `#0d9488` (teal/secure)

**State machine pattern:** Each diagram has a `states` array with 3 objects: `{ label, labelStyle, caption, setup(svg) }`. The `setup` function toggles opacity on SVG groups to show/hide elements per state.

---

## Design system reference

The design is a committed **light "field manual" theme** (readable, professional, print-reference feel). All tokens live in `style.css`. Key values:

| Token | Value |
|-------|-------|
| bg-primary (page) | #f3f5f8 |
| bg-surface (cards) | #ffffff |
| bg-elevated (chips) | #eef1f6 |
| accent (Pine Risk red) | #b8382c |
| text-primary (ink) | #16202e |
| text-secondary (slate) | #4c5a6e |
| text-muted | #8b95a6 |
| border (hairline) | #e4e8ef |
| font-display | Archivo (700, 800) |
| font-body | IBM Plex Sans (400, 500, 600) |
| font-mono | IBM Plex Mono (400, 500, 600) |

**Severity ramp (chip text on light tint):** Critical = red (#b02417), High = amber (#925c07), Medium = teal (#0b7a6d), Low = blue (#2760a7)

**Category badges:** `.cat-tech` (blue), `.cat-phys` (amber), `.cat-policy` (teal), `.cat-detect` (purple)

---

## Content standards

- **Products:** Real US-market products only. Include manufacturer name and specific model. Never invent product names.
- **Red team note:** Every page has a `.warning-box` with a first-person red team observation. Keep it practical and specific.
- **Severity:** Use the CPSC severity definitions:
  - Critical: widely applicable, little/no skill, no alarm generated
  - High: widely applicable, some skill or some detection risk
  - Medium: narrower applicability or meaningful detection risk
  - Low: difficult, low success rate, or easily detected
- **Attack steps:** Always 4 steps. Numbered 01-04. Each step is 1-2 sentences.
- **Mitigation cards:** 4 categories per vuln, 4 bullet points per card minimum. One of the 4 categories must always be Detection.
- **Product cards:** 6-8 cards per vuln. Click handler calls `askAbout('full product description')`.

---

## Guide pages (deep dives)

Beyond the numbered vulnerability pages, the library can carry **guide pages**: long-form
deep dives on a topic (the first is `rex-sensors.html`, "Choosing a request-to-exit sensor").
A guide reuses the shared design system and `app.js` (for its Reference Technology modal) and
adds page-specific `<style>` for its own sections (comparison table, technology cards, decision
guide, standards cards). It is linked from the related vuln page and the index with a
`.deepdive-cta` banner (styles in `style.css`). Guides are validated the same way as everything
else: real products with working links, and technical/legal claims (e.g. IBC/NFPA code sections)
checked against sources, with edition noted.

## Reference Technology data model

The "Reference Technology" section on each vuln page is **data-driven**. Shared
behavior (card rendering + the in-page detail modal) lives in `app.js`; the data
lives in a `PRODUCTS` array in each page's inline `<script>`, ending with
`CPSC.initProducts({ gridId: 'prod-grid', products: PRODUCTS })`.

Each product object:

```js
{ cat: 'sensor',                 // must match a data-prod-filter button
  maker: 'BEA',
  name: 'R2E-100',
  type: 'Focused active-infrared REX sensor',   // short subtitle
  image: 'https://…/photo.png',  // '' → generated "no image yet" placeholder
  datasheet: 'https://…/spec.pdf', // '' → button shows "not yet added"
  productUrl: 'https://…',        // '' → button shows "not yet added"
  blurb: 'One-paragraph summary (card + modal).',
  defeats: 'Why this specifically beats the attack — shown as a callout.',
  tags: ['Active IR', 'REX sensor'],
  specs: [ ['Detection','Focused active infrared'], … ],  // [] → no spec table
  comments: [ { author, role, date, text }, … ] }         // [] → empty state
```

**Rules**
- **Real products only, verified.** Every `name`, `datasheet`, `productUrl`, and
  `image` must resolve to a real page/file — check before publishing. Several
  originally-drafted model numbers were fabricated and had to be corrected; don't
  trust a model number without confirming it exists.
- **`defeats` is required for every technology** — one sentence, technically
  accurate, on why it defeats *this page's* attack. This is the "explain why we
  suggest it" rule.
- **`image`**: use the manufacturer's own hosted image URL (confirm it isn't
  hotlink-protected). Do not fabricate product photos or make placeholder art.
- The **"Add a field note"** button emails `abels023@umn.edu` with subject
  `CPSC-Note on [name]` — implementers submit real-world notes that become
  `comments` entries.

## Branding notes

- Pine Risk brand color: `#b8382c` (red)
- Logo mark: "PR" monogram in red square
- Link to pinerisk.com in header nav and footer
- Contact CTA: `https://pinerisk.com/contact`
- Tone: Practitioner-to-practitioner. Not alarmist. Not sales-y. Specific, operational, accurate.
- Never say "penetration test" — use "red team assessment" or "physical security assessment"

---

## Future planned vulnerabilities

- CPSC-004: Proximity badge cloning (125 kHz HID) — complex, needs its own sub-sections for 125 kHz vs 13.56 MHz, Flipper Zero, reader selection guidance
- CPSC-005: Tailgating / piggybacking
- CPSC-006: Social engineering front desk / reception
- CPSC-007: Elevator interlock bypass
- CPSC-008: Alarm panel manipulation
- CPSC-009: Glass break / door hinge attack
- CPSC-010: CCTV blind spot exploitation

---

## Deployment

1. Push files to GitHub (main branch)
2. Vercel auto-deploys on push
3. No build command needed — Vercel serves static files directly
4. Set "Root Directory" to `/` in Vercel project settings

**Vercel config (if needed):** Create `vercel.json` at root:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/$1" }]
}
```

---

*Last updated: Initial build. Update this file whenever the file structure, design system, or content standards change.*
