import { useState, useEffect } from "react";

import { HashRecord, stringifyHash, sortHashes, readRecordHashes } from "./ClientDB";

import "./stylesheets/HashComparisonReport.css";

import { API_URL } from "./App";

type HashRecordPair = {
	clientHash: HashRecord;
	serverHash: HashRecord;
};

type PropsType = {
	userID: number;
};

type Log = {
	id: number;
	table_name: string;
	log_entry: string;
};

function HashComparisonReport(props: PropsType) {
	const [clientOnlyHashes, setClientOnlyHashes] = useState<Array<HashRecord>>();
	const [serverOnlyHashes, setServerOnlyHashes] = useState<Array<HashRecord>>();
	const [differingHashes, setDifferingHashes] = useState<Array<HashRecordPair>>();
	const [userLogs, setUserLogs] = useState<Log[]>();

	useEffect(() => {
		async function showVerificationReceipt() {
			// get sorted record hashes from server
			const getRecordHashesRoute
				= API_URL + "/hashes?userID=" + props.userID + "&recordHashesRequested=true";

			const response = await fetch(
				getRecordHashesRoute,
				{
					method: 'GET',
					headers: { 'Content-Type': 'application/json' }
				}
			);
			const responseData = await response.json();

			// convert the data to strings containing the hashes
			const serverHashRecords: Array<HashRecord> = new Array<HashRecord>();
			for (let i = 0; i < responseData.length; i += 1) {
				const id: number = responseData[i].id;
				const hash: string = stringifyHash(responseData[i].record_hash.data);
				serverHashRecords.push({id: id, hash: hash});
			}

			// get records from client and sort them
			let idbHashRecords = await readRecordHashes(props.userID);
			idbHashRecords = sortHashes(idbHashRecords);

			// loop through the two sorted arrays checking for mismatched hashes for common IDs and
			// IDs with hashes that exist only on the client or the server
			let serverIndex = 0;

			let idbIndex = 1; // 0th index holds the acount hash

			type HashRecordPair = {
				clientHash: HashRecord;
				serverHash: HashRecord;
			}

			const serverHashesToStore: Array<HashRecord> = new Array<HashRecord>();
			const clientHashesToStore: Array<HashRecord> = new Array<HashRecord>();
			const mismatchedHashes: Array<HashRecordPair> = new Array<HashRecordPair>();

			for(; serverIndex < serverHashRecords.length && idbIndex < idbHashRecords.length;) {
				let serverID = serverHashRecords[serverIndex].id;
				let serverHash = serverHashRecords[serverIndex].hash;

				let idbID = idbHashRecords[idbIndex].id;
				let idbHash = idbHashRecords[idbIndex].hash;

				if (serverID === idbID) {
					if (serverHash !== idbHash) {
						mismatchedHashes.push({clientHash: idbHashRecords[idbIndex], serverHash: serverHashRecords[serverIndex]});
					}

					serverIndex += 1;
					idbIndex += 1;
				} else if (serverID < idbID) {
					serverHashesToStore.push(serverHashRecords[serverIndex]);

					serverIndex += 1;
				} else {
					clientHashesToStore.push(idbHashRecords[idbIndex]);

					idbIndex += 1;
				}
			}

			// one of the arrays has been fully processed, so process the remainder of the other
			// array if necessary
			for (; serverIndex < serverHashRecords.length; serverIndex += 1) {
				serverHashesToStore.push(serverHashRecords[serverIndex]);
			}

			for (; idbIndex < idbHashRecords.length; idbIndex += 1) {
				clientHashesToStore.push(idbHashRecords[idbIndex]);
			}

			setClientOnlyHashes(clientHashesToStore);
			setServerOnlyHashes(serverHashesToStore);
			setDifferingHashes(mismatchedHashes);
		};

		// queries the log database to show a(n ugly) representation of a user's account history
		async function showLogs() {
			const getLogsRoute = API_URL + "/logs?userID=" + props.userID;

			const response = await fetch(
				getLogsRoute,
				{
					method: 'GET',
					headers: { 'Content-Type': 'application/json' }
				}
			);
			const responseData = await response.json();

			setUserLogs(responseData);
		}

		showVerificationReceipt();
		showLogs();
	}, [props]);

	return <div className="hashReport">
			<div className="hashReportItem thing">
				<h3>Client-Only Hashes</h3>
				{(clientOnlyHashes === undefined || clientOnlyHashes.length === 0) ?
					<p>None</p>
				:
					<div className="hashComparison">
						<table>
							<thead>
								<tr>
									<th>ID</th>
									<th>Hash</th>
								</tr>
							</thead>
							<tbody>
								{clientOnlyHashes.map((hash: HashRecord) => (
									<tr key={hash.id}>
										<td>{hash.id}</td>
										<td>{hash.hash}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				}
			</div>
			<div className="hashReportItem">
				<h3>Server-Only Hashes</h3>
				{(serverOnlyHashes === undefined || serverOnlyHashes.length === 0) ?
					<p>None</p>
				:
					<div className="hashComparison">
						<table>
							<thead>
								<tr>
									<th>ID</th>
									<th>Hash</th>
								</tr>
							</thead>
							<tbody>
								{serverOnlyHashes.map((hash: HashRecord) => (
									<tr key={hash.id}>
										<td>{hash.id}</td>
										<td>{hash.hash}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				}
			</div>
		<div className="hashReportItem">
			<h3>Client/Server Mismatching Hashes</h3>
			{(differingHashes === undefined || differingHashes.length === 0) ?
				<p>None</p>
			:
				<div className="hashComparison">
					<table>
						<thead>
							<tr>
								<th>ID</th>
								<th>Client Hash</th>
								<th>Server Hash</th>
							</tr>
						</thead>
						<tbody>
							{differingHashes.map((hashPair: HashRecordPair) => (
								<tr key={hashPair.serverHash.id}>
									<td>{hashPair.serverHash.id}</td>
									<td>{hashPair.clientHash.hash}</td>
									<td>{hashPair.serverHash.hash}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			}
		</div>
		<div className="hashReportItem">
			<h3>Change Log</h3>
			{(userLogs === undefined || userLogs.length === 0) ?
				<>None</>
			:
				<div className="logTable">
					<table>
						<thead>
							<tr>
								<th>ID</th>
								<th>Table</th>
								<th>Log</th>
							</tr>
						</thead>
						<tbody>
							{userLogs.map((log: Log) => (
								<tr key={log.id}>
									<td>{log.id}</td>
									<td>{log.table_name}</td>
									<td>{log.log_entry}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			}
		</div>
	</div>
}

export default HashComparisonReport;

