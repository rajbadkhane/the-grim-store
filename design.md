---
name: The Grim Store
colors:
  surface: '#FAFAFA'
  surface-dim: '#E2E8F0'
  surface-bright: '#FAFAFA'
  surface-container-lowest: '#FFFFFF'
  surface-container-low: '#F8FAFC'
  surface-container: '#F1F5F9'
  surface-container-high: '#E2E8F0'
  surface-container-highest: '#CBD5E1'
  on-surface: '#0F172A'
  on-surface-variant: '#475569'
  inverse-surface: '#0B0F19'
  inverse-on-surface: '#F8FAFC'
  outline: '#CBD5E1'
  outline-variant: '#E2E8F0'
  surface-tint: '#0F172A'
  primary: '#0F172A'
  on-primary: '#FFFFFF'
  primary-container: '#F8FAFC'
  on-primary-container: '#0F172A'
  inverse-primary: '#F8FAFC'
  secondary: '#ca1c1c'
  on-secondary: '#FFFFFF'
  secondary-container: '#FCE8E6'
  on-secondary-container: '#A81111'
  tertiary: '#FFD93D'
  on-tertiary: '#0F172A'
  tertiary-container: '#FFF9E6'
  on-tertiary-container: '#806600'
  error: '#22C55E'
  on-error: '#FFFFFF'
  error-container: '#E6F9EC'
  on-error-container: '#11662C'
  primary-fixed: '#0F172A'
  primary-fixed-dim: '#1E293B'
  on-primary-fixed: '#FFFFFF'
  on-primary-fixed-variant: '#CBD5E1'
  background: '#FAFAFA'
  on-background: '#0F172A'
  surface-variant: '#F8FAFC'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 88px
    fontWeight: '800'
    lineHeight: 88px
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 48px
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 32px
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 30px
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '500'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.375rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1.0rem
  xl: 1.25rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 32px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

# Brand & Visual Identity — The Grim Store

The Grim Store is a premium, modern e-commerce platform curated for tech-forward families. The brand visual language sits at the intersection of **Apple** (clean ambient shadows, minimalism, layout asymmetry), **Nothing/Lego** (playful technical aesthetics, bold high-contrast details, and raw functional badges), and **Nintendo** (tactile, responsive micro-interactions).

The experience is optimized for speed, clarity, and instant product discovery, using a highly responsive structured catalog and premium display typography.

---

## 1. Color Palette System

Our colors are designed to command visual hierarchy and adhere strictly to **WCAG AA contrast requirements** (minimum 4.5:1 ratio for standard text, 3:1 for large display elements).

- **Primary Background**: `#FAFAFA` (Light mode) and `#0B0F19` (Dark mode) for pure, distraction-free canvasing.
- **Secondary Background**: `#F8FAFC` (Light) and `#0F172A` (Dark) for structuring sub-sections and cards.
- **Brand Accent Color**: `#ca1c1c` (Crimson Red) for primary badges, alerts, highlights, and active CTA micro-states.
- **Accent Highlight**: `#FFD93D` (Sunshine Yellow) for product ratings, special bundle details, and warm badges.
- **Primary Text / Foreground**: `#0F172A` (Slate Dark) and `#F8FAFC` (Slate Light) to ensure maximum text readability.
- **Muted Text**: `#475569` (Slate Gray) and `#CBD5E1` (Slate Light Gray) to maintain contrast while establishing textual hierarchy.

---

## 2. Typography Hierarchy

We use a strong pairing of a high-contrast geometric sans-serif for display headings and a highly legible neutral sans-serif for functional reading.

- **Display Headings (Space Grotesk)**: Heavy weight (`800`), tight tracking (`-0.04em`), and leading (`1.0`) to create dense, impactful display panels. Heading size scales dynamically from `48px` (mobile) to `88px` (desktop) in Hero screens.
- **Functional Body Text (Inter)**: Clean structure with high x-height, optimized for micro-readability, dynamic filtering options, checkout forms, and review tables.

---

## 3. Shapes & Border Radii

Our shape language is bold, structural, and soft:
- **Product Cards / Image Containers**: Large `20px` (or `1.25rem`) rounded corners with smooth internal bounds.
- **Interactive Buttons / CTA Inputs**: Large `16px` (`1.0rem`) rounded corners with a height of `52px` for comfortable touch targets on mobile.
- **Megamenu Panels / Overlays**: Soft `24px` (`1.5rem`) rounded bounds to present information in distinct, high-end bento containers.

---

## 4. Spacing & Mobile UX Layout

- **Safety Bounds**: Global `90px` bottom padding constraint enforced on all mobile layouts (`width <= 1024px`) to prevent any content or checkout action overlapping with the fixed bottom navigation bar.
- **Adaptive Grid Structure**: High-density 12-column layout on desktop, shifting cleanly to 2-column or 1-column layouts on mobile viewports.
- **Featured Collections Bento Grid**: Asymmetric grids with high-contrast pastel backdrops, displaying image scales cleanly (`object-contain`) to eliminate stretch distortion.

---

## 5. Animation & Motion Design

We utilize `framer-motion` to create ambient depth and tactile responsiveness:
- **Card Hover states**: Cards translate `y: -8` and scale to `1.02` using a smooth cubic-bezier (`[0.34, 1.56, 0.64, 1]`) transition.
- **Floating Hero Cards**: Asymmetric floating animations with translation offsets (`y: [0, -18, 0]`) and slow, non-intrusive periods (4.5s to 8s) to simulate ambient, interactive depth.
- **Sticky Buy/Purchase Bar**: Slides up smoothly (`y: [100, 0]`) from the bottom when scrolling past main primary buying options.
