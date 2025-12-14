## 🛠 Backend Tech Stack

- **NestJS**
- **Prisma** - ORM for database access
- **PostgreSQL** - Relational database via **Supabase**
- **Supabase Storage** - Image storage
- **JWT** - Authentication with JSON Web Tokens
- **Swagger** - API documentation

## 🚀 Backend Setup

Navigate to Backend Directory
```bash
cd backend
```

Install Dependencies
```bash
npm install
```

Create a .env file in the backend/ directory
- sample backend .env
```bash
DATABASE_URL="postgresql://postgres.asoixqanywiqceulehjf:[YOUR_PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

DIRECT_URL="postgresql://postgres.asoixqanywiqceulehjf:[YOUR_PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres"

PORT=YOUR_PORT_NUMBER

JWT_SECRET=YOUR_SECRET
JWT_EXPIRATION=YOUR_DEFINED_EXPIRATION_TIME

FRONTEND_URL=YOUR_FRONTEND_URL (Ex: http://localhost:3000)
NODE_ENV="development"

SUPABASE_URL=YOUR_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_KEY
SUPABASE_BUCKET_NAME=YOUR_BACKET_NAME
```

Generate Prisma Client
```bash
npx prisma generate
```

Run Database Migrations
```bash
npx prisma migrate dev --name init
```

Seed Database
```bash
npx prisma db seed
```

Create Supabase Storage Bucket with proper name

Start Development Server
```bash
npm run start:dev
```
The backend will be running at:

- API: http://localhost:[YOUR_PORT]/api
- Swagger Docs: http://localhost:[YOUR_PORT]/api/docs



## 🗝️ Getting Supabase Credentials

- Go to Supabase Dashboard
- Create a new project or select existing
- Go to Settings → Database for connection strings
- Go to Settings → API for:
```bash
SUPABASE_URL (Project URL)
SUPABASE_SERVICE_ROLE_KEY (service_role key)
```

- Go to Storage and create a bucket with [YOUR_NAME] (set to public)
