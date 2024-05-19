FROM node:alpine As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build api

FROM node:alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

EXPOSE 5201

CMD ["node", "dist/apps/cache-warmer/src/main"]
#CMD ["npm", "run", "start:cache-warmer:mainnet"]