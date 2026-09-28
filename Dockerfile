# ============================================================
# Mỗi dòng "FROM ... AS xxx" bắt đầu 1 GIAI ĐOẠN (stage).
# Ý tưởng multi-stage: dùng 1 image to đầy đủ công cụ để BUILD,
# rồi copy thành phẩm sang 1 image nhẹ chỉ để CHẠY.
# Image cuối không chứa TypeScript, không chứa source → nhỏ + an toàn.
# ============================================================

# ---------- GIAI ĐOẠN 1: BUILD ----------
# node:20-alpine = Node 20 bản Alpine Linux (~130MB, cực nhẹ so với Ubuntu)
FROM node:20-alpine AS builder
# WORKDIR: tạo và đặt "thư mục làm việc" bên trong container.
# Mọi lệnh COPY/RUN sau đó tính từ đây. Nếu không set, nó nằm ở /
WORKDIR /app

# COPY package*.json copy TRƯỚC, source copy SAU — cố tình tách 2 bước này!
# Docker build theo từng bước và CACHE lại từng bước.
# Nếu gộp chung 1 lệnh COPY . . thì đổi 1 dòng code → npm ci chạy LẠI từ đầu (mất vài phút).
# Tách ra thì chỉ sửa code → cache bước npm ci vẫn dùng được → build nhanh.
COPY package*.json ./
# npm ci = cài đúng y hệt package-lock.json, sạch hơn npm install, dùng cho CI/CD/Docker
RUN npm ci

# Giờ mới copy toàn bộ source vào
COPY . .
# Biên dịch TS → dist/ (main.js nằm ở dist/main.js)
RUN npm run build


# ---------- GIAI ĐOẠN 2: CHẠY ----------
FROM node:20-alpine
WORKDIR /app

# Báo cho Node/Nest biết đang ở môi trường production
# (một số thư viện tự tắt log debug, tối ưu theo cái này)
ENV NODE_ENV=production

COPY package*.json ./
# --omit=dev: KHÔNG cài devDependencies (jest, ts-node, eslint...)
# Production chỉ cần thư viện chạy thật → node_modules nhẹ đi rất nhiều
RUN npm ci --omit=dev

# --from=builder: lấy file từ giai đoạn 1 sang.
# Chỉ mang dist/ (kết quả build) qua, KHÔNG mang source TS, KHÔNG mang node_modules của stage 1
COPY --from=builder /app/dist ./dist

# Khai báo container sẽ lắng nghe cổng 3000 (chỉ mang tính ghi chú,
# muốn mở cổng thật vẫn phải -p ở docker run hoặc ports: ở compose)
EXPOSE 3000

# Lệnh chạy khi container start. NestJS build xong là file JS thuần
# nên chạy node trực tiếp — không cần nest/npx (vừa nặng vừa thừa)
CMD ["node", "dist/main.js"]