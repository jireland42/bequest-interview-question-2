psql -d bequest -c "ALTER SYSTEM SET wal_level = logical;"
psql -d bequest -c "ALTER SYSTEM SET max_wal_senders = 10;"
psql -d bequest -c "ALTER SYSTEM SET max_replication_slots = 10;"
