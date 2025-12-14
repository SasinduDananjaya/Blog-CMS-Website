# Blog CMS - Full Stack Application

Blog content management system built with NestJS (Backend) and Next.js (Frontend).

![Blog CMS](https://img.shields.io/badge/Blog-CMS-blue)
![NestJS](https://img.shields.io/badge/NestJS-10.x-red)
![Next.js](https://img.shields.io/badge/Next.js-14.x-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.x-teal)



## 🛠 Tech Stack

### Backend
- **NestJS**
- **Prisma** - ORM for database access
- **PostgreSQL** - Relational database via **Supabase**
- **Supabase Storage** - Image storage
- **JWT** - Authentication with JSON Web Tokens
- **Swagger** - API documentation

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript**
- **Tailwind CSS** - CSS framework
- **shadcn/ui** - UI component library
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client

---

## ✨ Features

- 🔐 **Authentication**: JWT-based login/register with role-based access
- 👤 **User Roles**: Admin and User roles with different permissions
- 📝 **Post Management**: Create, read, update, delete posts with images
- 📁 **Categories**: Organize posts by categories (Admin only)
- 🏷️ **Tags**: Tag posts (Admin only)
- 📤 **Image Upload**: Upload images to Supabase Storage
- 🔍 **Search & Filter**: Search posts, filter by category/status
- 📄 **Pagination**: Paginated post listings
- 📱 **Responsive**: Responsive UI design
- 📚 **API Docs**: Swagger documentation

---


---

## 📋 Prerequisites

- **Node.js** >= 18.x 
- **npm** >= 9.x
- **Git**
- **Supabase Account**

---

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


## 💻 Frontend Setup
Navigate to Frontend Directory
```bash
cd frontend
```

Install Dependencies
```bash
npm install
```

Create a .env file in the frontend/ directory
- sample frontend .env
```bash
NEXT_PUBLIC_API_URL="http://localhost:[YOUR_BACKEND_PORT]/api"

```

Start Development Server
```bash
npm run dev

```

The frontend will be running at:
- http://localhost:3000

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

## 🔐 Admin User Credentials
```bash
Email: admin@gmail.com
Password: Admin1234
```
