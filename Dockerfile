FROM node:14
WORKDIR /app
ENV SHARED_DIR /data
COPY . .

RUN apt update && apt install postgresql-client
RUN bash -c 'until pg_isready -q -d ${POSTGRES_DB} -U ${POSTGRE_USER} -h ${POSTGRES_HOST}; do echo "waiting for db ${POSTGRES_DB}..." && sleep 5 ; done && echo "db is ready!"'

RUN npm i
RUN npm build

CMD ["npm", "start"]
