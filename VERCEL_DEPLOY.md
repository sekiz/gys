# Vercel Deployment Guide

This project consists of a React Frontend and an Express Backend. The best way to deploy on Vercel is to deploy them as two separate projects linked together.

## Prerequisites

1.  **Cloud Database**: You need a PostgreSQL database accessible from the internet.
    *   **Recommended**: [Neon.tech](https://neon.tech) (Free Tier is excellent for Vercel) or Supabase.
    *   Get your `DATABASE_URL`. It usually looks like `postgres://user:pass@host/db?sslmode=require`.

2.  **GitHub Repository**: Push this code to a GitHub repository.

## Part 1: Deploy Backend

1.  Log in to [Vercel](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Root Directory**: Click "Edit" and select `backend`.
5.  **Environment Variables**: Add the following:
    *   `DATABASE_URL`: (Your cloud database URL)
    *   `JWT_SECRET`: (A long random string, or generate one)
    *   `JWT_REFRESH_SECRET`: (Another long random string)
    *   `BCRYPT_SALT_ROUNDS`: `10`
    *   `NODE_ENV`: `production`
6.  Click **Deploy**.
7.  Once deployed, copy the **Deployment URL** (e.g., `https://gys-backend.vercel.app`). You will need this for the frontend.

## Part 2: Deploy Frontend

1.  Go back to Vercel Dashboard.
2.  Click **Add New...** -> **Project**.
3.  Import the **same** GitHub repository again.
4.  **Root Directory**: Click "Edit" and select `frontend`.
5.  **Framework Preset**: It should auto-detect "Create React App". If not, select it.
6.  **Environment Variables**: Add the following:
    *   `REACT_APP_API_URL`: Paste your Backend URL from Part 1 (e.g., `https://gys-backend.vercel.app`). **Important:** Do NOT add a trailing slash `/` unless your code expects it (usually no slash).
7.  Click **Deploy**.

## Part 3: Verify

1.  Visit your Frontend URL (e.g., `https://gys-frontend.vercel.app`).
2.  Try to Register/Login.
    *   If you get a database error, ensure your `DATABASE_URL` is correct and the database has been migrated.
3.  **Database Migration**:
    *   Vercel functions don't run migrations automatically on deploy lightly.
    *   You should run migrations **locally** against your PRODUCTION database URL once:
        ```bash
        # In your local terminal, inside /backend folder
        export DATABASE_URL="your-production-database-url"
        npx prisma migrate deploy
        ```
    *   OR add `"postinstall": "prisma migrate deploy && prisma generate"` in package.json (but require DB connection during build). The safe way is running locally or via a Vercel Command.

## Notes
-   **Images**: If you use local file uploads for images, they **will not persist** on Vercel. Vercel functions are ephemeral. You must change your image handling to use a cloud storage like **AWS S3**, **Cloudinary**, or **Firebase Storage**.
-   **Websockets**: Vercel Serverless limits execution time (10s default). Long polling or websockets might not work well. Standard HTTP requests are fine.
