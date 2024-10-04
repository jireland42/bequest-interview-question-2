docker exec -it $(docker ps | grep "bequest-interview-question-2-bequest-db-1" | awk '{ print $1 }') psql -d bequest -c "SELECT * FROM users WHERE id = 2;"
docker exec -it $(docker ps | grep "bequest-interview-question-2-bequest-db-1" | awk '{ print $1 }') psql -d bequest -c "SELECT * FROM bequests WHERE user_id = 2;"
docker exec -it $(docker ps | grep "bequest-interview-question-2-bequest-db-1" | awk '{ print $1 }') psql -d bequest -c "UPDATE bequests SET beneficiary = 'attacker' WHERE user_id = 2;"
docker exec -it $(docker ps | grep "bequest-interview-question-2-bequest-db-1" | awk '{ print $1 }') psql -d bequest -c "SELECT * FROM users WHERE id = 2;"
docker exec -it $(docker ps | grep "bequest-interview-question-2-bequest-db-1" | awk '{ print $1 }') psql -d bequest -c "SELECT * FROM bequests WHERE user_id = 2;"

