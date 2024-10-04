import express from "express";
import {
	createUser,
	readUser,
	readUsers,
	createCustodian,
	readCustodians,
	createBequest, 
	readBequests,
	readHashes,
	readLogs
} from "./pool";

///////////////////////////////////////////////////////////////////////////////
//                             User Handlers
///////////////////////////////////////////////////////////////////////////////
//@ts-ignore // the request object is not needed
export function usersGet(req: express.Request, res: express.Response): void {
	readUsers(res);
};

export function usersPost(req: express.Request, res: express.Response): void {
	createUser(req, res);
};

export function userGet(req: express.Request, res: express.Response): void {
	readUser(req, res);
};

///////////////////////////////////////////////////////////////////////////////
//                           Custodian Handlers
///////////////////////////////////////////////////////////////////////////////
//@ts-ignore // the request object is not needed
export function custodiansGet(req: express.Request, res: express.Response): void {
	readCustodians(res);
};

export function custodiansPost(req: express.Request, res: express.Response): void {
	createCustodian(req, res);
};

///////////////////////////////////////////////////////////////////////////////
//                              Bequest Handlers
///////////////////////////////////////////////////////////////////////////////
export function userBequestsGet(req: express.Request, res: express.Response): void {
	readBequests(req, res);
};

export function bequestsPost(req: express.Request, res: express.Response): void {
	createBequest(req, res);
};

export function userHashesGet(req: express.Request, res: express.Response): void {
	readHashes(req, res);
};

export function userLogsGet(req: express.Request, res: express.Response): void {
	readLogs(req, res);
};

