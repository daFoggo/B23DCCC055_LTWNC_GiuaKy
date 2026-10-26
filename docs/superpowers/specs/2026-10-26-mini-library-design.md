# Mini Library: design

Status: draft, awaiting approval. Size: a project.

## Intent

The midterm brief (LTWNC) asks for "Mini Library": a book lookup and borrow/return app for students. The grading is mostly technical: TypeScript generics and type guards, Redux Toolkit with a hand-written middleware, Zustand, Context, a generic `useDebounce`, memoisation, lazy loading, and tests. The brief is delivered inside this repo's `apps/web`, in the existing dashboard, so the work must use the existing shell, design system and conventions wherever the brief does not force otherwise.

## Goals

- All 9 functional requirements of the brief work end to end (list, search with 300ms debounce, category filter, borrow, return, 3-book limit with warning, light/dark toggle, stats page, loading and error states for the 500ms fake API).
- All 8 technical requirements of the brief are visibly satisfied and easy to find (types, RTK slice and thunk, middleware, Zustand filter store, Context theme with `useTheme`, `useDebounce<T>`, memo/useMemo/useCallback/lazy, tests).
- Existing `(auth)` and `(dashboard)` layouts and real auth keep working.
- `pnpm check` and `pnpm build` pass; the flows are exercised in the running app.

## Non-goals

- No real backend, no database, no persistence: borrow state lives in Redux and resets on reload.
- No book detail page, no admin/CRUD, no multi-student accounts.
- No removal of existing auth or dashboard code.
- No extraction into `packages/`.

## Anti-goals

- Passing the grading checklist while breaking the repo's lint boundaries, `pnpm check` or the existing sign-in flow.
- A demo login that could work in production or grant more than the customer role.

## Constraints

- Next.js in this repo is not the one in training data: read `node_modules/next/dist/docs/` before writing Next code. Wrap runtime APIs in `<Suspense>` (Cache Components on).
- ESLint boundaries: `features/` never import `app/` or other features; `features/*/components` cannot import server/query/DAL modules. `--max-warnings 0`.
- Design system: tokens only, no arbitrary Tailwind values, sizes via props (`docs/design-system.md`, `.agents/skills/design-system/SKILL.md`). Dark and light must both work.
- `noUncheckedIndexedAccess` is on; no `any` anywhere in the feature.
- Commits only when the user asks; Conventional Commits.

## Approaches considered

1. **A. Slice `features/library` inside `apps/web`, mounted in the dashboard shell (chosen).** Reuses sidebar, header, breadcrumb and tokens; real per-user context via the session. Cost: Redux and a DOM test setup are added to `apps/web`, a deviation from `docs/client-state.md` (one Zustand store per feature) that this design accepts because the brief requires Redux and Zustand together; `/dashboard` replaces the overview page.
2. B. New standalone app `apps/library`. Matches the brief's file paths literally and leaves `apps/web` untouched, but duplicates scaffolding and the user explicitly wants this inside web.
3. C. Client-only SPA inside `apps/web`. Breaks nearly all conventions for no benefit.

Where to mount, decided with the user: the library UI goes in the dashboard (`/dashboard`, `/dashboard/stats`), and a **Demo login** on the sign-in page replaces the need for real auth credentials.

## Design

### Business and flows

One student (the signed-in demo user) browses ~12 seed books, each with title, author, category (CNTT / Kinh tế / Ngoại ngữ), year and copies left. Borrow decrements copies, Return increments them. At most 3 books borrowed at once; a fourth attempt is blocked and a warning shows. Stats page shows books per category and number currently borrowed.

### Layout

Inside the dashboard shell (sidebar, header with the existing theme command).
- Sidebar nav: "Thư viện" (`/dashboard`) and "Thống kê" (`/dashboard/stats`); new `NavIconName` values added.
- `/dashboard`: toolbar (search input, category filter as `Tabs`/`ToggleGroup`, theme toggle) over a responsive grid of `BookCard`s; a "Đang mượn (n/3)" panel with a Return button per book (beside the grid on large screens, stacked on small).
- States: skeleton or "Đang tải..." while loading; an `Alert` with message and Retry on failure; `Empty` when the filter matches nothing.
- `/dashboard/stats`: cards for count per category and borrowed count; the view is `React.lazy` + `Suspense`.
- UI copy in Vietnamese. Warning for the limit shown with the toast/alert component already in `@workspace/ui`.

### Code layout (`apps/web/features/library/`)

Only the files needed; no barrel files.
- `types.ts`: `Category`, `FilterCategory = "all" | Category`, `Book`, `ApiResult<T> = { ok: true; data: T } | { ok: false; error: string }`, with `isOk` / `isErr` type guards. At least two utility types used for real (for example `Pick<Book, ...>` for the card props, `Record<Category, number>` for stats, `Readonly`, `Partial` for API options).
- `api/booksApi.ts`: `fetchBooks(options?: { fail?: boolean }): Promise<ApiResult<Book[]>>`, `setTimeout` 500ms, plus the seed data. (The brief says `src/api/booksApi.ts`; there is no `src/` in this repo, so this is the equivalent location.)
- `store/`: `booksSlice` (items, `status: idle | loading | succeeded | failed`, `error`; `fetchBooks` via `createAsyncThunk` with pending/fulfilled/rejected; reducers `borrowBook(id)`, `returnBook(id)`), borrowed ids in the same or a sibling slice, `borrowLimitMiddleware` (intercepts `borrowBook` when 3 are already borrowed, does not forward it, dispatches a rejection action that sets the warning), `makeStore`, typed `useAppDispatch` / `useAppSelector`. Reducers also refuse to borrow a book with 0 copies or already borrowed.
- `filter-store.ts`: Zustand factory `createFilterStore` (query, category) plus a provider, per `docs/client-state.md` (never a module-level store), selectors or `useShallow`.
- `theme/`: `ThemeContext` provider with `useMemo` value and the custom `useTheme` hook, reading and setting through `next-themes` so the existing header command and the new toggle stay in sync.
- `hooks/use-debounce.ts`: `useDebounce<T>(value: T, delay = 300): T`.
- `components/`: `BookCard` (`React.memo`, key by id), `BookList`, `SearchBox`, `CategoryFilter`, `BorrowedPanel`, `ThemeToggle`, `StatsView`, and a client `LibraryProviders` (Redux `Provider` with a per-mount store via `useState`, filter store provider, theme provider), mounted from a layout under `app/(dashboard)/dashboard/`.
- Derived data: filtered list via `useMemo` (query lowercase match on title or author, plus category); handlers via `useCallback`.
- `__tests__/`: ≥4 `booksSlice` reducer tests; ≥3 `BookCard` tests with Testing Library and `userEvent` (shows data, click Borrow calls handler with the right id, button disabled at 0 copies); 1 `useDebounce` test with fake timers; plus middleware tests (limit blocks the 4th borrow) since it is a graded piece.

### Demo login

Narrowest seam, inside `apps/web` only (no `packages/` change):
- Sign-in page gets a "Demo login" button with its own server action.
- A server action sets an HttpOnly, SameSite=Lax, short-lived cookie (Secure in production) holding `{ sub, role: "customer", exp }` signed with HMAC-SHA256 (Web Crypto) using a dedicated secret; compared in constant time; fails closed when the secret is missing.
- `lib/auth.ts` `getAuthProvider` returns a demo provider when the demo cookie is valid, otherwise delegates to the real provider; `proxy.ts` treats a valid demo cookie as authenticated; sign-out also clears the demo cookie.
- Gated by a server-only env flag (declared in `turbo.json` and `.env.example`), checked inside the action; hiding the button is only cosmetic. Role is always `customer`; the cookie name differs from real session cookies.
- The demo session has no backend access token; the library never calls a backend, which is fine.

### Verification

`pnpm check`, `pnpm build`, then in the running app: demo login, load with 500ms delay, forced API failure, search debounce, filter, borrow until the limit warning, return, theme toggle, `/dashboard/stats`, real sign-in page and sign-out still behave.

## Decided by me (check these)

- Tests use Vitest with `@testing-library/react`, `@testing-library/user-event` and jsdom, not Jest: the repo already has Vitest and a second runner is against `CONTRIBUTING.md`; the API is Jest-compatible and `pnpm test` / `npm test` run it. Say if Jest is mandatory.
- Routes are `/dashboard` and `/dashboard/stats`, not `/stats`. No rewrite unless asked.
- `/dashboard` overview page and its inspector content are replaced by the library.
- Theme Context sits on top of `next-themes` instead of replacing it.
- API location `features/library/api/booksApi.ts` instead of `src/api/booksApi.ts`.
- Seed data of ~12 Vietnamese-context books, 3 to 4 per category, a couple with 0 copies.

- Demo auth must work with no Postgres or Supabase running (a grader may run the app locally without them). So the demo cookie is checked **before** any call into the real provider, in `proxy.ts` and `lib/auth.ts`; a valid demo cookie short-circuits `updateSession`. It is enabled only when `DEMO_AUTH=true` (server env, declared in `turbo.json` and set in `.env.example` for local runs); with the flag unset the action refuses and the cookie is ignored. Deployments that must not expose it leave the flag unset.
- The original brief is saved next to this doc as `2026-10-26-mini-library-brief.md`; it is the source for every requirement, including test minimums.
- Keep `/dashboard/library`? No: the library replaces the overview at `/dashboard` as decided with the user.

## Left to the builder

Exact seed titles, visual details within design-system rules, file names beyond the above, how the limit warning is surfaced (toast vs inline alert), nav icon choices, the demo cookie's TTL and secret env names.
