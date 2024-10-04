import { openDB, deleteDB } from "idb";

const dbVersion = 1;

// doing this to get the type of the connection, works for a demo
const db = openDB("jank", dbVersion, {});
deleteDB("jank");

const userDatabases = new Map<number, typeof db>();

export type HashRecord = {
	id: number;
	hash: string;
};

export function stringifyHash(hashData: Array<number>): string {
	return hashData.map(x => x.toString(16).padStart(2, '0')).join('');
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                  Making DB Connections
/////////////////////////////////////////////////////////////////////////////////////////
export function openUserDB(databaseID: number) {
	const db = openDB(
		String(databaseID),
		dbVersion,
		{
			upgrade(db) {
				db.createObjectStore(String(databaseID));
			}
		});

	userDatabases.set(databaseID, db);

	return db;
}

async function getUserDB(databaseID: number) {
	let userDB = await userDatabases.get(databaseID);

	if (userDB === undefined) {
		userDB = await openUserDB(databaseID);
	}

	return userDB;
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                  Storage and Retrieval
/////////////////////////////////////////////////////////////////////////////////////////
export async function storeAccountHash(databaseID: number, value: string): Promise<IDBValidKey> {
	const userDB = await getUserDB(databaseID);

	return (await userDB).put(String(databaseID), value, 0);
}

export async function readAccountHash(databaseID: number): Promise<string> {
	const userDB = await getUserDB(databaseID);
	const hashData = await (await userDB).get(String(databaseID), 0);

	return hashData;
}

export async function storeRecordHash(databaseID: number, key: number, value: string): Promise<IDBValidKey> {
	const userDB = await getUserDB(databaseID);

	return (await userDB).put(String(databaseID), value, key);
}

export async function readRecordHashes(databaseID: number): Promise<Array<HashRecord>> {
	const userDB = await getUserDB(databaseID);

	let cursor = await (await userDB).transaction(String(databaseID)).store.openCursor();

	const unsortedHashes: Array<HashRecord> = new Array<HashRecord>();
	while (cursor) {
		unsortedHashes.push({id: parseInt(String(cursor.key)), hash: cursor.value});
		cursor = await cursor.continue();
	}

	return sortHashes(unsortedHashes);
}

/////////////////////////////////////////////////////////////////////////////////////////
//                                      Helpers             
/////////////////////////////////////////////////////////////////////////////////////////
export function sortHashes(hashes: Array<HashRecord>): Array<HashRecord> {
	return hashes.sort((x: HashRecord, y: HashRecord) => x.id - y.id);
}

