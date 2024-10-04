echo "Starting server..."
docker compose up --build -d

echo "Restarting server to apply configuration..."
docker compose restart bequest-db

sleep 4 # give time for the database to come online (increase time if machine is slower)

echo "Starting change data capture..."
docker exec -it bequest-interview-question-2-bequest-db-1 /bin/sh process_pgoutput.sh 

