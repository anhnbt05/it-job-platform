# Dashboard DB Status

Thư mục này không còn là database active.

`dashboard-service` hiện là stateless aggregator, lấy dữ liệu từ:

- `job-service`
- `application-service`

qua HTTP client, nên không cần persistence riêng trong local stack hiện tại.

Thư mục `dasboard-db` được giữ lại để tránh làm gãy tham chiếu cũ trong repo history. Nếu sau này cần database cho dashboard, nên tạo thư mục mới với tên đúng là `dashboard-db`.
