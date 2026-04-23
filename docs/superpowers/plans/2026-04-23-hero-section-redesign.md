# Hero Section Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade landing page hero section with refined minimalism aesthetic - sophisticated typography, warm gold accents, refined glassmorphism, and subtle animations.

**Architecture:** Frontend-only changes to LandingPage.jsx component. Add custom fonts via Google Fonts, extend Tailwind config for animations and display font, add CSS keyframes for page load animations. No backend/database changes required.

**Tech Stack:** React 18, Tailwind CSS 4.0, Google Fonts (Playfair Display), CSS animations

---

## File Structure

**Files to Modify:**
- `resources/js/Pages/LandingPage.jsx` (lines 72-170) - Hero section markup and styling
- `tailwind.config.js` - Add display font and custom animations
- `resources/css/app.css` - Add keyframe animations
- `resources/views/app.blade.php` - Add Google Fonts preconnect and link

**No new files created.**

---

## Task 1: Add Google Fonts and Tailwind Config

**Files:**
- Modify: `resources/views/app.blade.php`
- Modify: `tailwind.config.js`

- [ ] **Step 1: Add Google Fonts to app.blade.php**

Open `resources/views/app.blade.php` and add these lines in the `<head>` section, before the `@viteReactRefresh` line:

```html
<!-- Google Fonts: Playfair Display -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Extend Tailwind config with display font**

Open `tailwind.config.js` and add to the `theme.extend` section:

```js
fontFamily: {
  'display': ['Playfair Display', 'serif'],
},
```

- [ ] **Step 3: Add custom animations to Tailwind config**

In the same `theme.extend` section of `tailwind.config.js`, add:

```js
animation: {
  'fade-in-up': 'fadeInUp 0.6s ease-out',
  'fade-in-scale': 'fadeInScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
  'fade-in': 'fadeIn 0.6s ease-out',
},
keyframes: {
  fadeInUp: {
    'from': {
      opacity: '0',
      transform: 'translateY(20px)',
    },
    'to': {
      opacity: '1',
      transform: 'translateY(0)',
    },
  },
  fadeInScale: {
    'from': {
      opacity: '0',
      transform: 'scale(0.95)',
    },
    'to': {
      opacity: '1',
      transform: 'scale(1)',
    },
  },
  fadeIn: {
    'from': { opacity: '0' },
    'to': { opacity: '1' },
  },
},
```

- [ ] **Step 4: Verify Tailwind config syntax**

Run: `npm run build`
Expected: Build succeeds without errors

- [ ] **Step 5: Commit font and animation setup**

```bash
git add resources/views/app.blade.php tailwind.config.js
git commit -m "feat(hero): add Playfair Display font and animation utilities"
```

---

## Task 2: Update Hero Section Container and Background

**Files:**
- Modify: `resources/js/Pages/LandingPage.jsx:72-93`

- [ ] **Step 1: Update section padding and overflow**

Replace line 73:
```jsx
<section className="relative pt-32 md:pt-40 overflow-hidden">
```

With:
```jsx
<section className="relative py-24 md:py-32 lg:py-40 overflow-hidden">
```

- [ ] **Step 2: Update gradient overlay**

Replace lines 89-90:
```jsx
{/* Overlay for readability */}
<div className="absolute inset-0 bg-black/60 z-0"></div>
```

With:
```jsx
{/* Refined gradient overlay */}
<div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/70 to-slate-900/80 z-0"></div>
```

- [ ] **Step 3: Update blue rectangle to subtle geometric accent**

Replace lines 92-93:
```jsx
{/* Blue Rectangle behind Student */}
<div className="absolute top-0 left-1/2 h-full w-full md:w-[720px] bg-primary/80 z-0 hidden md:block"></div>
```

With:
```jsx
{/* Geometric accent - subtle gradient */}
<div className="absolute top-0 left-1/2 h-full w-full md:w-[720px] bg-gradient-to-br from-blue-600/20 to-indigo-600/20 z-0 hidden md:block"></div>

{/* Top-right atmospheric glow */}
<div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-blue-500/10 to-transparent z-0 pointer-events-none"></div>
```

- [ ] **Step 4: Test visual changes**

Run: `npm run dev`
Open: `http://localhost:8000`
Expected: Hero background has refined gradient overlay, subtle blue accent behind student

- [ ] **Step 5: Commit background updates**

```bash
git add resources/js/Pages/LandingPage.jsx
git commit -m "feat(hero): refine background gradient and geometric accents"
```

---

## Task 3: Update Grid Layout and Spacing

**Files:**
- Modify: `resources/js/Pages/LandingPage.jsx:95-98`

- [ ] **Step 1: Update grid to asymmetric layout**

Replace line 96:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
```

With:
```jsx
<div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-16 md:gap-20 items-end">
```

- [ ] **Step 2: Update text column spacing**

Replace line 98:
```jsx
<div className="space-y-6">
```

With:
```jsx
<div className="space-y-10">
```

- [ ] **Step 3: Test layout changes**

Run: `npm run dev`
Open: `http://localhost:8000`
Expected: Text column slightly wider, bottom-aligned with image, more generous spacing

- [ ] **Step 4: Commit layout updates**

```bash
git add resources/js/Pages/LandingPage.jsx
git commit -m "feat(hero): update grid to asymmetric layout with refined spacing"
```

---

## Task 4: Update Typography - Heading

**Files:**
- Modify: `resources/js/Pages/LandingPage.jsx:99-102`

- [ ] **Step 1: Update heading with display font and refined sizing**

Replace lines 99-102:
```jsx
<h1 className={TYPOGRAPHY.heroTitle}>
    {heroContent?.title_line1 || 'Selamat Datang di'} <br />
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">{heroContent?.title_line2 || 'SMA Negeri 1 Baleendah'}</span>
</h1>
```

With:
```jsx
<h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.1] text-white animate-fade-in-up">
    {heroContent?.title_line1 || 'Selamat Datang di'} <br />
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 animate-fade-in-up animation-delay-100">{heroContent?.title_line2 || 'SMA Negeri 1 Baleendah'}</span>
</h1>
```

- [ ] **Step 2: Add animation delay utility to CSS**

Open `resources/css/app.css` and add at the end:

```css
/* Animation delays for staggered entrance */
.animation-delay-100 {
  animation-delay: 100ms;
}

.animation-delay-200 {
  animation-delay: 200ms;
}

.animation-delay-400 {
  animation-delay: 400ms;
}

.animation-delay-600 {
  animation-delay: 600ms;
}

.animation-delay-800 {
  animation-delay: 800ms;
}

.animation-delay-900 {
  animation-delay: 900ms;
}

.animation-delay-1000 {
  animation-delay: 1000ms;
}

/* Radial gradient utility */
.bg-gradient-radial {
  background-image: radial-gradient(circle, var(--tw-gradient-stops));
}
```

- [ ] **Step 3: Test typography changes**

Run: `npm run dev`
Open: `http://localhost:8000`
Expected: Heading uses Playfair Display, larger size, warm gold gradient on school name, fade-in animation

- [ ] **Step 4: Commit typography updates**

```bash
git add resources/js/Pages/LandingPage.jsx resources/css/app.css
git commit -m "feat(hero): upgrade heading typography with display font and gold gradient"
```

---

## Task 5: Update Typography - Body Text and CTAs

**Files:**
- Modify: `resources/js/Pages/LandingPage.jsx:103-119`

- [ ] **Step 1: Update body text styling**

Replace lines 103-105:
```jsx
<p className={`${TYPOGRAPHY.heroText} max-w-lg`}>
    {heroContent?.hero_text || 'Sekolah penggerak prestasi dan inovasi masa depan.'}
</p>
```

With:
```jsx
<p className="text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-100/90 max-w-lg animate-fade-in animation-delay-400">
    {heroContent?.hero_text || 'Sekolah penggerak prestasi dan inovasi masa depan.'}
</p>
```

- [ ] **Step 2: Update CTA container and buttons**

Replace lines 106-119:
```jsx
<div className="flex flex-wrap gap-4 pt-4">
    <Link 
        href="/profil-sekolah" 
        className="px-8 py-3.5 bg-accent-yellow text-gray-900 font-bold rounded-full shadow-lg hover:shadow-xl hover:bg-yellow-400 transition-all"
    >
        Jelajahi Profil
    </Link>
    <Link 
        href="/informasi-spmb" 
        className="px-8 py-3.5 bg-white border-2 border-primary text-primary font-bold rounded-full hover:bg-blue-50 transition-all"
    >
        Info PPDB
    </Link>
</div>
```

With:
```jsx
<div className="flex flex-wrap gap-4 animate-fade-in-up animation-delay-600">
    <Link 
        href="/profil-sekolah" 
        className="px-8 py-3.5 bg-amber-400 text-gray-900 font-bold rounded-full shadow-lg hover:shadow-xl hover:bg-amber-300 hover:scale-[1.02] transition-all duration-300"
    >
        Jelajahi Profil
    </Link>
    <Link 
        href="/informasi-spmb" 
        className="px-8 py-3.5 bg-transparent border-2 border-white/80 text-white font-bold rounded-full hover:bg-white/10 hover:scale-[1.02] transition-all duration-300"
    >
        Info PPDB
    </Link>
</div>
```

- [ ] **Step 3: Test body text and CTA changes**

Run: `npm run dev`
Open: `http://localhost:8000`
Expected: Body text larger and softer, CTAs with warm gold primary and refined ghost secondary, smooth hover effects

- [ ] **Step 4: Commit body text and CTA updates**

```bash
git add resources/js/Pages/LandingPage.jsx
git commit -m "feat(hero): refine body text and CTA styling with animations"
```

---

## Task 6: Update Student Image Container and Sizing

**Files:**
- Modify: `resources/js/Pages/LandingPage.jsx:122-133`

- [ ] **Step 1: Update image container sizing**

Replace line 123:
```jsx
<div className="relative mx-auto max-w-lg md:max-w-none w-full h-[420px] md:h-[480px] lg:h-[540px] flex justify-center items-end">
```

With:
```jsx
<div className="relative mx-auto max-w-lg md:max-w-none w-full h-[420px] md:h-[480px] lg:h-[560px] flex justify-center items-end">
```

- [ ] **Step 2: Update student image with animation and refined shadow**

Replace lines 124-133:
```jsx
{/* Main Image */}
{(heroContent?.student_image_url || heroContent?.studentImage) && (
    <ResponsiveImage 
        src={heroContent?.student_image_url} 
        media={heroContent?.studentImage}
        alt={`Siswa Berprestasi ${siteName}`}
        className="relative z-10 h-[380px] md:h-[440px] lg:h-[500px] w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        loading="eager"
    />
)}
```

With:
```jsx
{/* Main Image with refined shadow and animation */}
{(heroContent?.student_image_url || heroContent?.studentImage) && (
    <div className="animate-fade-in-scale animation-delay-200">
        <ResponsiveImage 
            src={heroContent?.student_image_url} 
            media={heroContent?.studentImage}
            alt={`Siswa Berprestasi ${siteName}`}
            className="relative z-10 h-[400px] md:h-[480px] lg:h-[560px] w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
            loading="eager"
        />
    </div>
)}
```

- [ ] **Step 3: Test image changes**

Run: `npm run dev`
Open: `http://localhost:8000`
Expected: Student image slightly larger, multi-layer shadow for depth, scale-in animation on load

- [ ] **Step 4: Commit image updates**

```bash
git add resources/js/Pages/LandingPage.jsx
git commit -m "feat(hero): enhance student image with refined shadow and animation"
```

---

## Task 7: Update Stat Cards Styling

**Files:**
- Modify: `resources/js/Pages/LandingPage.jsx:135-166`

- [ ] **Step 1: Update stat card container and styling**

Replace lines 152-165:
```jsx
return (
    <div 
        key={idx}
        className={`absolute ${positions[idx % 3]} bg-white/70 backdrop-blur-md border border-white/40 p-4 rounded-xl shadow-lg flex items-center gap-3 max-w-[220px] z-20`}
    >
        <div className={`p-2 rounded-full ${colors[idx % 3]}`}>
            <Icon size={24} fill="currentColor" />
        </div>
        <div>
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            <p className="text-sm font-bold text-gray-900">{stat.value}</p>
        </div>
    </div>
);
```

With:
```jsx
return (
    <div 
        key={idx}
        className={`absolute ${positions[idx % 3]} bg-white/8 backdrop-blur-2xl border border-white/20 ring-1 ring-white/10 p-4 rounded-2xl shadow-2xl shadow-black/20 flex items-center gap-3 max-w-[220px] z-20 hover:scale-105 hover:bg-white/12 transition-all duration-300 animate-fade-in-up`}
        style={{animationDelay: `${800 + idx * 100}ms`}}
    >
        <div className="p-3 rounded-full bg-gradient-to-br from-amber-400/20 to-yellow-300/20">
            <Icon size={24} className="text-amber-300" />
        </div>
        <div>
            <p className="text-xs uppercase tracking-wider text-gray-300 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
        </div>
    </div>
);
```

- [ ] **Step 2: Remove unused colors array**

Delete lines 147-151:
```jsx
const colors = [
    'bg-yellow-100 text-yellow-600',
    'bg-blue-100 text-primary',
    'bg-green-100 text-green-600'
];
```

- [ ] **Step 3: Test stat card changes**

Run: `npm run dev`
Open: `http://localhost:8000`
Expected: Stat cards with refined glassmorphism, warm gold icon backgrounds, staggered fade-in, smooth hover lift

- [ ] **Step 4: Commit stat card updates**

```bash
git add resources/js/Pages/LandingPage.jsx
git commit -m "feat(hero): redesign stat cards with refined glassmorphism and animations"
```

---

## Task 8: Final Testing and Verification

**Files:**
- Test: All hero section changes

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds without errors or warnings

- [ ] **Step 2: Test responsive breakpoints**

Open: `http://localhost:8000`
Test viewports:
- Mobile (375px): Text stacks, image scales, cards reposition
- Tablet (768px): Grid activates, asymmetric layout visible
- Desktop (1280px): Full layout with all animations

Expected: Smooth responsive behavior at all breakpoints

- [ ] **Step 3: Test animations**

Refresh page and observe:
- Heading fades in with stagger (0ms, 100ms)
- Body text fades in (400ms delay)
- CTAs fade in and slide up (600ms delay)
- Student image scales in (200ms delay)
- Stat cards fade in staggered (800ms, 900ms, 1000ms)

Expected: Smooth, orchestrated entrance sequence under 1.5 seconds total

- [ ] **Step 4: Test hover states**

Hover over:
- Primary CTA: Scales to 1.02, shadow increases
- Secondary CTA: Background lightens, scales to 1.02
- Stat cards: Scale to 1.05, background lightens

Expected: Smooth 300ms transitions on all hover states

- [ ] **Step 5: Test cross-browser**

Test in:
- Chrome/Edge (Chromium)
- Firefox
- Safari (if available)

Expected: Consistent rendering and animations across browsers

- [ ] **Step 6: Run LSP diagnostics**

Run: Check for any TypeScript/JSX errors in LandingPage.jsx
Expected: No errors or warnings

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat(hero): complete refined minimalism redesign

- Add Playfair Display font for sophisticated typography
- Implement warm gold gradient accents
- Refine glassmorphism on stat cards
- Add subtle page load animations (fade-in, scale, stagger)
- Update spacing and layout to asymmetric grid
- Enhance student image with multi-layer shadow
- Improve hover states with smooth transitions

Closes #[issue-number]"
```

---

## Verification Checklist

After completing all tasks, verify:

- [ ] **Typography:** Heading uses Playfair Display, school name has warm gold gradient
- [ ] **Colors:** Primary CTA is amber-400, secondary is ghost white, stat cards have refined glassmorphism
- [ ] **Layout:** Asymmetric grid (1.2fr 1fr), bottom-aligned, generous spacing
- [ ] **Animations:** Orchestrated page load sequence, smooth hover states
- [ ] **Student Image:** Larger size, multi-layer shadow, scale-in animation
- [ ] **Stat Cards:** Refined glassmorphism, warm gold icon backgrounds, staggered entrance
- [ ] **Responsive:** Works smoothly on mobile, tablet, desktop
- [ ] **Performance:** No layout shift, animations run at 60fps
- [ ] **Accessibility:** Keyboard navigation works, screen reader friendly
- [ ] **Cross-browser:** Consistent in Chrome, Firefox, Safari

---

## Rollback Plan

If issues arise:

```bash
# Revert all hero changes
git revert HEAD~7..HEAD

# Or reset to before hero work
git reset --hard <commit-before-hero-work>
```

Original hero section preserved in git history at commit before Task 1.

---

## Notes

- All changes are frontend-only, no backend/database modifications
- Content remains dynamic via `heroContent` props from Laravel
- Animations use CSS only (no JS libraries) for performance
- Font loaded via Google Fonts CDN with preconnect for performance
- Tailwind config extended, no custom CSS beyond keyframes and utilities
