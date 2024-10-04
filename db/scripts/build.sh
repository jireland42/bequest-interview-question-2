# read variables from .env file
set -o allexport
source .env
set +o allexport

# build image
docker build . -f ./build/Dockerfile -t bequest-db \
    --build-arg=SCHEMA_FOLDER=$SAMPLE_SCHEMA \
    --build-arg=POSTGRES_USER=$POSTGRES_USER \
    --build-arg=POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
    --build-arg=POSTGRES_DB=$POSTGRES_DB

printf "===\nImage built successfully\n"

