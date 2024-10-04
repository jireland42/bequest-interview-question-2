import BequestInput from "./BequestInput";
import DataViewer from "./DataViewer";
import NewEntityInput, { EntityPropsType } from "./NewEntityInput";

import "./stylesheets/App.css";

export const API_URL = "http://localhost:8080";

function App() {
	const userNameProps: EntityPropsType = {
		heading: "Add Users",
		label: "Name",
		formName: "saveUserNameForm",
		requestKey: "userName",
		endpoint: "/users"
	};
	const custodianNameProps: EntityPropsType = {
		heading: "Add Custodians",
		label: "Name",
		formName: "saveCustodianNameForm",
		requestKey: "custodianName",
		endpoint: "/custodians"
	};

	return (
		<div className="app">
			<div className="appSection entityCreationContainers">
				<NewEntityInput props={userNameProps} />
				<NewEntityInput props={custodianNameProps} />
			</div>
			<BequestInput classToAdd="appSection" />
			<DataViewer classToAdd="appSection" />
		</div>
	);
}

export default App;
