# JAXIS StatLab — Agent & Developer Rules

All AI coding assistants and developers working in this workspace must strictly follow these rules:

## 1. Iconography & Visual Standard (CRITICAL)
- **Mandatory Icon Library**: Use **Tabler Icons (`@tabler/icons-react`) exclusively** across `@repo/ui` and `apps/app`.
- **Zero Emojis Policy**: Emojis (e.g. 🔍, ⏸, ⛔, 📋, 🚀, 💡, 📁, 📄, 🔒) are **strictly forbidden** anywhere in the UI, labels, menus, tables, buttons, or toasts.
- **No Ad-Hoc Raw SVGs**: When an icon is needed, always import the appropriate `Icon*` component from `@tabler/icons-react`.
- **Styling**: Use `stroke={1.5}` or `stroke={2}`, specify `size={16|18|20|24}`, and use Tailwind classes for colors.

## 2. Design Archetype & Color Palette
- **Aesthetic**: Tactical Telemetry / Industrial Precision Brutalism.
- **Palette**: Dark Navy (`#010114`, `#011B38`), Enterprise Amber/Orange (`#CC6600`), Analytical Sky (`#38BDF8`), Verification Emerald (`#10B981`), Border (`rgba(255, 255, 255, 0.08)`).
- **Zero Glow Policy**: Never use blurred box-shadow glows. Use crisp flat borders and opacity tints.
- **Terminology**: Never use "Principal Investigator" / "Investigator" — use **"Lead Researcher"** and **"Research Study"**.

## 3. Monorepo Architecture
- Shared UI components belong in `packages/ui` and must be exported from `packages/ui/src/index.ts`.
- `apps/app` uses Next.js 16 (Turbopack, Tailwind CSS v4, React 19).
- Run `npm run check-types --workspace=app` and `npm run lint --workspace=app` to verify all changes.
