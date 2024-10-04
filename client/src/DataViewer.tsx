import { useState } from "react";

import NameSelector from "./NameSelector";
import HashComparisonReport from "./HashComparisonReport";
import { stringifyHash, readAccountHash } from "./ClientDB";

import "./stylesheets/DataViewer.css";

import { API_URL } from "./App";

type PropsType = {
	classToAdd: string;
};

type Bequest = {
	id: number;
	user: string;
	custodian: string;
	account: string;
	beneficiary: string;
};

function DataViewer(props: PropsType): React.ReactElement {
	const [userBequests, setUserBequests] = useState<Array<Bequest>>();
	const [showUserLogs, setShowUserLogs] = useState<boolean>(false);
	const [userID, setUserID] = useState<number>(0);

	// reads the user's ID from the select box
	async function readUserID(): Promise<undefined | number> {
		const form = document.forms.namedItem("queryDataForm");

		if (form === null) { return undefined; }

		const formData = new FormData(form);
		const userIDString = formData.get("submitted-name") as string;

		if (userIDString === null) { return undefined; }

		return parseInt(userIDString);
	}

	// makes an API call to the web server to retrieve and store a list of the user's bequests
	async function getUserBequests(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const ID = await readUserID();
		setUserID(ID ? ID : 0);

		if (ID === undefined) {
			setUserBequests([]);
			return;
		}

		const getBequestsRoute = API_URL + "/bequests?userID=" + ID;

		const response = await fetch(
			getBequestsRoute,
			{
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			}
		);

		const data = await response.json();
		setUserBequests(data);
	};

	// Compares the account hash the user has stored in their client with the account hash stored
	// in the database. If the hashes do not match then a flag is set to show more detailed
	// information.
	async function verifyData(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
		event.preventDefault();

		const ID = await readUserID();
		setUserID(ID ? ID : 0);

		if (ID === undefined) { return; }

		// read hash from server
		const getHashesRoute
			= API_URL + "/hashes?userID=" + ID + "&recordHashesRequested=false";

		let response = await fetch(
			getHashesRoute,
			{
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			}
		);

		let responseData = await response.json();
		const hashData: Array<number> = responseData.account_hash.data
		const serverAccountHash = stringifyHash(hashData);

		// read hash from client
		const idbAccountHash = await readAccountHash(ID);

		// compare hashes
		const element = document.getElementById("dataViewer");

		if (idbAccountHash === serverAccountHash) {
			if (element != null) { element.style.backgroundColor="chartreuse"; }
			return;
		} else {
			if (element != null) { element.style.backgroundColor="red"; }
			setShowUserLogs(true);
		}
	};


	const classes = `dataViewer ${props.classToAdd}`;

	return <div id="dataViewer" className={classes}>
		<h2>View Data</h2>
		<form onSubmit={getUserBequests} id="queryDataForm" className="queryDataForm">
			<label>
				Name:
				<NameSelector />
			</label>
			<div className="viewerInputButtons">
				<button>
					View Data
				</button>
				<button onClick={(event) => verifyData(event) }>
					Verify Data
				</button>
			</div>
		</form>
		{(userBequests === undefined || userBequests.length === 0) ?
			<div>
			</div>
		:
			<div>
				<table>
					<thead>
						<tr>
							<th>ID</th>
							<th>Owner</th>
							<th>Custodian</th>
							<th>Account</th>
							<th>Beneficiary</th>
						</tr>
					</thead>
					<tbody>
						{userBequests.map((bequest) => (
							<tr key={bequest.id}>
								<td>{bequest.id}</td>
								<td>{bequest.user}</td>
								<td>{bequest.custodian}</td>
								<td>{bequest.account}</td>
								<td>{bequest.beneficiary}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		}
		{showUserLogs ? <HashComparisonReport userID={userID}/> : <></>}
	</div>
}

export default DataViewer;

