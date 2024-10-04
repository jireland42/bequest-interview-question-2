FROM postgres:17
USER root

ARG POSTGRES_USER=postgres POSTGRES_PASSWORD=password POSTGRES_DB=bequest
ENV POSTGRES_USER=${POSTGRES_USER} POSTGRES_PASSWORD=${POSTGRES_PASSWORD} POSTGRES_DB=${POSTGRES_DB}

ARG DB_FOLDER="./db"
ARG SCRIPTS_FOLDER="$DB_FOLDER/scripts"

ENV SCHEMA_SCRIPT="schema.sql"
ENV CONFIGURATION_SCRIPT="configure.sh"
ENV PROCESSING_SCRIPT="process_pgoutput.sh"
ENV LOGGING_SCRIPT="change_logger.sh"

COPY $DB_FOLDER/$SCHEMA_SCRIPT /docker-entrypoint-initdb.d/001_$SCHEMA_SCRIPT
COPY $SCRIPTS_FOLDER/$CONFIGURATION_SCRIPT /docker-entrypoint-initdb.d/002_$CONFIGURATION_SCRIPT
COPY $SCRIPTS_FOLDER/$PROCESSING_SCRIPT /$PROCESSING_SCRIPT
COPY $SCRIPTS_FOLDER/$LOGGING_SCRIPT /$LOGGING_SCRIPT

USER postgres
