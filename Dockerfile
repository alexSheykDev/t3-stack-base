FROM node:20

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json yarn.lock ./

COPY prisma ./prisma

RUN yarn install

COPY . .

RUN yarn prisma generate

EXPOSE 3000

CMD ["yarn", "dev"]