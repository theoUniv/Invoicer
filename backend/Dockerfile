FROM node:18-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

# Generate Prisma Client
COPY prisma ./prisma/
RUN npm run generate

COPY . .

EXPOSE 3001

CMD ["node", "index.js"]
