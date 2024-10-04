FROM postgres:17
USER root

ARG POSTGRES_USER=postgres POSTGRES_PASSWORD=password POSTGRES_DB=bequest
ENV POSTGRES_USER=${POSTGRES_USER} POSTGRES_PASSWORD=${POSTGRES_PASSWORD} POSTGRES_DB=${POSTGRES_DB}

ARG DB_FOLDER="./log-db"
ARG SCRIPTS_FOLDER="$DB_FOLDER/scripts"

ENV SCHEMA_SCRIPT="schema.sql"

COPY $DB_FOLDER/$SCHEMA_SCRIPT /docker-entrypoint-initdb.d/001_$SCHEMA_SCRIPT

USER postgres