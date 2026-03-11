# ===== Build stage =====
FROM node:20-alpine AS builder

WORKDIR /app

# copy package files
COPY package*.json ./

# install dependencies
RUN npm install

# copy source code
COPY . .

# build NestJS
RUN npm run build


# ===== Production stage =====
FROM node:20-alpine

WORKDIR /app

# copy package files
COPY package*.json ./

# install only production deps
RUN npm install --omit=dev

# copy build output
COPY --from=builder /app/dist ./dist

# port của service
EXPOSE 3002

# start app
CMD ["node", "dist/main.js"]