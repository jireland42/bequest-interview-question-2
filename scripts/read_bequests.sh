docker exec -it $(docker ps | grep "bequest-interview-question-2-bequest-db-1" | awk '{ print $1 }') psql -d bequest -c "SELECT * FROM bequests;"
