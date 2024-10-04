import express from "express";
import cors from "cors";

import {
	usersGet,
	usersPost,
	userGet,
	custodiansGet,
	custodiansPost,
	userBequestsGet,
	bequestsPost,
	userHashesGet,
	userLogsGet
} from "./routeHandlers"

const PORT = 8080;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/users", usersGet);
app.post("/users", usersPost);
app.get("/users/:userID", userGet);

app.get("/custodians", custodiansGet);
app.post("/custodians", custodiansPost);

app.get("/bequests", userBequestsGet);
app.post("/bequests", bequestsPost);

app.get("/hashes", userHashesGet);
app.get("/logs", userLogsGet);

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

