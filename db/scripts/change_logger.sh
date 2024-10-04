#!/bin/bash

echo "Ready!"

while read target table operation id_glob remaining; do

	if [ "$operation" = "INSERT:" ] || [ "$operation" = "UPDATE:" ] || [ "$operation" = "DELETE:" ]; then
		table_name=$(echo "$table" | sed 's|.*\.\(.*\):|\1|')
		if [ $table_name = "custodians" ]; then
			continue;
		fi

		user_id=$(echo "$id_glob" | sed 's|.*:\(.*\)|\1|')
		log_entry="$target $table $operation $id_glob $remaining"
		escaped_log_entry="$(echo $log_entry | sed "s/'/''/g")"

		echo "Entry: " $escaped_log_entry
		echo ""
		PGPASSWORD='password' psql -h log-db -p 5432 -d bequest -c "INSERT INTO bequest_log (user_id, table_name, log_entry) VALUES ($user_id, '$table_name', '$escaped_log_entry');"
	fi
done

