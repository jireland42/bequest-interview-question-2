echo "Starting server..."
docker run --rm --name bequest-db -d -p 7654:5432 bequest-db

echo "Restarting server to apply configuration..."
docker restart bequest-db

sleep 3 # give time for the database to come online (increase time if machine is slower)

echo "Starting change data capture..."
docker exec -it bequest-db /bin/sh process_pgoutput.sh 

