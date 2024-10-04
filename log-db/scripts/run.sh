echo "Starting server..."
docker run --rm --name bequest-log-db -d -p 7654:5432 bequest-log-db
