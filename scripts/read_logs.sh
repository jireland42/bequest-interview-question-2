docker exec -it $(docker ps | grep "bequest-interview-question-2-log-db-1" | awk '{ print $1 }') psql -d bequest -c "SELECT * FROM bequest_log;"
