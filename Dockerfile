FROM node:14
ARG POSTGRES_DB=itransfer
ARG POSTGRES_USER=postgres
ARG POSTGRES_HOST=db
ARG SHARED_DIR=/data
WORKDIR /app

COPY ./package*.json ./
RUN apt-get update && apt-get install -y postgresql-client
RUN npm i

COPY . .
RUN npm i -g typescript && tsc

CMD until pg_isready -q -d ${POSTGRES_DB} -U ${POSTGRES_USER} -h ${POSTGRES_HOST}; do echo "waiting for db ${POSTGRES_DB}..." && sleep 5 ; done && \
echo "db is ready!" && \
npm run typeorm migration:run && \
npm start
