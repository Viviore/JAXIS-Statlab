# JAXIS StatLab — Agent & Developer Rules

This root configuration points to the detailed rules defined in [.agents/AGENTS.md](file:///c:/Users/ROG%20STRIX/Desktop/JAXIS%20StatLab/.agents/AGENTS.md) and the canonical design system in [apps/app/docs/design-system.md](file:///c:/Users/ROG%20STRIX/Desktop/JAXIS%20StatLab/apps/app/docs/design-system.md).

All AI coding assistants and developers MUST inspect and strictly follow [.agents/AGENTS.md](file:///c:/Users/ROG%20STRIX/Desktop/JAXIS%20StatLab/.agents/AGENTS.md) and [apps/app/docs/design-system.md](file:///c:/Users/ROG%20STRIX/Desktop/JAXIS%20StatLab/apps/app/docs/design-system.md) when working in this workspace.

### Core Non-Negotiable Directives:
1. **Follow [design-system.md](file:///c:/Users/ROG%20STRIX/Desktop/JAXIS%20StatLab/apps/app/docs/design-system.md) strictly for all UI.**
2. **Anti-Double-Padding Layout Standard**: Inner dashboard pages must use `flex flex-col gap-8 max-w-7xl mx-auto pb-24 w-full animate-content-fade` without adding redundant outer horizontal padding (the shell handles viewport gutters).
3. **Orbital Loading States**: Always use `<LoadingState variant="page" | "table" | "card" | "inline" />` with high-precision orbital sweep gauge. Zero clunky boxes or pinging blobs.
4. **Button & Dropdown Styling**: Precision `rounded-[2px]`, Title Case copy, centered high-contrast loader spinner, and zero hover/focus rings on dropdown items.
5. **Tabler Icons Exclusively**: No emojis anywhere, no ad-hoc raw SVGs.
6. **Sans-Serif First**: Use `font-sans` for readable content. Reserve `font-mono` strictly for IDs and metrics.
7. **Zero Double Slashes**: Never use `//` in copy or loading states.
8. **Toast Notification Protocol**: Trigger standard toasts on server action mutations, 1-click clipboard copies, and file operations.
9. **Canonical KPI Cards**: All metric and telemetry cards must exclusively use `<KpiCard />` from `@repo/ui` with uppercase mono labels (`text-xs font-mono text-white/50 tracking-wider font-semibold`), bold mono metrics (`font-mono font-bold text-2xl sm:text-3xl`), unit suffixes (`text-xs text-white/40 font-mono`), and sans-serif descriptions (`text-xs font-sans text-white/50`). Zero ad-hoc raw cards or divergent typography.
