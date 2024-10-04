import { useEffect, useState } from "react";

import { API_URL } from "./App";

type User = {
	id: number;
	name: string;
};

function NameSelector(): React.ReactElement {
	const [users, setUsers] = useState<Array<User>>();

	useEffect(() => {
		getUsernames();
	}, []);

	async function getUsernames() {
		const getUsersRoute = API_URL + "/users";

		const response = await fetch(
			getUsersRoute,
			{
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			}
		);

		const data = await response.json();
		setUsers(data);
	};

	return <select name="submitted-name">
		{(users === undefined || users.length === 0) ?
			<></>
		 :
			{users}.users.map((user: User) => (
				<option key={user.id} value={user.id}>{user.name}</option>
			))
		}
	</select>
};

export default NameSelector;

