---
version: "alpha"
name: "Estilo de Inteligência Generativa"
description: "Futuristic and minimalist landing page for a next-gen language model. Ideal for landing pages, modern websites. AI-ready template."
colors:
  primary: "#00A67E"
  secondary: "#FFFFFF"
  tertiary: "#202124"
  neutral: "#F0F0F0"
  surface: "#00FF00"
  accent: "#800080"
typography:
  h1:
    fontFamily: Inter
    fontSize: 2.5rem
    fontWeight: 700
  body-md:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: 400
rounded:
  sm: 8px
  md: 16px
  lg: 24px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
    padding: 12px
---

## Overview

Futuristic and minimalist landing page for a next-gen language model. Ideal for landing pages, modern websites. AI-ready template. The visual language of generative AI didn't emerge from design theory. It emerged from a text box. OpenAI's ChatGPT launched with what was essentially a messaging app — and that single decision collapsed an entire category into one interaction pattern. Anthropic followed with Claude, Google with Gemini, and suddenly every AI product looked like a chat window with a blinking cursor. The monospace type, the streaming tokens, the subtle pulse animations — all of it became shorthand for 'intelligence happening here.'

What's interesting is how this aesthetic handles uncertainty. Traditional interfaces promise deterministic outcomes. Click this, get that. Generative interfaces can't make that promise. The output is probabilistic, sometimes wrong, occasionally brilliant. So the visual language evolved to communicate process over result — skeleton loaders that feel like thinking, token-by-token rendering that mimics cognition, confidence indicators that admit fallibility.

Designing for unpredictable outputs requires a fundamental shift. You're not laying out content — you're building containers for content that doesn't exist yet, in lengths you can't predict, with quality you can't guarantee. The best generative interfaces embrace this tension rather than hiding it.

- Density: 3/10 — Airy
- Variance: 3/10 — Restrained
- Motion: 4/10 — Subtle

- **Style:** Futuristic, Minimalist, Intelligent
- **Keywords:** AI, generative AI, language models, API, developer, ethical AI, futuristic, minimalist, intelligent, powerful
- **Era:** 2026+ AGI Era
- **Light/Dark:** ✓ Full / ✗ No (com opções de tema)

## Colors

- **Azul IA** (#00A67E) — Accent highlight, links and focus states
- **Branco** (#FFFFFF) — Light surface, card backgrounds
- **Cinza Escuro** (#202124) — Dark surface, primary background
- **Cinza Claro** (#F0F0F0) — Secondary text, borders, muted elements
- **Verde Elétrico** (#00FF00) — Success states, positive indicators
- **Roxo** (#800080) — Accent color, emphasis elements
- **Ciano** (#00FFFF) — Extended palette, decorative use
- **Preto** (#000000) — Deep contrast surface


## Typography

- **Display / Hero:** Inter — Weight 700, tight tracking, used for headline impact
- **Body:** Inter — Weight 400, 16px/1.6 line-height, max 72ch per line
- **UI Labels / Captions:** Inter — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** JetBrains Mono — Used for code, metadata, and technical values

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem


## Layout

- **Grid:** CSS Grid primary. Max-width containment: 1280px centered with 1.5rem side padding.
- **Spacing rhythm:** Balanced. Base unit: 0.5rem (8px).
- **Section vertical gaps:** clamp(4rem, 8vw, 8rem).
- **Hero layout:** Split-screen (text left, visual right).
- **Feature sections:** Zig-zag alternating text+image rows. No 3-equal-columns.
- **Mobile collapse:** All multi-column layouts collapse below 768px. No horizontal overflow.
- **z-index contract:** base (0) / sticky-nav (100) / overlay (200) / modal (300) / toast (500).


## Elevation & Depth

Animações de geração de texto/código, visualizações de redes neurais abstratas, brilhos sutis em elementos de IA, tipografia limpa e moderna (sans-serif), micro-interações de feedback de IA, elementos modulares, animações de fluxo de dados.

- **Physics:** Ease-out curves, 200-300ms duration. Smooth and predictable.
- **Entry animations:** Fade + translate-Y (16px → 0) over 420ms ease-out. Staggered cascades for lists: 80ms between items.
- **Hover states:** Subtle color shift + shadow adjustment over 200ms.
- **Page transitions:** Fade only (200ms).
- **Performance:** Only transform and opacity animated. No layout-triggering properties.


## Shapes

Base corner radius: 8px. See rounded tokens in front matter for the full scale.


## Components

- **Primary Button:** Rounded (8px) shape. Accent color fill. Hover: 8% darken + subtle lift shadow. Active: -1px translate tactile press. Font weight 600. No outer glows.
- **Secondary / Ghost Button:** Outline variant. 1.5px border in muted color. Text in primary color. Hover: subtle background fill.
- **Cards:** Rounded (8px) corners. Surface background. Subtle shadow (0 2px 12px rgba(0,0,0,0.06)). 1px border stroke.
- **Inputs:** Label above input. 1px border stroke. Focus ring: 2px accent color offset 2px. Error text below in semantic red. No floating labels.
- **Navigation:** Primary surface background. Active item: accent color indicator. Font weight 500 when active.
- **Skeletons:** Shimmer animation matching component dimensions. No circular spinners.
- **Empty States:** Icon-based composition with descriptive text and action button.


## Do's and Don'ts

- No emojis in UI — use icon system only (Lucide, Heroicons)
- No decorative gradients — flat color only
- No shadows heavier than 0 2px 8px rgba(0,0,0,0.08)
- No pure black (#000000) — use off-black or charcoal variants
- No oversaturated accent colors (saturation cap: 80%)
- No 3-column equal-width feature layouts — use zig-zag or asymmetric grid
- No `h-screen` — use `min-h-[100dvh]`
- No AI copywriting clichés: "Elevate", "Seamless", "Unleash", "Next-Gen"
- No broken external image links — use picsum.photos or inline SVG
- No generic lorem ipsum in demos

- Do Animações de geração de texto/código
- Do Visualizações de redes neurais
- Do Brilhos de IA
- Do Tipografia moderna
- Do Micro-interações de feedback de IA
- Do Foco em IA geral.


## Use Case

Landing pages, Modern websites

<!-- Source: https://designmd.app/library/estilo-de-inteligencia-generativa · designmd.app -->
