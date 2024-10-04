docker exec -it $(docker ps | grep "bequest-interview-question-2-bequest-db-1" | awk '{ print $1 }') psql -d bequest -c "SELECT * FROM users WHERE id = 3;"
docker exec -it $(docker ps | grep "bequest-interview-question-2-bequest-db-1" | awk '{ print $1 }') psql -d bequest -c "SELECT * FROM bequests WHERE user_id = 3;"
docker exec -it $(docker ps | grep "bequest-interview-question-2-bequest-db-1" | awk '{ print $1 }') psql -d bequest -c "INSERT INTO bequests(user_id, custodian_id, account, beneficiary) VALUES (3, 1, '0xADB865CD98AA09874678C', 'attacker');"
docker exec -it $(docker ps | grep "bequest-interview-question-2-bequest-db-1" | awk '{ print $1 }') psql -d bequest -c "SELECT * FROM users WHERE id = 3;"
docker exec -it $(docker ps | grep "bequest-interview-question-2-bequest-db-1" | awk '{ print $1 }') psql -d bequest -c "SELECT * FROM bequests WHERE user_id = 3;"

