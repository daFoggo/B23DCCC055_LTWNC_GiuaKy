# Mini Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Deadline mode:** no per-task reviewer gates; one final whole-branch review in Task 5.

**Goal:** Ship the LTWNC "Mini Library" brief (lookup, borrow/return with a 3-book limit, theme toggle, stats) inside the `apps/web` dashboard plus a minimal gated Demo login, with `pnpm check` and `pnpm build` green.

**Architecture:** One slice `apps/web/features/library/` (types, fake API, Redux Toolkit slice + hand-written middleware, Zustand filter store, Context theme over `next-themes`, client components) composed from `app/(dashboard)/dashboard/` (a layout mounting client providers, `/dashboard` and `/dashboard/stats`). Demo login is an HMAC-signed cookie checked in `proxy.ts` and `lib/auth.ts` before the real provider, so it works with no Postgres/Supabase.

**Tech Stack:** Next.js 16.4.2 (Cache Components), React 19.3, `@reduxjs/toolkit`, `react-redux`, `zustand` 5 (installed), `next-themes`, `@workspace/ui`, Vitest 5 + `@testing-library/react` + `@testing-library/user-event` + `@testing-library/jest-dom` + `jsdom`, Web Crypto.

**Spec:** `docs/superpowers/specs/2026-10-26-mini-library-design.md`; requirements source `docs/superpowers/specs/2026-10-26-mini-library-brief.md`. Read both first.

## Global Constraints

- Every task leaves `pnpm --filter web typecheck`, `lint` (`--max-warnings 0`) and `test` green.
- No `any`; `noUncheckedIndexedAccess` is on.
- ESLint boundaries: `features/` never imports `app/` or another feature; relative imports inside a feature; `features/*/components/**` never imports `server*`, `queries`, `@/lib/dal|http|auth|env`. No barrel files.
- Design system: tokens only, no arbitrary Tailwind values (`-[`), no hex, no `dark:` color pairs, shadcn sizes via `size`/`variant` props, smallest text `text-xs`; both themes work.
- UI copy Vietnamese. Categories exactly `"CNTT" | "Kinh tế" | "Ngoại ngữ"`; filter labels `Tất cả / CNTT / Kinh tế / Ngoại ngữ`.
- API delay `500` ms; debounce `300` ms; borrow limit `3`.
- No module-level Redux or Zustand store; create per mount with `useState(() => ...)`.
- Next code: read `apps/web/node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md` first. `React.lazy` at module top level of a `"use client"` file; a client component using `useSearchParams` sits under `<Suspense>`.
- Demo login: role always `customer`; active only when `DEMO_AUTH=true` and `DEMO_AUTH_SECRET` has ≥ 32 chars, else the action refuses and the cookie is ignored.
- Tests: exactly the brief's minimums (≥4 reducer, ≥3 BookCard, 1 useDebounce) plus 1 middleware test. No e2e, no extra docs.
- Commits: Conventional Commits, no co-author lines, **only if the user asks**.

## Review Focus

1. Borrow on the last copy twice, or on a book already borrowed: `copiesLeft` never < 0, no duplicate ids (pinned in a Task 2 reducer test).
2. Return of a book not borrowed: no-op; `copiesLeft` never > `totalCopies` (pinned in a Task 2 reducer test).
3. Search `"  NGUYỄN "`: trimmed, case-insensitive on title or author; whitespace-only shows all (final review + Task 5 manual step).
4. Retry after failure ends `succeeded` with `error: null`; a return clears the limit warning (Task 5 manual step).
5. Tampered/expired/wrong-secret demo cookie, or `DEMO_AUTH` unset: signed out (Task 5 manual step; `verifyDemoToken` never throws).

## Parallelism

| Wave | Tasks |
| :--- | :--- |
| 1 | Task 1 (only task that touches `package.json` / lockfile) |
| 2 | Task 2 and Task 3 in parallel (disjoint files) |
| 3 | Task 4 (needs 2; may overlap the tail of 3, no shared files) |
| 4 | Task 5 |

---

### Task 1: Dependencies, DOM test setup, `useDebounce<T>`

**Files:** Modify `apps/web/package.json` (via pnpm), `apps/web/vitest.config.ts`; Create `apps/web/vitest.setup.ts`, `apps/web/features/library/hooks/use-debounce.ts`; Test `apps/web/features/library/__tests__/use-debounce.test.tsx`.

**Interfaces:** Produces `useDebounce<T>(value: T, delay = 300): T` (`"use client"`). DOM tests start with `// @vitest-environment jsdom` and call `afterEach(cleanup)` (config stays `environment: "node"`, globals off); jest-dom matchers available everywhere.

- [ ] **Step 1:** `pnpm --filter web add @reduxjs/toolkit react-redux` and `pnpm --filter web add -D @testing-library/react @testing-library/dom @testing-library/user-event @testing-library/jest-dom jsdom`. Expected: no peer errors against React 19.3.
- [ ] **Step 2:** `vitest.setup.ts` = `import "@testing-library/jest-dom/vitest"`; add `setupFiles: ["./vitest.setup.ts"]` in `test`, everything else unchanged.
- [ ] **Step 3: Failing test** (fake timers)

```ts
it("returns the latest value only after 300ms", () => {
  const { result, rerender } = renderHook(({ v }) => useDebounce(v, 300), { initialProps: { v: "a" } })
  rerender({ v: "ab" }); act(() => vi.advanceTimersByTime(200))
  rerender({ v: "abc" }); act(() => vi.advanceTimersByTime(299))
  expect(result.current).toBe("a")
  act(() => vi.advanceTimersByTime(1))
  expect(result.current).toBe("abc")
})
```

- [ ] **Step 4:** `pnpm --filter web exec vitest run features/library/__tests__/use-debounce.test.tsx` → FAIL (module missing).
- [ ] **Step 5:** Implement with `useState` + `useEffect` (`setTimeout`, cleared in cleanup).
- [ ] **Step 6:** `pnpm --filter web test`, `typecheck`, `lint` → PASS (existing node tests included).
- [ ] **Step 7: Commit (only if user asks)** `chore(web): add dom test setup and useDebounce`

---

### Task 2: Library core: types, fake API, Redux, Zustand, theme Context

**Files:** Create under `apps/web/features/library/`: `types.ts`, `api/booksApi.ts` (brief's name; no `src/` here), `selectors.ts`, `store/books-slice.ts`, `store/borrow-limit-middleware.ts`, `store/store.ts`, `store/hooks.ts`, `filter-store.ts`, `components/filter-store-provider.tsx`, `theme/theme-context.tsx`. Test: `__tests__/books-slice.test.ts`.

**Interfaces (Produces):**
- `types.ts`: `CATEGORIES = ["CNTT", "Kinh tế", "Ngoại ngữ"] as const`; `Category`; `FilterCategory = "all" | Category`; `Book = Readonly<{ id: string; title: string; author: string; category: Category; year: number; copiesLeft: number; totalCopies: number }>`; `ApiResult<T> = { ok: true; data: T } | { ok: false; error: string }`; guards `isOk<T>`, `isErr<T>`, `isFilterCategory(v: unknown): v is FilterCategory`; `FetchBooksOptions = Partial<{ fail: boolean; delayMs: number }>`; `CategoryCounts = Record<Category, number>`; `BookCardData = Pick<Book, "id" | "title" | "author" | "category" | "year" | "copiesLeft">`.
- `api/booksApi.ts`: `SEED_BOOKS: readonly Book[]` (12 books, 4 per category, ids `"b1"`..`"b12"`, ≥2 with `copiesLeft: 0`, `copiesLeft <= totalCopies`); `fetchBooks(options?: FetchBooksOptions): Promise<ApiResult<Book[]>>` — `setTimeout` `options.delayMs ?? 500`; `fail` resolves `{ ok: false, error: "Không thể tải danh sách sách. Vui lòng thử lại." }`; success returns a copy of the seed.
- `selectors.ts`: `filterBooks(books: readonly Book[], query: string, category: FilterCategory): Book[]` (`trim().toLocaleLowerCase("vi")`, `includes` on title or author); `countByCategory(books: readonly Book[]): CategoryCounts` (all three keys, zero included).
- `store/books-slice.ts`: `BORROW_LIMIT = 3`; `BORROW_LIMIT_WARNING = "Bạn chỉ được mượn tối đa 3 cuốn cùng lúc."`; `BooksState = { items: Book[]; status: "idle" | "loading" | "succeeded" | "failed"; error: string | null; borrowedIds: string[]; warning: string | null }`; `fetchBooks = createAsyncThunk<Book[], FetchBooksOptions | undefined, { rejectValue: string }>("books/fetch", ...)` (`rejectWithValue(result.error)` on `isErr`); actions `borrowBook(id)`, `returnBook(id)`, `borrowRejected(message)`, `dismissWarning()`; `booksReducer`.
  - pending → `loading`, `error null`; fulfilled → items, `succeeded`; rejected → `failed`, `error = payload ?? error.message ?? "Lỗi không xác định"`.
  - `borrowBook`: no-op if unknown id, already borrowed, or `copiesLeft === 0`; else `-1`, push id, `warning = null`. `returnBook`: no-op unless borrowed; else `+1` capped at `totalCopies`, remove id, `warning = null`.
- `store/borrow-limit-middleware.ts`: `borrowLimitMiddleware: Middleware<object, { books: BooksState }>` — on `borrowBook.match(action)` with `borrowedIds.length >= BORROW_LIMIT`: does not call `next`, dispatches `borrowRejected(BORROW_LIMIT_WARNING)`.
- `store/store.ts`: `makeStore(preloadedState?: { books: BooksState })` with `.concat(borrowLimitMiddleware)`; `AppStore`, `RootState`, `AppDispatch`. `store/hooks.ts`: `useAppDispatch = useDispatch.withTypes<AppDispatch>()`, `useAppSelector = useSelector.withTypes<RootState>()`.
- `filter-store.ts` (per `docs/client-state.md` §3): `FilterState = { query: string; category: FilterCategory }`, actions `setQuery`, `setCategory`, `reset`; `createFilterStore(init = { query: "", category: "all" })` via `createStore<FilterStore>()` from `zustand/vanilla`. `components/filter-store-provider.tsx`: `FilterStoreProvider`, `useFilterStore<T>(selector)` (throws outside provider; one selector per value).
- `theme/theme-context.tsx` (`"use client"`): `LibraryThemeProvider` reading `resolvedTheme`/`setTheme` from `next-themes` (import `useTheme as useNextTheme`), value `{ theme: "light" | "dark"; toggleTheme(): void }` via `useMemo`, `toggleTheme` via `useCallback`; `useTheme()` throws outside the provider.

- [ ] **Step 1: Failing tests** in `books-slice.test.ts` (node env):

```ts
it("fetchBooks.pending/fulfilled/rejected set status, items and error", ...)  // rejected payload "boom" -> error "boom", status "failed"
it("borrowBook decrements copiesLeft and records the id", ...)
it("borrowBook is a no-op at 0 copies or when already borrowed", ...)       // Review Focus 1
it("returnBook restores the copy; a return of a non-borrowed book changes nothing", ...) // Review Focus 2
it("middleware blocks the 4th borrow and sets the warning", ...)            // via makeStore(preloaded): borrowedIds stays 3, 4th copiesLeft unchanged, warning === BORROW_LIMIT_WARNING
```

- [ ] **Step 2:** `pnpm --filter web exec vitest run features/library/__tests__/books-slice.test.ts` → FAIL.
- [ ] **Step 3:** Implement all files per the Interfaces.
- [ ] **Step 4:** Same command → PASS; `typecheck`, `lint` → PASS.
- [ ] **Step 5: Commit (only if user asks)** `feat(library): add types, fake api, redux store, filter store and theme context`

---

### Task 3: Minimal demo login (parallel with Task 2)

**Files:** Create `apps/web/lib/demo-session.ts` (no `server-only`, no `next/headers`: `proxy.ts` imports it), `apps/web/features/auth/components/demo-sign-in-button.tsx`; Modify `apps/web/lib/auth.ts:17-19`, `apps/web/proxy.ts:18-23`, `apps/web/features/auth/actions.ts` (append), `apps/web/app/(auth)/sign-in/page.tsx:73-79`, `turbo.json` (`tasks.build.env`), `apps/web/.env.example`.

**Interfaces (Produces):**
- `lib/demo-session.ts`: `DEMO_COOKIE = "nmb-web-demo"`, `DEMO_TTL_SECONDS = 7200`; `DemoClaims = { sub: string; role: "customer"; exp: number }`; `demoAuthSecret(): string | null` (`DEMO_AUTH === "true"` and secret length ≥ 32); `createDemoToken(secret: string): Promise<string>` (`base64url(JSON {sub:"demo-student",role:"customer",exp}) + "." + base64url(HMAC-SHA256)`); `verifyDemoToken(token: string | undefined, secret: string): Promise<DemoClaims | null>` (`crypto.subtle.verify`, reject expired / `role !== "customer"` / bad shape, never throws); `readDemoSession(token): Promise<DemoClaims | null>` (null when `demoAuthSecret()` is null).
- `lib/auth.ts` `getAuthProvider()`: reads `DEMO_COOKIE` via `cookies()`; valid → demo `AuthProvider` (`getSession`/`verifySessionFresh` → `{ userId: sub, accessToken: "", role: "customer", name: "Sinh viên demo", email: "demo@mini-library.local" }`, `signIn`/`signUp` throw, `signOut` deletes `DEMO_COOKIE`, `isExpectedError` → false); else unchanged.
- `proxy.ts`: before `updateSession`, a valid `readDemoSession(request.cookies.get(DEMO_COOKIE)?.value)` yields `{ response: NextResponse.next({ request }), isAuthenticated: true }` and skips `updateSession`.
- `features/auth/actions.ts`: `demoSignInAction(_prev: { error?: string }, _fd: FormData): Promise<{ error?: string }>` — disabled → `{ error: "Demo login is disabled." }`; else set cookie (`httpOnly`, `sameSite: "lax"`, `secure` in production, `path: "/"`, `maxAge: DEMO_TTL_SECONDS`) and `redirect(DASHBOARD_PATH)` outside try.
- `DemoSignInButton` (`"use client"`, `useActionState`): `<Button variant="outline" size="lg" className="w-full">Demo login</Button>` + `FormError`; rendered on the sign-in page below `SignInForm` when `demoAuthSecret() !== null`.
- `turbo.json` build env += `"DEMO_AUTH"`, `"DEMO_AUTH_SECRET"`; `.env.example` gets a commented block "Demo login (local/grading only)" with `DEMO_AUTH=true` and a placeholder secret.

- [ ] **Step 1:** Implement per the Interfaces.
- [ ] **Step 2:** `pnpm --filter web typecheck`, `lint`, `test` → PASS.
- [ ] **Step 3: Commit (only if user asks)** `feat(auth): add gated demo login`

---

### Task 4: UI components, routes, navigation

**Files:** Create `"use client"` files under `apps/web/features/library/components/`: `book-card.tsx`, `book-list.tsx`, `search-box.tsx`, `category-filter.tsx`, `borrowed-panel.tsx`, `theme-toggle.tsx`, `library-view.tsx`, `stats-view.tsx`, `lazy-stats.tsx`, `library-providers.tsx`; Create `apps/web/app/(dashboard)/dashboard/layout.tsx`, `apps/web/app/(dashboard)/dashboard/stats/page.tsx`; Modify `apps/web/app/(dashboard)/dashboard/page.tsx`, `apps/web/config/routes.ts` (`STATS_PATH = "/dashboard/stats"`), `apps/web/config/navigation.ts:9,37-49`, `apps/web/components/layout/nav-icons.tsx`, `apps/web/app/(dashboard)/layout.tsx:83` (inspector title `"Overview"` → `"Session"`). Test: `apps/web/features/library/__tests__/book-card.test.tsx`.

**Interfaces (Consumes Tasks 1-2; Produces):**
- `BookCard = memo(({ book, borrowed, onBorrow }: { book: BookCardData; borrowed: boolean; onBorrow: (id: string) => void }) => ...)`: title, author, `Badge variant="outline"` category, year, `"Còn {n} bản"`; `<Button size="sm">Mượn</Button>` disabled when `copiesLeft === 0` or `borrowed` (label `"Đang mượn"` when borrowed, `"Hết sách"` text at 0). `Card` parts.
- `BookList({ books, borrowedIds, onBorrow })`: `grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3`, `key={book.id}`; `Empty` + `EmptyTitle` `"Không tìm thấy sách phù hợp"`.
- `SearchBox`: `Input` bound to `useFilterStore` query, `aria-label`/placeholder `"Tìm theo tên sách hoặc tác giả"`.
- `CategoryFilter`: `Tabs` + `TabsList variant="line"`, values `all`/categories, `onValueChange` guarded by `isFilterCategory`.
- `BorrowedPanel({ books, onReturn })`: heading `"Đang mượn ({n}/3)"`, rows with `<Button variant="outline" size="sm">Trả</Button>`, empty `"Bạn chưa mượn cuốn nào."`; `warning` → `<Alert variant="destructive">` + `AlertAction` `"Đóng"` → `dismissWarning()`.
- `ThemeToggle`: `<Button variant="outline" size="icon-sm" aria-label="Chuyển giao diện sáng / tối">` → `useTheme().toggleTheme`; `IconSun`/`IconMoon` swapped with `dark:hidden` / `hidden dark:block` (no hydration mismatch).
- `LibraryView`: `fail = useSearchParams().get("fail") === "1"`; effect dispatches `fetchBooks({ fail })` when `status === "idle"`; `useDebounce(query, 300)`; `filtered = useMemo(filterBooks(...))`; `handleBorrow`/`handleReturn` via `useCallback`. Loading/idle → `<p role="status">Đang tải...</p>` + `Skeleton`s; failed → `Alert variant="destructive"` title `"Không tải được danh sách sách"`, description = error, `AlertAction` `"Thử lại"` → `fetchBooks()`; succeeded → toolbar (`SearchBox`, `CategoryFilter`, `ThemeToggle`) over `grid grid-cols-1 gap-8 lg:grid-cols-12` (list `lg:col-span-8`, panel `lg:col-span-4`).
- `StatsView` (default export): fetches when idle; `countByCategory` via `useMemo`; a `dl` row (design system §8, not stat cards) with each category and `"Đang mượn"` = `borrowedIds.length`.
- `LazyStats`: top-level `const StatsView = lazy(() => import("./stats-view"))` inside `<Suspense fallback={<p role="status">Đang tải...</p>}>`.
- `LibraryProviders`: `useState(() => makeStore())` → `<Provider><FilterStoreProvider><LibraryThemeProvider>`.
- `dashboard/layout.tsx`: `<LibraryProviders>{children}</LibraryProviders>` (store shared by both pages).
- `dashboard/page.tsx`: title `"Thư viện"`, keep `Guard`, `<PageHead label="Thư viện" title="Tra cứu & mượn sách">`, `<Suspense fallback={<p role="status">Đang tải...</p>}><LibraryView /></Suspense>`.
- `stats/page.tsx`: title `"Thống kê"`, `Guard`, `PageHead`, `<LazyStats />`.
- Nav: `NavIconName = "library" | "stats"` (`overview` removed), links `"Thư viện"` → `DASHBOARD_PATH`, `"Thống kê"` → `STATS_PATH`, both `account:view`; icons `IconBooks`, `IconChartBar`.

- [ ] **Step 1: Failing tests** (`book-card.test.tsx`, jsdom, `userEvent.setup()`):

```ts
it("shows title, author, category, year and copies left", ...)   // getByText("Còn 2 bản") etc.
it("clicking Mượn calls onBorrow with the book id", async ...)   // toHaveBeenCalledWith("b1")
it("disables Mượn when no copies are left", ...)                 // toBeDisabled()
```

- [ ] **Step 2:** `pnpm --filter web exec vitest run features/library/__tests__/book-card.test.tsx` → FAIL.
- [ ] **Step 3:** Implement `BookCard` → test PASS; then the other components, routes and nav.
- [ ] **Step 4:** `pnpm --filter web typecheck`, `lint`, `test`, `build` → PASS (no runtime-API-outside-Suspense error). Grep the diff for `-[`, `text-[`, hex, `h-`/`px-` on shadcn components: none.
- [ ] **Step 5: Commit (only if user asks)** `feat(library): add library ui and mount at /dashboard`

---

### Task 5: Verification and the single final review

- [ ] **Step 1:** `pnpm check` and `pnpm build` from the root → exit 0.
- [ ] **Step 2:** `apps/web/.env.local` (not committed) with `DEMO_AUTH=true` and a 64-hex secret, no DB running; `pnpm --filter web dev`. Check: signed-out `/dashboard` → `/sign-in`; Demo login → `/dashboard`; "Đang tải..." ~500ms then 12 books; `/dashboard?fail=1` → error, "Thử lại" loads; search `"  NGUYỄN "` updates ~300ms after typing, tabs filter, no match → Empty; borrow 3, 4th → warning, "Hết sách" disabled, "Trả" restores and clears warning; theme toggle and `[D]` in sync, both themes at 375/1024 px; `/dashboard/stats` counts match, borrow state kept on return; sign out → `/sign-in`; edited demo cookie value → signed out; `DEMO_AUTH` unset → button hidden, cookie ignored; real sign-in form still renders.
- [ ] **Step 3:** One whole-branch review (agent `reviewer`, Opus) against spec, brief and Global Constraints; fix findings in place, re-run Step 1.
- [ ] **Step 4:** Report verified vs not verified. **Commit only if user asks.**

## Self-review notes

- Coverage: functional 1-9 → Tasks 2/4 (stats route `/dashboard/stats` per spec); technical 1, 8 → Task 2; 2-3 → Task 2; 4 → Task 2; 5 → Task 1; 6 → Task 4; 7 → Tasks 1/2/4 (4 reducer + 1 middleware, 3 BookCard, 1 useDebounce). Demo login → Task 3.
- Deliberate deviations: stats as a `dl` row (design system §8) instead of cards; inline destructive `Alert` for the limit warning; forced failure via `?fail=1`; inspector content unchanged (title only).
- Known limitation: Redux state is not keyed by user; another user signing in within the same tab without reload could see the previous borrow list.
