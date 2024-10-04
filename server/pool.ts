import express from "express";
import { Pool } from "pg";

import 'dotenv/config'

///////////////////////////////////////////////////////////////////////////////
//                                User Queries
///////////////////////////////////////////////////////////////////////////////
export async function createUser(request: express.Request, response: express.Response) {
	const query = "INSERT INTO users (name) VALUES ($1) RETURNING (id, account_hash);";
	const userName = request.body.body.userName;

	const result = await queryDB(query, [userName]);
	if (result) { return response.json(result.rows[0]) }
	return response.send({});
};

export async function readUser(request: express.Request, response: express.Response) {
	const query = "SELECT * FROM users WHERE id = $1;";
	const userID = request.params.userID;

	const result = await queryDB(query, [userID]);
	if (result) { return response.json(result.rows[0]) }
	return response.send({});

};

export async function readUsers(response: express.Response) {
	const query = "SELECT id, name FROM users;";

	const result = await queryDB(query, []);
	if (result) { return response.json(result.rows); }
	return response.send({});
};

///////////////////////////////////////////////////////////////////////////////
//                            Custodian Queries
///////////////////////////////////////////////////////////////////////////////
export async function createCustodian(request: express.Request, response: express.Response) {
	const query = "INSERT INTO custodians (name) VALUES ($1) RETURNING (id);";
	const custodianName = request.body.body.custodianName;

	const result = await queryDB(query, [custodianName]);
	return response.json(result ? result.rows[0] : {});
};

export async function readCustodians(response: express.Response) {
	const query = "SELECT id, name FROM custodians;";

	const result = await queryDB(query, []);
	if (result) { return response.json(result.rows) }
	return response.send({});
};

///////////////////////////////////////////////////////////////////////////////
//                             Bequest Queries
///////////////////////////////////////////////////////////////////////////////
export async function createBequest(request: express.Request, response: express.Response) {
	const insertQuery = 
			"INSERT INTO bequests (user_id, custodian_id, account, beneficiary) " +
			"VALUES ($1, $2, $3, $4) " +
			"RETURNING id, user_id, record_hash;";
	const selectQuery = "SELECT account_hash FROM users WHERE id = $1;";

	const userID = request.body.userID;
	const custodianID = request.body.custodianID;
	const account = request.body.account;
	const beneficiary = request.body.beneficiary;
	const clientAccountHash = request.body.accountHash;

	// verify acount hash is still correct
	let selectResult = await queryDB(selectQuery, [userID]);

	if (!selectResult) { return response.send({validated: false}); }

	const serverAccountHashData = selectResult.rows[0].account_hash;
	const serverAccountHash = serverAccountHashData.toString('hex');

	if (serverAccountHash !== clientAccountHash) { return response.send({validated: false}) }

	// since the verification was successful, insert the new record
	const insertResult = await queryDB(insertQuery, [userID, custodianID, account, beneficiary]);
	// trigger runs here
	selectResult = await queryDB(selectQuery, [userID]);
 
	// combine the results from the two queries
	const hashData = insertResult ? insertResult.rows[0] : {};
	if (selectResult) { hashData["account_hash"] = selectResult.rows[0].account_hash }

	return response.json(hashData);
};

export async function readBequests(request: express.Request, response: express.Response) {
	const query =
		"SELECT bequests.id, users.name AS user, custodians.name AS custodian, account, beneficiary " +
		"FROM bequests " +
		"INNER JOIN users ON user_id = users.id " +
		"INNER JOIN custodians ON custodian_id = custodians.id " +
		"WHERE user_id = $1;";

	const userID = request.query.userID;

	const result = await queryDB(query, [userID]);
	if (result) { return response.json(result.rows) }
	return response.send({});
};

///////////////////////////////////////////////////////////////////////////////
//                         Verification Queries
///////////////////////////////////////////////////////////////////////////////
export async function readHashes(request: express.Request, response: express.Response) {
	const userID = request.query.userID;
	const recordHashesRequested = request.query.recordHashesRequested;

	if (recordHashesRequested === "true") {
		const query = "SELECT id, record_hash FROM bequests WHERE user_id = $1 ORDER BY id;";
		const result = await queryDB(query, [userID]);

		if (result) { return response.json(result.rows) }
		return response.send({});
	}
	
	if (recordHashesRequested === "false") {
		const query = "SELECT account_hash FROM users WHERE id = $1;";
		const result = await queryDB(query, [userID]);

		if (result) { return response.json(result.rows[0]) }
		return response.send({});
	}
};


export async function readLogs(request: express.Request, response: express.Response) {
	const query = "SELECT id, table_name, log_entry FROM bequest_log WHERE user_id = $1 ORDER BY id;";
	const userID = request.query.userID;

	const result = await queryLogDB(query, [userID]);
	if (result) { return response.json(result.rows) }
	return response.send({});
};

///////////////////////////////////////////////////////////////////////////////
//                                Helpers
///////////////////////////////////////////////////////////////////////////////
async function queryPool(db: Pool, query: string, data: any[]) {
	try {
		const result = await db.query(query, data);
		return result;
	} catch (err) {
		console.log(err);
	}
}

async function queryDB(query: string, data: any[]) {
	return await queryPool(pool, query, data);
}

async function queryLogDB(query: string, data: any[]) {
	return await queryPool(loggerPool, query, data);
}


///////////////////////////////////////////////////////////////////////////////
//                           Initialization Code
///////////////////////////////////////////////////////////////////////////////

// retrieve port for main database
const portString = process.env.REACT_APP_POSTGRES_PORT
if (portString == undefined) { throw "Internal server error"; }
const port: number = parseInt(portString);

// retrieve port for logging database
const loggerPortString = process.env.REACT_APP_POSTGRES_LOGGER_PORT
if (loggerPortString == undefined) { throw "Internal server error"; }
const loggerPort: number = parseInt(loggerPortString);

// establish connection pool with main database
const pool = new Pool({
  host: process.env.REACT_APP_POSTGRES_HOST,
  user: process.env.REACT_APP_POSTGRES_USER,
  password: process.env.REACT_APP_POSTGRES_PASSWORD,
  database: process.env.REACT_APP_POSTGRES_DB,
  port: port,
  idleTimeoutMillis: 30000,
});

// establish connection pool with logging database
const loggerPool = new Pool({
  host: process.env.REACT_APP_POSTGRES_LOGGER_HOST,
  user: process.env.REACT_APP_POSTGRES_LOGGER_USER,
  password: process.env.REACT_APP_POSTGRES_LOGGER_PASSWORD,
  database: process.env.REACT_APP_POSTGRES_LOGGER_DB,
  port: loggerPort,
  idleTimeoutMillis: 30000,
});

