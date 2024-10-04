import { storeAccountHash } from "./ClientDB";

import "./stylesheets/EntityInput.css";

import { API_URL } from "./App";

export type EntityPropsType = {
	heading: string;
	label: string;
	formName: string;
	requestKey: string;
	endpoint: string;
};

type PropsWrapper = {
	props: EntityPropsType;
};

type Body = {
	[key: string]: string;
};

function NewEntityInput(wrappedProps: PropsWrapper): React.ReactElement {
	const props = wrappedProps.props;

	async function storeInputData(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const form = document.forms.namedItem({props}.props.formName);

		if (form === null) { return; }

		// prepare request
		const postDataRoute = API_URL + {props}.props.endpoint;

		const formData = new FormData(form);
		const dataString = formData.get("submitted-data") as string;

		const body: Body = {};
		body[props.requestKey] = dataString;

		// create entity on server
		const response = await fetch(
			postDataRoute,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({body})
			},
		);

		// retrieve the account hash if a user was created
		if (props.requestKey === "userName") {
			const data = await response.json();

			// remove parentheses
			const rowString = data.row.slice(1, data.row.length - 1);;

			// extract row values
			const values = rowString.split(",");
			const userID = parseInt(values[0]);
			const accountHash = values[1];

			// store hash on the client
			await storeAccountHash(userID, accountHash.slice(4, accountHash.length - 1));
		}

		window.location.reload();
	};

	return <div className="entityInput">
		<h2>{props.heading}</h2>
		<form id={props.formName} className="saveDataForm" method="post" onSubmit={storeInputData}>
			<label>
				{props.label}:
				<input type="text" name="submitted-data" />
			</label>
			<button className="storeDataButton">
				Save Data
			</button>
		</form>
	</div>
};

export default NewEntityInput;

