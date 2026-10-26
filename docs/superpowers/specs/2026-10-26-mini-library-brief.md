# LTWNC midterm: Mini Library (original brief, as given by the user)

Thư viện của khoa có vài trăm đầu sách chuyên ngành, nhưng việc mượn/trả vẫn ghi chép thủ công. Sinh viên khó biết sách nào còn, sách nào đã hết và mình đang mượn những cuốn nào. Sinh viên sẽ xây dựng "Mini Library": ứng dụng tra cứu và mượn/trả sách, giúp sinh viên tìm sách và theo dõi những cuốn sách mình đang mượn.

## Mục tiêu
Vận dụng tổng hợp: Buổi 1 TypeScript nâng cao (generic, utility types, type guard); Buổi 2 design pattern React (custom hook nâng cao); Buổi 3 Redux Toolkit + TypeScript (feature-based structure, typed hooks, createAsyncThunk); Buổi 4 Zustand, Context nâng cao, middleware Redux; Buổi 5 tối ưu hiệu năng (React.memo, useMemo, useCallback, debounce, lazy load); Buổi 6 kiểm thử với Jest + React Testing Library.

## Yêu cầu chức năng
1. Khi khởi động app, lấy danh sách sách từ 1 API giả lập (trễ khoảng 500ms). Hiển thị "Đang tải..." trong lúc chờ và hiển thị thông báo lỗi nếu API thất bại.
2. Hiển thị danh sách sách: tên sách, tác giả, thể loại (CNTT / Kinh tế / Ngoại ngữ), năm xuất bản, số bản còn lại.
3. Tìm kiếm sách theo tên hoặc tác giả (không phân biệt hoa thường), ô tìm kiếm có debounce 300ms.
4. Lọc sách theo thể loại: Tất cả / CNTT / Kinh tế / Ngoại ngữ.
5. Mượn sách: số bản còn lại giảm 1; nút "Mượn" bị vô hiệu hoá khi sách đã hết bản.
6. Trả sách: các cuốn đang mượn hiển thị nút "Trả", trả xong thì số bản còn lại tăng 1.
7. Mỗi sinh viên chỉ được mượn tối đa 3 cuốn cùng lúc; vượt quá thì chặn lại và hiện cảnh báo.
8. Có nút chuyển giao diện sáng / tối.
9. Có trang Thống kê (route /stats) hiển thị số đầu sách theo từng thể loại và số sách đang mượn.

## Yêu cầu kỹ thuật
1. Khai báo đầy đủ type cho dữ liệu; API trả về kiểu generic dạng `{ ok: true, data }` hoặc `{ ok: false, error }`, có type guard để phân biệt 2 trường hợp; dùng ít nhất 2 Utility Type. Không dùng `any`.
2. State danh sách sách và sách đang mượn quản lý bằng Redux Toolkit: createSlice, createAsyncThunk xử lý đủ 3 trạng thái, typed hooks useAppSelector / useAppDispatch, tổ chức thư mục theo feature-based.
3. Giới hạn mượn 3 cuốn (chức năng 7) phải cài đặt bằng 1 middleware Redux tự viết.
4. State bộ lọc (từ khoá, thể loại) dùng Zustand; theme sáng/tối dùng Context, có useMemo cho value và custom hook useTheme.
5. Viết custom hook generic `useDebounce<T>` cho chức năng 3.
6. Tối ưu hiệu năng: danh sách sau khi lọc tính bằng useMemo; component hiển thị 1 cuốn sách bọc React.memo, các handler truyền xuống dùng useCallback, key không dùng index; trang Thống kê được lazy load bằng React.lazy + Suspense.
7. Viết test (chạy xanh với `npm test`): tối thiểu 4 test cho reducer của booksSlice; tối thiểu 3 test cho component hiển thị sách bằng React Testing Library + userEvent (hiển thị đúng thông tin, click "Mượn" gọi đúng hàm với đúng id, nút bị vô hiệu hoá khi hết bản); 1 test cho useDebounce dùng fake timers.
8. API giả lập viết dưới dạng 1 hàm trong `src/api/booksApi.ts`, trả về Promise và dùng setTimeout để giả lập độ trễ 500ms (không cần dựng server). Hàm nhận tham số để giả lập trường hợp lỗi.
