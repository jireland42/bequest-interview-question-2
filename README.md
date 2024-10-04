# Tamper Proof Data

At Bequest, we require that important user data is tamper proof. Otherwise, our system can incorrectly distribute assets if our internal server or database is breached. 

**1. How does the client ensure that their data has not been tampered with?**
<br />
**2. If the data has been tampered with, how can the client recover the lost data?**


Edit this repo to answer these two questions using any technologies you'd like, there any many possible solutions. Feel free to add comments.

# Problem Submission

## Goals and Assumptions

When completing this task I noted a few things. First, the task was vague in terms of spec. There are two major ways to interpret this vagueness: ask for clarification or assume you just want to see how I interpret the requirement. Second, there was no indication with regards to length or level of completeness. I decided to go with a mostly-complete application to showcase that I can produce work across the full stack. I could have opted for a more minimalist solution with more mocking, but I thought this showed more (for better or for worse).

I did leave a few sharp edges on both the front end and the back end. The cases are mostly about diminishing returns on what I'm showcasing. Two examples are the lack of parsing the log files and setting up database users with the correct permissions. In the first case, I figured parsing the data further than I did is doing more than required to show recovery capabilities. If this was expected of me, then I've made a poor call. In the second case, it was easier to work with the databases without the extra security or permissions.

In general, there are likely many security holes. I did not interpret this task as requiring production-ready code, so if I've missed the point of the exercise, that is unfortunate.


## Architecture and Technology

### Stored Data

The application stores data on users, the entities that hold the users' assets (custodians), and records of the assets held by the custodians.

### Architecture

The application consists of three (or four) major components (depending on how you count). The main interface is through a browser that will run the client. The client connects to a Node and Express web server that handles routing and connects to a pair of databases. There is a main Postgres database used to store records about the users and their bequests, and there is another Postgres database that stores logs from the main database. Lastly, IndexedDB is used by the client to store some local data (the fourth conceptual component).

### Front End

First, the user creates an entity that represents them on the server. This is done under __Add Users__. This will send the user's name to the server where a hash will be produced from it that represents the state of the user's account. The hash is then stored with the user's data as well as transferred back to the client to be stored in IndexedDB.

Next, a user can create a custodian entity on the server that represents a holder of an asset by entering the custodian's name under __Add Custodians__. While not implemented, this table should be insert and delete only, disallowing updates since the custodians are shared across users. This data shouldn't change out from under users in a production setting, but for this it felt okay to leave out.

Once at least one user and one custodian has been created, a bequest can be created by adding account and beneficiary information under __Store Data__. I have chosen a rather heavy-handed approach here that would normally require a fair amount of discussion in terms of UX. When bequest data is stored, the client and server compare the account hashes. If there is a mismatch, then the data has changed since the last time the user interacted with the system. If the hashes do not match, then the user is notified (in this case the component turns red), and the data is ot stored. If the hashes match, then the data is sent to the server where it is hashed, stored with its hash, and then the new hash is combined with the old account hash to have an updated representation of the user's account. The two new hashes (hashed bequest record and account hash) are returned to the client to be stored in IndexedDB.

Note, since normally there would only be a single collection containing a user's hashes on a given machine, the hashes are divided up into collections that match their ID in the database.

Next the user can view their data by clicking the __View Data__ button. Regardless of whether or not the data is consistent, the user can view all bequests that are associated with the chosen user.

Lastly, the user can click the button __Verify Data__ to run the same verification check that runs on update. In this case, however, more information is given. There are three cases when comparing client and server hashes: a hash exists only on the client, a hash exists only on the server, and there is a hash for the same identifier on the client and the server, but they do not match. When the user verifies their data, these three cases are shown, together with a log output that would (in principle if it looked nicer) allow a user to verify the changes that have taken place in their account.

### Back End

On the back end, whenever data is inserted, deleted, or updated in the users or bequests table (any table with an associated hash value), I have enabled and tied into Postgres's native change data capture (CDC) tools to get a log of the queries. This log is sent to the secondary database, which could be anywhere from the same machine to somewhere off-premise. Again, while the permissions have not been implemented, the database table containing the logs should have the UPDATE and DELETE privileges revoked for the relevant users so this becomes an append-only log. This log, in principle, gives the ability to rebuild the current start of the database from a point in the past.

### Build

NOTE: the project assumes it is in the directory __bequest-interview-question-2__, which is hardcoded in the run script (```/scripts/run.sh```) and the attack and convenience scripts in the same directory to determine the name of the container. If this part fails, change "bequest-interview-question-2" to the name of the top-level directory of the project.

There are three main components to the build, the client, the server, and the databases. The databases have been containerized for convenience to demo. To spin up the databases, navigate to the root folder and run

	./scripts/start.sh

This will run the docker-compose file that will spin up the main database, spin up the logging database, and configure and restart the main database to enable the CDC to begin. The databases in the containers are made available at __port 7654__ for the main database and __port 8765__ for the logging database.

To run the server, navigate to the server directory in the top-level directory of the project. Run

	npm run start

to spin up the server.

Similarly, to run the client, navigate to the client directory in the top-level directory of the project and run

	npm run start

## Demo

To get an idea of how things work, I've put together the makings of a demo. To try it out, follow these instructions. Note the names do not matter, but the first user should create the first bequest.


FE - Front End


#### Part 1 - Single Piece of Record Attack

* Changes the beneficiary of the first user's first bequest.

FE: Add Users: Anna

FE: Add Custodians: BMO

FE: Store Data: *any string for account and benefactor* (use Anna and BMO)

FE: Store Data: ** (use Anna and BMO)

FE: View Data (Anna)

FE: Verify Data (Anna - should work)

	./scripts/single_bequest_attack.sh

FE: View Data (Anna - notice a beneficiary is different)

FE: Verify Data (Anna - should fail and show one mismatching hash)

REFRESH THE PAGE

#### Part 2 - Attack on Entire Account

* Changes the beneficiary of all of the second user's bequests.

FE: Add Users: Robert

FE: Add Custodians: Ledger

FE: Add Custodians: Metamask

FE: Store Data: *any string for account and benefactor* (use Robert and *)

FE: Store Data: ** (use Robert and *)

FE: Store Data: ** (use Robert and *)

FE: Store Data: ** (use Robert and *)

FE: View Data (Robert)

FE: Verify Data (Robert - should work)

	./scripts/account_attack.sh

FE: View Data (Robert - notice the beneficiaries are all different)

FE: Verify Data (Robert - should fail and show all hashes mismatching)

REFRESH THE PAGE

#### Part 3 - Adding A New Bequest Record

* Adds a new bequest to the third user.

FE: Add Users: Jesse

FE: View Data (Jesse)

FE: Verify Data (Jesse - should work)

	./scripts/augmentation_attack.sh

FE: View Data (Jesse - notice there's an extra row)

FE: Verify Data (Jesse - should fail and show a server-only hash)

## Additional Caveats

The database is not persistent since I didn't tie it to a volume. On subsequent runs, to ensure the client and server databases are in sync, delete any data under IndexedDB in the web tools of your browser.

## Cleaning Up

After stopping the process in the main window, the application leaves two docker containers running. To view them use

	docker ps

To stop and remove them use

	docker compose stop
	docker compose rm

You'll need to verify the correct (2) containers are being removed. If something goes wrong and you need to abort, use

	docker rm {CONTAINER ID}

where CONTAINER ID comes from ```docker ps```.

Lastly, the application does not shut down gracefully, so it leaves the IndexedDB databases in the browser. They are not configured to try and stick around, but you can delete them manually using the developer tools, depending on your device.


## Final Thoughts

### Questions
**1. How does the client ensure that their data has not been tampered with?**

This application solves this problem by allowing the user to store a representation of their data on the server. By comparing their copy of the data's representation with the server's data, the user can be confident the data has not been changed out from under them. This implementation verifies the data on all client-initiated changes to ensure legitimate changes cannot mask changes made by an attacker by being hashed together and stored.

<br />
**2. If the data has been tampered with, how can the client recover the lost data?**

If the data has been tampered with, a second database that logs the changes in the main database. This information can be used to reconstruct any records to bring them to the point of the last legitimate changes. The implementation leaves much to be desired in terms of automating the recovery process, but the data required to reconstruct the database state is contained in the logs.

### Reflection
There are lots of places that can be improved and discussed.

The most obvious one is finishing some sort of implementation for doing the rollbacks since it currently requires technical support. One of the best solutions would be to make it such that the user gets to choose which updates were legitimate and then roll back and re-apply just the legitimate ones.

Another major pain point with this implementation is the user of IndexedDB. In principle, this data can disappear at any time. The user should likely be able to fall back to verifying the data is correct in the worst case scenario, but there still should be support added for downloading the hashes so they can be transferred to another device without leaving the user's possession. Using the filesystem is another option, but I didn't think it had cross-browser support when I started this (I should have verified this). Using a native application would allow for proper filesystem storage, but the client could still lose their device. One last option here would be to store the hashes on a public (probably layer 2) blockchain. Depending on the size of the assets and the potential for loss, this could be a legitimate consideration.

There are plenty of other smaller things not implemented such as deleting and updating the records, not doing a full page reload on data submission and properly handling clearing the textboxes, giving users feedback when their data was submitted successfully, being more helpful identifying what went wrong when their data wasn't stored, extracting components to make the biggest component more manageable, and plenty of security considerations not made. I hope that's fine for the format.

Enjoy the gaudy fall-themed application!
