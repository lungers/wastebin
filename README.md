# WasteBin

yet another pastebin and url shortener

## Configuration

wastebin requires a few environment variables. create a `.env` file in the root directory with these variables

-   `TRUST_PROXY` - (optional) if you're running behind a reverse proxy, set this to `true`
-   `SESSION_SECRET` - the session cookie secret
-   `ENABLE_REGISTER` - (optional, default: true) if you want to disable registration, set this to `false`
-   `DB_HOST` - the host of your mysql server
-   `DB_USER` - the username of your mysql server
-   `DB_DATABASE` - the name of your database
-   `DB_PASSWORD` - the password of your mysql user
-   `DB_PORT` - (optional, default: 3306) the port of your mysql server

## Scripts

there are a few npm scripts to make it easier for you to get started

-   `start` - start the server
-   `build` - compile the typescript to javascript
-   `test` - run typescript with `--noEmit`

## Running Knex

wastebin uses knex for database migrations. you can run knex commands using the following commands

-   to create a new migration

```bash
npx knex --knexfile src/knexfile.ts migrate:make <name>
```

-   to run the latest migrations

```shell
$ npx knex --knexfile src/knexfile.ts migrate:latest
```

## Docker Compose

there is a docker compose file that has mysql and adminer to get a database up quickly. to start docker compose, run `docker-compose up -d` and set your database environment variables to

```
DB_HOST=localhost
DB_USER=wastebin
DB_DATABASE=wastebin
DB_PASSWORD=wastebin
```
