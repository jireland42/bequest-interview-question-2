import { useEffect, useState } from "react";

import { API_URL } from "./App";

type Custodian = {
	id: number;
	name: string;
};

function CustodianSelector(): React.ReactElement {
	const [custodians, setCustodians] = useState<Array<Custodian>>();

	useEffect(() => {
		getCustodianNames();
	}, []);

	async function getCustodianNames() {
		const getCustodiansRoute = API_URL + "/custodians";

		const response = await fetch(
			getCustodiansRoute,
			{
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			}
		);

		const data = await response.json();
		setCustodians(data);
	};

	return <select name="submitted-custodian">
		{(custodians === undefined || custodians.length === 0) ?
			<></>
		 :
			{custodians}.custodians.map((custodian: Custodian) => (
				<option key={custodian.id} value={custodian.id}>{custodian.name}</option>
			))
		}
	</select>
};

export default CustodianSelector;

