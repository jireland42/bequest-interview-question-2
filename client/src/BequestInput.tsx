import React from "react";

import NameSelector from "./NameSelector";
import CustodianSelector from "./CustodianSelector";
import { stringifyHash, storeRecordHash, storeAccountHash, readAccountHash } from "./ClientDB";

import "./stylesheets/BequestInput.css";

import { API_URL } from "./App";

type PropsType = {
	classToAdd: string;
};

function BequestInput(props: PropsType): React.ReactElement {
	async function updateData(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		// retrieve the form data
		const form = document.forms.namedItem("saveDataForm");

		if (form === null) { return; }

		const formData = new FormData(form);
		const userIDString = formData.get("submitted-name") as string;
		const custodianIDString = formData.get("submitted-custodian") as string;
		const accountString = formData.get("submitted-account") as string;
		const beneficiaryString = formData.get("submitted-beneficiary") as string;

		// build and send the data request to the server
		const postSaveDataRoute = API_URL + "/bequests";
		const userID = parseInt(userIDString);
		const accountHash = await readAccountHash(userID);
		
		const response = await fetch(
			postSaveDataRoute,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					"userID": userIDString,
					"custodianID": custodianIDString,
					"account": accountString,
					"beneficiary": beneficiaryString,
					"accountHash": accountHash
				})
			},
		);
		const data = await response.json();

		if (data.validated === false) {
			const element = document.getElementById("dataViewer");
			if (element != null) { element.style.backgroundColor="red"; }
			return;
		}

		// store the hash of the bequest record and the new account hash on the client
		await storeRecordHash(userID, data.id, stringifyHash(data.record_hash.data));
		await storeAccountHash(userID, stringifyHash(data.account_hash.data));

		window.location.reload();
	};

	const classes = `bequestInput ${props.classToAdd}`;

	return <div className={classes}>
		<h2>Store Data</h2>
		<form id="saveDataForm" className="saveDataForm" method="post" onSubmit={updateData}>
			<div className="dataInputs">
				<label>
					Name:
					<NameSelector />
				</label>
				<label>
					Custodian:
					<CustodianSelector />
				</label>
				<label>
					Account:
					<input name="submitted-account" />
				</label>
				<label>
					Beneficiary:
					<input name="submitted-beneficiary" />
				</label>
			</div>
			<button className="updateDataButton">
				Store Data
			</button>
		</form>
	</div>
}

export default BequestInput;

