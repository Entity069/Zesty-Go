# Zesty

A Food Ordering System in Nodejs+MySQL.

## Installation

1. Install [Docker](https://www.docker.com/)

2. Clone the repo:

```bash
git clone https://github.com/Entity069/Zesty-Go
```

3. Populate the .env.sample files and rename them to .env. If you plan to use Gmail, then you need to use [app-specific passwords](https://support.google.com/accounts/answer/185833?hl=en).

4. Build and run the services defined in `docker-compose.yml`

```bash
docker compose up --build
```

The server will be up at http://localhost:3000