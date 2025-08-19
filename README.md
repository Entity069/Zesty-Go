# Zesty

A Food Ordering System in Go+MySQL.

## Installation

- Install [Docker](https://www.docker.com/)

- Clone the repo:

```bash
git clone https://github.com/Entity069/Zesty-Go
```

- Install dependencies, build the server and run the database server.
```bash
make deps
make run
make db-up
```

- (Recommended) Alternatively, you can use Docker.
```bash
make docker-up
make migrate-up # run migrations
make seeds-up # add seeding data
```

The frontend will be live at http://127.0.0.1:3000
The backend will be live at http://127.0.0.1:3001

## Note
- You will need to populate the .env.sample files and rename them to .env.

- For email verification: If you plan to use Gmail, then you need to use [app-specific passwords](https://support.google.com/accounts/answer/185833?hl=en). Currently, sending email uses the `net/smtp` library which only support STARTTLS.