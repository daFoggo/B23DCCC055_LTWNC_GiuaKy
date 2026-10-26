# Mini Library

Ứng dụng tra cứu và mượn/trả sách của khoa: bài kiểm tra giữa kỳ môn Lập trình web nâng cao (LTWNC).

Triển khai: https://b23dccc055-mini-library.vercel.app

> **Lưu ý: dự án dùng Next.js 16 (App Router), không phải Vite/CRA.**
> Đề bài viết cho một ứng dụng React thuần (`src/`, `npm test` với Jest, route `/stats`). Dự án này
> là monorepo pnpm + Turborepo, ứng dụng nằm ở `apps/web`, nên mỗi tiêu chí của đề được ánh xạ sang
> khái niệm tương ứng của Next.js. Các chỗ khác đề được liệt kê ở mục [Khác biệt so với đề](#khác-biệt-so-với-đề).

## Chạy dự án

```bash
pnpm install
pnpm dev --filter=web      # http://localhost:3000
pnpm check                 # lint + typecheck + test
pnpm build
cd apps/web && npm test    # chỉ chạy test của ứng dụng (Vitest)
```

Đăng nhập nhanh: trang `/sign-in` có nút **Demo login** (không cần cơ sở dữ liệu). Bật bằng cách tạo
`apps/web/.env.local`:

```bash
DEMO_AUTH=true
DEMO_AUTH_SECRET=<chuỗi ngẫu nhiên từ 32 ký tự>
```

Sau khi đăng nhập, vào `/dashboard` (danh sách sách) và `/dashboard/stats` (thống kê). Đường dẫn `/stats`
tự chuyển hướng sang `/dashboard/stats`. Thêm `?fail=1` vào `/dashboard` để giả lập API lỗi.

## Next.js được dùng như thế nào

| Khái niệm | Trong dự án |
| --- | --- |
| Route theo thư mục | `app/(dashboard)/dashboard/page.tsx` là danh sách sách, `.../stats/page.tsx` là thống kê. Route group `(dashboard)` dùng chung layout có sidebar, header và inspector. |
| Server / Client Component | Trang và layout là Server Component. Mọi thứ có state hoặc handler (Redux, Zustand, Context, `useState`, `useEffect`) nằm trong file có `"use client"` ở `features/library/components`. |
| Cấu trúc theo feature | Toàn bộ nghiệp vụ nằm trong `apps/web/features/library/`. `app/` chỉ ghép các thành phần lại, ESLint cấm `features/` import từ `app/`. |
| `Suspense` và Partial Prerender | Khung trang được render sẵn, phần dùng `useSearchParams` và store Redux được stream sau. Store Redux gọi `Math.random()` nên bắt buộc nằm trong `<Suspense>` (`app/(dashboard)/layout.tsx`). |
| `React.lazy` | Dùng nguyên `React.lazy` + `Suspense` cho `StatsView` (`components/lazy-stats.tsx`). Tương đương `next/dynamic`. |
| `next.config.ts` redirects | `/stats` chuyển hướng sang `/dashboard/stats`. |
| `proxy.ts` (middleware) | Chặn người chưa đăng nhập vào `/dashboard`; cookie demo được kiểm tra trước provider thật. |
| Server Action | Nút Demo login gọi Server Action (`features/auth/actions.ts`) để đặt cookie đã ký HMAC. |
| Kiểm thử | Vitest + Testing Library + `user-event` + jsdom, API tương thích Jest (`vi.fn`, `vi.useFakeTimers`). |

## Bảng đối chiếu yêu cầu đề bài

Đường dẫn bên dưới tính từ `apps/web/features/library/` trừ khi ghi khác.

### Yêu cầu chức năng

| # | Yêu cầu của đề | Đã làm trong dự án | Trạng thái |
| --- | --- | --- | --- |
| 1 | Lấy danh sách sách từ API giả lập (trễ ~500ms), hiện "Đang tải...", báo lỗi nếu thất bại | Thunk `fetchBooks` chạy khi trang mount (`components/library-view.tsx`). Trạng thái tải: `components/library-skeleton.tsx` có chữ "Đang tải...". Lỗi: `Alert` kèm nút "Thử lại". Thêm `?fail=1` để thử lỗi | Đạt |
| 2 | Hiển thị tên, tác giả, thể loại, năm xuất bản, số bản còn lại | `components/book-card.tsx` (thêm bìa, nhà xuất bản, ISBN trong `components/book-detail-dialog.tsx`). Số lượng hiển thị là "Còn x/y cuốn" | Đạt |
| 3 | Tìm theo tên hoặc tác giả, không phân biệt hoa thường, debounce 300ms | `selectors.ts` (`filterBooks`), `useDebounce(query, 300)` trong `library-view.tsx`, ô nhập ở `components/search-box.tsx` | Đạt |
| 4 | Lọc theo thể loại Tất cả / CNTT / Kinh tế / Ngoại ngữ | `components/category-filter.tsx`: tab dọc kèm số lượng từng thể loại | Đạt |
| 5 | Mượn: giảm 1 bản, nút "Mượn" vô hiệu khi hết bản | Reducer `borrowBook` (`store/books-slice.ts`); nút `disabled` khi hết sách hoặc đã mượn (`components/book-card.tsx`) | Đạt |
| 6 | Trả: sách đang mượn có nút "Trả", trả xong tăng 1 bản | Reducer `returnBook` (không vượt tổng số bản). Nút "Trả" ở thẻ sách, panel "Sách của tôi", modal và bảng thống kê | Đạt |
| 7 | Tối đa 3 cuốn cùng lúc, vượt thì chặn và cảnh báo | `store/borrow-limit-middleware.ts` chặn lần mượn thứ 4 và hiện toast lỗi (`components/warning-toast.tsx`) | Đạt |
| 8 | Nút chuyển giao diện sáng / tối | `components/theme-toggle.tsx` đặt ở header của layout dashboard, có phím tắt `d` | Đạt |
| 9 | Trang Thống kê `/stats`: số đầu sách theo thể loại, số sách đang mượn | `app/(dashboard)/dashboard/stats/page.tsx` + `components/stats-view.tsx`: bảng theo thể loại (có dòng tổng) và bảng sách đang mượn. `/stats` chuyển hướng sang trang này | Đạt (route là `/dashboard/stats`) |

### Yêu cầu kỹ thuật

| # | Yêu cầu của đề | Đã làm trong dự án | Trạng thái |
| --- | --- | --- | --- |
| 1 | Khai báo đủ type, API trả `{ ok: true, data }` hoặc `{ ok: false, error }`, có type guard, ít nhất 2 Utility Type, không dùng `any` | `types.ts`: `ApiResult<T>`, guard `isOk`/`isErr`/`isFilterCategory`. Utility Type: `Readonly`, `Pick`, `Partial`, `Record`, `Omit`. Không có `any` | Đạt |
| 2 | Redux Toolkit: `createSlice`, `createAsyncThunk` đủ 3 trạng thái, hook có kiểu, thư mục theo feature | `store/books-slice.ts` (pending / fulfilled / rejected), `store/hooks.ts` (`useAppDispatch`, `useAppSelector`), `store/store.ts` (`makeStore`, tạo mỗi lần mount để hợp với SSR) | Đạt |
| 3 | Giới hạn 3 cuốn bằng middleware Redux tự viết | `store/borrow-limit-middleware.ts` | Đạt |
| 4 | Bộ lọc dùng Zustand; theme dùng Context, `useMemo` cho value và hook `useTheme` | Zustand: `filter-store.ts` (từ khoá, thể loại, trang; factory + provider ở `components/filter-store-provider.tsx`). Theme: `theme/theme-context.tsx` (value bọc `useMemo`, hook `useTheme`), trạng thái sáng/tối lưu bởi `next-themes` | Đạt |
| 5 | Hook generic `useDebounce<T>` | `hooks/use-debounce.ts` | Đạt |
| 6 | `useMemo` cho danh sách đã lọc, `React.memo` cho thẻ sách, `useCallback` cho handler, key không dùng index, lazy load trang Thống kê | `useMemo` trong `library-view.tsx`; `memo` ở `components/book-card.tsx`; `useCallback` ở `hooks/use-borrow-actions.ts` và `library-view.tsx`; key là `book.id`; `React.lazy` + `Suspense` ở `components/lazy-stats.tsx` | Đạt |
| 7 | Test chạy xanh: ≥4 test reducer, ≥3 test component với RTL + userEvent, 1 test `useDebounce` dùng fake timers | `__tests__/books-slice.test.ts` (reducer + middleware), `__tests__/book-card.test.tsx` (hiển thị, click "Mượn" gọi đúng id, nút vô hiệu khi hết sách), `__tests__/use-debounce.test.tsx` (fake timers). Chạy bằng `npm test` trong `apps/web` | Đạt |
| 8 | API giả lập trong `src/api/booksApi.ts`, trả Promise, `setTimeout` 500ms, có tham số giả lập lỗi | `api/booksApi.ts`: `fetchBooks({ fail, delayMs })` trả `Promise<ApiResult<Book[]>>`, trễ 500ms, 41 sách mẫu | Đạt (khác đường dẫn) |

## Khác biệt so với đề

| Đề yêu cầu | Dự án làm | Lý do |
| --- | --- | --- |
| Jest | Vitest | Repo dùng Vitest cho mọi app, thêm Jest sẽ có hai test runner. API tương thích, `npm test` vẫn chạy xanh. |
| Route `/stats` | `/dashboard/stats`, kèm redirect `/stats` | Trang thống kê nằm trong layout dashboard. |
| `src/api/booksApi.ts` | `apps/web/features/library/api/booksApi.ts` | Next.js trong repo này tổ chức theo `features/`, không có thư mục `src/`. |
| Theme bằng Context | Context bọc `next-themes` | `next-themes` xử lý việc đặt class `dark` trước khi hydrate, tránh nhấp nháy. Context vẫn có `useMemo` và `useTheme`. |
| Không đề cập đăng nhập | Dashboard cần phiên đăng nhập, có nút Demo login | Giữ nguyên layout auth và dashboard của repo. |
| Không đề cập | Phân trang, modal chi tiết, hạn trả 14 ngày, toast | Bổ sung nghiệp vụ cho giống thư viện thật. |

## Cấu trúc

```
apps/web/
  app/(dashboard)/dashboard/      trang danh sách và thống kê
  features/library/
    api/                          API giả lập
    store/                        Redux: slice, middleware, store, hooks
    components/                   giao diện
    hooks/                        useDebounce, useBorrowActions
    theme/                        Context theme
    __tests__/                    test
packages/ui/                      shadcn/ui dùng chung
```

Tài liệu thiết kế và kế hoạch nằm ở `docs/superpowers/`. CI (`.github/workflows/ci.yml`) chạy
`lint`, `typecheck`, `test` và `build` cho mỗi lần push.
