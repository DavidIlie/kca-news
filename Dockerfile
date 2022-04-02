FROM node:16.13.0-slim as build

RUN mkdir -p /usr/src/app
ENV PORT 3000
WORKDIR /usr/src/app
COPY package.json /usr/src/app
COPY yarn.lock /usr/src/app
RUN apt-get -qy update && apt-get -qy install openssl
RUN yarn
COPY . /usr/src/app
RUN yarn prisma generate --schema=/usr/src/app/prisma/schema.prisma
RUN yarn build
EXPOSE 3000
ENTRYPOINT ["yarn", "start"]