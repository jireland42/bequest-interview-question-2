CREATE EXTENSION pgcrypto;

------------------------- Schema -------------------------

CREATE TABLE users(
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL,
	account_hash BYTEA NOT NULL
);

CREATE TABLE custodians(
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL
);

CREATE TABLE bequests(
	id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(id),
	custodian_id INTEGER REFERENCES custodians(id),
	account VARCHAR(50) NOT NULL,
	beneficiary VARCHAR(50) NOT NULL,
	record_hash BYTEA NOT NULL
);


---------- Triggers For Handling Data Hashes ----------

CREATE OR REPLACE FUNCTION create_user_hash()
	RETURNS TRIGGER AS $$
		DECLARE id_text TEXT;
		BEGIN
			SELECT CAST(NEW.id AS TEXT) INTO id_text;
			SELECT digest(concat(id_text, NEW.name), 'sha256') INTO NEW.account_hash;
			RETURN NEW;
		END;
	$$ LANGUAGE plpgsql;

CREATE TRIGGER create_user_hash
BEFORE INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_user_hash();


CREATE OR REPLACE FUNCTION update_user_hash()
	RETURNS TRIGGER AS $$
		DECLARE id_text TEXT;
		DECLARE hash_text TEXT;
		BEGIN
			SELECT CAST(NEW.id AS TEXT) INTO id_text;
			SELECT CAST(NEW.account_hash AS TEXT) INTO hash_text;
			SELECT digest(concat(id_text, NEW.name, hash_text), 'sha256') INTO NEW.account_hash;
			RETURN NEW;
		END;
	$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_hash
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_user_hash();

CREATE OR REPLACE FUNCTION log_record_hash()
	RETURNS TRIGGER AS $$
		DECLARE record_id_text TEXT;
		DECLARE user_id_text TEXT;
		DECLARE custodian_id_text TEXT;
		DECLARE record_hash_text TEXT;
		DECLARE account_hash_text TEXT;
		DECLARE old_account_hash BYTEA;
		DECLARE new_account_hash BYTEA;
		BEGIN
			-- convert numeric fields
			SELECT CAST(NEW.id AS TEXT) INTO record_id_text;
			SELECT CAST(NEW.user_id AS TEXT) INTO user_id_text;
			SELECT CAST(NEW.custodian_id AS TEXT) INTO custodian_id_text;

			-- produce hash for new record
			SELECT digest(concat(record_id_text, user_id_text, custodian_id_text, NEW.account, NEW.beneficiary), 'sha256')
			INTO NEW.record_hash;

			-- produce account hash from old account hash and new record hash
			SELECT account_hash FROM users WHERE id = NEW.user_id INTO old_account_hash;
			SELECT CAST(old_account_hash AS TEXT) INTO account_hash_text;

			SELECT CAST(NEW.record_hash AS TEXT) INTO record_hash_text;

			SELECT digest(concat(account_hash_text, record_hash_text), 'sha256') INTO new_account_hash;

			UPDATE users SET account_hash = new_account_hash WHERE id = NEW.user_id;

			RETURN NEW;
		END;
	$$ LANGUAGE plpgsql;

CREATE TRIGGER log_record_hash
BEFORE INSERT OR UPDATE ON bequests
FOR EACH ROW
EXECUTE FUNCTION log_record_hash();

