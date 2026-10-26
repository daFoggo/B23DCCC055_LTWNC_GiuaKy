# Design system

How `apps/web` looks and behaves: color, type, spacing, responsive layout, components and motion. The visual language
follows [claude.dev](https://claude.dev) (measured on 2026-10-19 at 1440px, 1024px, 768px and 375px). Every value below
was snapped to Tailwind's default scale. Tokens live in `packages/ui/src/styles/globals.css`, components in
`packages/ui/src/components` (shadcn, style `base-lyra`). An illustrated, interactive version of this guide (live
components, logo, motion demos, dashboard demo with the icon rail) lives in [design-system/design-system.html](design-system/design-system.html)
and is published as the "Next Mono Base Design System" artifact (https://claude.ai/artifact/3HTHeDuJCvVQbNCRHM37mC).
When the two disagree, this file wins.

---

## 1. Rules that never bend

1. **Only colors are custom.** Font size, weight, leading, tracking, spacing, border width, radius, duration, easing and
   breakpoints come from Tailwind's default scale. No arbitrary values (`mt-[54px]`, `text-[13px]`, `grid-cols-[auto_1fr]`).
   If no step fits, use the nearest one.
   **One exception: `app/global-error.tsx`.** It uses inline system-color styles (`Canvas`, `CanvasText`) because
   `global-error` replaces the root layout, so global CSS and the theme tokens are not loaded there.
2. **Smallest text is `text-xs`.** Weights are `font-normal` and `font-medium` only.
3. **Components keep their own sizes.** Pick a `size` / `variant` prop (`<Button size="sm">`). Never override height,
   padding or font size through `className`. Layout classes such as `w-full` or `mt-*` are fine. If no size fits, add a
   variant to the component instead of patching the call site.
4. **Dark first, light complete.** `defaultTheme="dark"`, but `:root` (light) and `.dark` both define every token. Never
   style for one theme only.
5. **Root stays 16px.** The rem scale must match Tailwind's.

---

## 2. Color

Defined in `globals.css` and exposed as utilities (`bg-background`, `text-ink-3`, `bg-brand`, ...).

| Token | Light | Dark | Use |
| :---

## 7. Navigation

- Site nav: sticky, `h-24` (`max-sm:h-18`), brand left, links with `[X]` keys in the middle, commands and CTA right.
- Below `xl` (or whenever the links stop fitting) the links move into a **burger panel**: a `size-9` button with three
  2px bars that turn into an X (`aria-expanded`, `aria-controls`). The panel drops under the nav, full width, `bg-background
  border-b`, groups labelled with mono `text-xs` headings, links `font-mono text-sm py-2.5`. It closes on link click, Esc,
  outside click, and when the viewport grows past the breakpoint.
- Between `xl` and `2xl` hide the `[X]` brackets first (keys still work), then fall back to the burger.
- In-page links scroll with an offset equal to the nav height (`scroll-mt-24`); the logo always scrolls to `0` and clears
  the hash, so clicking it twice still works.

---

## 8. Dashboard shell

The app layout extends the same language: the article TOC "tree" becomes the sidebar, the Mods spec list becomes the
inspector. Reference demo: the "Next Mono Base Design System" artifact, section 06.

### Anatomy

Three full-height columns. Each column is a **header cell** plus a scrolling body. All header cells use one shared
component so they always line up and the hairline runs straight across.

```tsx
function ColumnHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex h-14 shrink-0 items-center gap-4 border-b px-4">{children}</div>
}
```

| Column | Header cell | Body |
| :--- | :--- | :--- |
| Sidebar (shadcn `<Sidebar collapsible="offcanvas">`, `w-64`, `xl:w-72`) | Logo + workspace switcher | `px-4 py-6 gap-8`: one labelled **section** per nav group (`WORKSPACE`, `SETTINGS`, ...), then account pinned to the bottom |
| Main (`flex-1 min-w-0`) | Burger + logo (below `md` only), path breadcrumb (`dashboard / settings / account`, no project name), `[B]` `[D]` commands (`[/]` `[I]` when search and inspector exist), `<Button size="sm">` | `px-4 sm:px-8 pt-10 pb-14 gap-8`: page head, metrics, tabs + list |
| Inspector (`w-80`, `border-l`) | Record id + `[ESC]` | `p-6 gap-8`: title, `└` spec list, `└` activity, actions |

Adding another side panel later means adding another column with a `ColumnHeader`; nothing else moves.

Scroll areas hide their scrollbar but stay scrollable (mouse, keys, touch):

```css
@utility no-scrollbar { scrollbar-width: none; &::-webkit-scrollbar { display: none; } }
```

### Sections

The sidebar holds any number of **sections**, each a mono `text-xs` uppercase label over a tree
(`config/navigation.ts`, `NavSection`). Name a section after what its pages are about (`Workspace`, `Settings`,
`Projects`), never after the widget ("Tree", "Menu"). A section whose links the role cannot open is hidden. Inside a
section an entry is a link or a collapsible group of links (two levels max).

Header commands are `[X] LABEL` buttons: mono `text-xs` uppercase, key in `ink-3`, label in `ink-2`, `aria-pressed` for
toggles. Every command has its bare-key shortcut (ignored while typing): `[B]` sidebar (shadcn's Cmd/Ctrl+B also works),
`[D]` theme. The account row shows `└`, a user icon, name and role. Icons are functional only: one per navigable page (and the
account row), never on group headers or menu items; the `└` glyph stays next to them as the hierarchy mark.

Main header below `md` (or while the sidebar is collapsed): burger, wordmark, `/`, current page in ink, truncated
with `…` rather than wrapping.

### Icon rail

The sidebar uses `collapsible="icon"`: `[B]` (or a click on the rail edge) shrinks it from `w-64` to a 48px rail instead of
hiding it, so every page stays one click away.

- Every nav link carries `└`, its icon and its label. In the rail only the icon shows (the glyph and label hide; the
  current page's icon turns brand orange there) and a right-side tooltip names it (`SidebarMenuButton`'s rule: only
  while collapsed on desktop).
- The rail lists individual pages only, never groups: a section label becomes a hairline between sections, a collapsible
  group loses its header and its links show flat (open or closed). The logo is hidden and the account row to
  a user icon whose menu opens to the right.
- Icons are named in `config/navigation.ts` (`NavLink.icon: NavIconName`) and resolved to components in
  `components/layout/nav-icons.tsx` (a `Record`, so a new name without an icon fails typecheck). Names, not components,
  because `entries` cross from a Server Component to the client `NavTree`.
- Rows use `group-data-[collapsible=icon]:*` variants of the sidebar's own `group` wrapper; no JS state except the tooltip.

### Tree items (the large TOC)

| State | Look | Classes |
| :--- | :--- | :--- |
| Default | `└` in ink-4, Tabler icon `size-4` in ink-3, label ink-2 | `font-mono text-sm py-1.5 text-ink-2` |
| Hover | Label ink and nudged 4px right, icon ink-2, hover surface | `hover:bg-accent hover:text-foreground` |
| Current | `└` turns brand orange, icon and label ink, medium | `aria-current="page"`, glyph `text-brand` |
| Group | `└`, label and a caret that rotates when collapsed (no icon); children indent | `aria-expanded`, children `pl-4` |
| Count | Mono, right aligned | `ml-auto text-xs text-ink-3 tabular-nums` |

Keep the tree at most two levels deep; deeper structure belongs on its own page. Keyboard: arrows move, left/right
collapse and expand groups, Enter opens.

### Content conventions

- **Orange appears once per screen**: the current tree glyph (plus at most one focal chart mark).
  identity and does not count. Status uses small
  square dots: ink for "needs review", `diff-del` for blocked, ink-4 for done.
- **No big-number tiles.** Metrics are one `dl` row: mono `text-xs` label, `text-2xl font-medium` value, separated by space.
- **Selected list row is inverted** (`bg-primary text-primary-foreground`); hover is only `bg-accent`.
- **The inspector is context, not a route.** Selecting a row updates it in place.
- **Usage meters are dithered**: solid ink fill over a 2px checker of ink-4.
- One tier denser than marketing pages on the outside only: page top `pt-10` instead of `pt-20`, sections `gap-10`
  instead of `gap-14`; T1 to T4 unchanged.

### Responsive

| Region | < lg | lg to xl | >= xl |
| :--- | :--- | :--- | :--- |
| Sidebar | Hidden below `md` (shadcn's `useIsMobile`, 768px); burger opens it as a left Sheet | `w-64` from `md`; `[B]` collapses it to a 48px icon rail | same |
| Inspector | Right Sheet, full width below `sm` | Right Sheet `w-80` over a scrim | Fixed column, toggled with `[I]` |
| Logo | Main header, next to the burger | Sidebar header | Sidebar header |
| List row | Two lines: title / id, status, time | One line | One line |
| Metrics | `grid-cols-2` | `grid-cols-4` | `grid-cols-4` |
| Header commands | Keys only (`[D]`; `[B]` hidden below `md`, the burger takes over) | Keys and labels from `lg` | Keys and labels |

Needed components: `pnpm dlx shadcn@latest add sidebar sheet badge tabs` (from `apps/web`). shadcn's sidebar width
comes from the `--sidebar-width` variable; change it in the theme rather than with a class.

### Implementation (apps/web)

shadcn files in `packages/ui` are **never edited**, so `shadcn add --overwrite` and future migrations stay clean. The
Next Mono Base look is composed on top in `apps/web/components/layout/`:

**Inspector (implemented):** `components/layout/inspector.tsx` holds `InspectorProvider` (state, `useMediaQuery` for `xl`),
`InspectorCommand` (`[I]`, header) and `InspectorPanel` (a fixed `w-80 border-l` column from `xl`, a right `Sheet` below it,
`[ESC]` closes). The layout fills it with page-specific content.

| Part | File | Built from |
| :--- | :--- | :--- |
| `ColumnHeader` | `column-header.tsx` | Plain `div` (`h-14 border-b px-4`) |
| `AppSidebar`, `AppSidebarBody`, `AppSidebarSection` | `app-sidebar.tsx` | `Sidebar collapsible="offcanvas"`, `SidebarContent` |
| `NavTree` | `nav-tree.tsx`, `nav-icons.tsx` | `SidebarMenu` / `SidebarMenuItem` for structure; its own `Link` row for the tree look; `Tooltip` names the icon in the rail. One per section |
| `SidebarCommand`, `ThemeCommand` | `header-commands.tsx` | `HeaderCommand` button + `hooks/use-hotkey.ts` |
| `UserMenu` | `user-menu.tsx` | `DropdownMenu`; items are passed as children (sign out comes from `features/auth`) |
| `DashboardBreadcrumb` | `dashboard-breadcrumb.tsx` | `Breadcrumb`; segments from the URL, index pages append their nav title |
| `PageHead`, `Metrics`, `SpecList` | `page-head.tsx`, `components/shared/` | Plain markup |
| `InfoHint` | `components/shared/info-hint.tsx` | `Popover` + ghost `icon-xs` `Button`; copy comes from `config/help.ts` (also read by the Guide page). `PageHead`, `Metric` and section titles take a `hint` key |
| `ResponsiveDialog` | `components/shared/responsive-dialog.tsx` | `Dialog` from `md` up, bottom `Drawer` below (shadcn "Responsive Dialog"); `size` `md` or `lg`; `DialogActions` for the button row. Use it for every form that opens over a page; `AlertDialog` stays for confirmations |

Two consequences of not editing shadcn: the sidebar switches to a Sheet below `md` (768px, hard-coded in shadcn's hook)
instead of `lg`, and keeps one width (`16rem`); `xl:w-72` would need an arbitrary value. The inspector column is not built
yet: add it with a `ColumnHeader` when the first list feature needs it.

---

## 9. Motion

Tailwind durations and easings only: `ease-out` to enter, `ease-in-out` to leave.

| Interaction | Classes |
| :--- | :--- |
| Color change (links, tabs, rows) | `transition-colors duration-150` |
| Small movement (arrow, TOC item) | `transition-transform duration-200 ease-out`, `translate-x-1` |
| Dropdown caret | `rotate-180 duration-300` |
| Reveal on enter | `tw-animate-css` fade/slide, `duration-500`/`700`, stagger `delay-75` steps |
| Theme switch | Instant (`disableTransitionOnChange`) |

Everything must respect `prefers-reduced-motion` (`motion-safe:` / `motion-reduce:`).

Applied in `apps/web`:

| Pattern | Where | Implementation |
| :--- | :--- | :--- |
| Stagger on enter (slide up 8px, `duration-500`, `delay-75` steps) | Dashboard body, auth form column | `components/shared/stagger.tsx` (direct children, `*:nth-N:delay-*`). Plays once per element: Cache Components hides visited routes with `display: none` and a CSS animation restarts when its element is shown again, so each child switches its animation off when it ends (`onAnimationEnd`) and going back is instant |
| Terminal lines reveal in order | Auth rail | `app/(auth)/_components/terminal.tsx` (`step` prop) |
| Burger bars turn into an X (`duration-300 ease-out`) | Dashboard header below `md` | `components/layout/burger.tsx` |
| TOC nudge (`translate-x-1`, `duration-200`) | Sidebar nav rows | `NavTree` `RowLabel` |
| Arrow slides on hover (`translate-x-1`) | Auth switch link, 403 CTA | `group-hover` on the icon |
| Caret rotates (`duration-300`) | Collapsible nav group | `NavTree` `TreeGroup` |


Not used: the typing intro and ambient float (no custom keyframes), and the theme switch
stays instant.

---

## 10. Accessibility

- Focus: visible `outline` with `outline-offset-2`; never remove it without a replacement.
- `ink-4` is decorative; readable text uses `ink-3` or stronger. Orange text uses `brand-ink`.
- Anchor targets sit below the sticky nav: give them `scroll-mt-24` (`max-sm:scroll-mt-18`).
- `::selection` uses `bg-brand text-background`.
