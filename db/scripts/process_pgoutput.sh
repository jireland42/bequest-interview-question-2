pg_recvlogical -d bequest --slot=change_log --if-not-exists --create-slot --option='proto_version=1' --option=publication_names='users_pub'
pg_recvlogical -d bequest --slot=change_log --start -f - | /change_logger.sh

