# EduPro Design Guidelines

## Design Philosophy

**Approach:** Material Design 3 + Custom Educational Context

**Principles:**
- Clarity over decoration - prioritize information hierarchy
- Role-appropriate density (dense admin dashboards, spacious student views)
- Cultural sensitivity across English, Bengali, Arabic (RTL)
- Professional trust through stable visual design

---

## Color System

### Light Mode
- **Primary:** `hsl(210 85% 45%)` | Hover: `hsl(210 85% 38%)`
- **Secondary:** `hsl(160 45% 48%)`
- **Surface:** `hsl(210 20% 98%)` | Elevated: `hsl(0 0% 100%)`
- **Text:** Primary `hsl(210 15% 20%)` | Secondary `hsl(210 10% 50%)`
- **Border:** `hsl(210 15% 88%)`

### Dark Mode
- **Primary:** `hsl(210 75% 60%)` | Hover: `hsl(210 75% 68%)`
- **Secondary:** `hsl(160 40% 55%)`
- **Surface:** `hsl(210 15% 12%)` | Elevated: `hsl(210 12% 16%)`
- **Text:** Primary `hsl(210 10% 95%)` | Secondary `hsl(210 8% 70%)`
- **Border:** `hsl(210 12% 22%)`

### Semantic (Light/Dark)
- **Success:** `hsl(142 75% 45%)` / `hsl(142 65% 55%)`
- **Warning:** `hsl(38 92% 50%)` / `hsl(38 85% 60%)`
- **Error:** `hsl(0 75% 55%)` / `hsl(0 65% 65%)`
- **Info:** `hsl(210 85% 55%)` / `hsl(210 75% 65%)`

---

## Typography

**Fonts:** Inter (UI), Poppins (Display), Noto Sans (Arabic/Bengali)

**Scale:**
- Display: `text-4xl font-bold` (36px)
- H1: `text-3xl font-semibold` (30px)
- H2: `text-2xl font-semibold` (24px)
- H3: `text-xl font-medium` (20px)
- Body Large: `text-base font-normal` (16px)
- Body: `text-sm font-normal` (14px)
- Caption: `text-xs font-normal` (12px)

---

## Layout & Spacing

**Spacing Scale:** Use 2, 4, 8, 12, 16 units consistently
- Micro: `p-2 gap-2`
- Component: `p-4 gap-4`
- Cards: `p-6 to p-8`
- Sections: `my-12 my-16`
- Dashboards: `gap-6 to gap-8`

**Grid System:**
- Dashboards: 12-column, 6-8px gaps
- Forms: max-w-4xl, 2-column desktop
- Cards: `lg:grid-cols-3` (stats), 2-column (content)

**Containers:**
- Full-width: `w-full max-w-7xl mx-auto px-6`
- Forms: `max-w-5xl`, Text: `max-w-3xl`
- Dashboards: `px-4 md:px-6 lg:px-8` (no max-width)

---

## Components

### Navigation
- **Sidebar (Desktop):** 280px fixed left, collapsible sections, role badge top
- **Mobile:** Bottom tab bar (4-5 items) + hamburger menu
- **Top Bar:** Logo, global search, language switcher, notifications, user menu
- **Breadcrumbs:** Always visible for deep navigation

### Cards & Containers
- **Stat Cards:** Elevated, colored icon background, 12px radius, subtle shadow
- **Content Cards:** Border-based, 8px radius, hover lift effect
- **Modals:** `max-w-2xl`, backdrop blur, slide-up animation (250ms)

### Data Display
- **Tables:** Sticky header, zebra striping, sortable columns, inline actions
- **Attendance Grid:** Calendar-style, color-coded (green=present, red=absent, yellow=late)
- **Progress:** Linear bars (grades), circular (overall performance)

### Forms
- **Inputs:** Outlined (`border-2` on focus), floating labels, helper text below
- **Dropdowns:** Custom with search (long lists), native (short lists)
- **Validation:** Inline errors (red text + icon), success (green border)
- **File Upload:** Drag-drop zone, preview thumbnails, progress indicators

### Buttons
- **Primary:** Filled brand color, `px-6 py-3`, 6px radius
- **Secondary:** Outlined, transparent background, hover fill
- **Icon:** 40x40px touch target, 6px radius
- **FAB:** 56px diameter, bottom-right for primary actions

---

## Role-Specific Dashboards

### Admin/SuperAdmin
1. Top Row: 4 KPI cards (Students, Teachers, Revenue, Tasks)
2. Mid: 2-column (Attendance chart + Recent Activities)
3. Bottom: Quick Links grid (4-column)

### Teacher
1. Hero: Today's schedule (current/next class highlighted)
2. Stats: My Classes, Pending Reviews, Attendance Rate
3. Grid: Recent Assignments (2-col), Performance Chart, Quick Actions

### Student
1. Welcome card (semester/class info)
2. Upcoming: Next 3 classes, pending assignments
3. Performance: Grade cards, attendance %, resources links

### Guardian
1. Child selector dropdown (top)
2. Overview: Attendance %, Latest Results, Fee Status
3. Communication: Teacher messages, announcements, detailed reports

---

## Animations & Interactions

**Use Sparingly:**
- Page transitions: 150ms fade
- Card hover: `translateY(-2px)` + shadow (200ms)
- Modal entry: Backdrop fade + slide-up (250ms)
- Loading: Skeleton screens (tables/cards), spinners (actions)
- Success: Checkmark animation (300ms)

**Avoid:** Scroll-triggered animations, excessive micro-interactions, decorative parallax

---

## Special Features

### Multi-Language & RTL
- **RTL Layout:** Full mirror for Arabic (sidebar right, text-align right)
- **Icons:** Arrows flip in RTL, universal icons unchanged
- **Numbers:** Locale-aware (Bengali ১২৩, Arabic ١٢٣)
- **Toggle:** Flag/text labels (EN/বাং/عربي) in top bar, persists in profile

### Islamic Module
- **Prayer Times:** Compact card, next prayer countdown, green accent
- **Quran Progress:** Circular indicator, surah/ayah details, achievement badges
- **Hijri Calendar:** Dual display in date pickers, highlighted important dates

### Accessibility (WCAG AA)
- **Contrast:** Min 4.5:1 (text), 3:1 (UI components)
- **Keyboard:** Visible focus (2px blue outline), logical tab order
- **Screen Readers:** ARIA labels for icons, table scope attributes
- **Scaling:** Adapts to 200% zoom without horizontal scroll

### Marketing Website
- **Hero:** Full-width image (1920x800px), 40% overlay gradient, centered headline (`text-5xl`), enrollment CTA
- **Features:** 3-column grid (icons + benefits), responsive stack
- **Testimonials:** Card carousel (avatar + quote + role)
- **CTA Section:** Secondary teal background, dual CTAs

---

## Image Guidelines

**Usage:**
- **Marketing Hero:** 1920x800px, classroom/campus, 40% dark overlay
- **Dashboard Welcome:** Isometric illustrations (400x300px) in empty states
- **Avatars:** Circular, 120x120px (profiles), 40x40px (lists)
- **Announcements:** Optional 16:9 featured images
- **Login/Auth:** Split screen (branded imagery left, form right)

**Style:** Professional photography or flat illustrations matching brand palette

---

## Implementation Checklist

1. **Design System:** Configure Tailwind (custom colors, spacing, component classes)
2. **Core Layouts:** Sidebar, top bar, dashboard grid, responsive breakpoints
3. **Components:** Button variants, inputs, cards, modals (Shadcn/Radix)
4. **Dashboards:** Role-specific layouts with dummy data
5. **i18n:** Translation system, RTL testing, number/date formatting
6. **Polish:** Accessibility audit, cross-browser testing, lazy loading