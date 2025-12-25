# LoadMaster API

Backend for LoadMaster - HTTP Load Testing Platform.

## Tech Stack

- NestJS
- GraphQL (Apollo Server)
- PostgreSQL (Sequelize)
- RabbitMQ
- JWT Authentication

## Development

```bash
npm install

# Start PostgreSQL & RabbitMQ
docker-compose up -d

# Run migrations
npm run db:migrate

# Start dev server
npm run start:dev
```

API: http://localhost:4000/graphql

## Environment Variables

```env
PORT=4000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=loadmaster
DB_PASSWORD=loadmaster123
DB_DATABASE=loadmaster_db

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Workers
NUMBER_OF_WORKERS=3
WORKER_TIMEOUT_SECONDS=300
```

## Docker

```bash
docker build -t loadmaster-api .
docker run -p 4000:4000 loadmaster-api
```
