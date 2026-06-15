# Multi-Service Production Deployment Guide (Render & Managed Databases)

This guide provides step-by-step instructions for deploying all components of the Resource Booking System to production.

---

## 1. Managed Databases Setup

### MongoDB Atlas Setup (for Node.js reviews-service)
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new shared cluster (free tier).
3. Under **Database Access**, create a user with read/write access.
4. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) since Render uses dynamic IP addresses (or configure active IP whitelists/peering).
5. Click **Connect** -> **Connect your application** and copy the Connection String (`MONGO_URI`):
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/reviews_db?retryWrites=true&w=majority
   ```

### Managed PostgreSQL Setup (for Spring Boot and FastAPI)
1. Provision a PostgreSQL instance on a cloud provider (e.g., Render PostgreSQL, AWS RDS, Supabase, Neon).
2. Note the database connection parameters:
   * **Host**: `<pg-host-name>`
   * **Port**: `5432`
   * **Database Name**: `bookslot`
   * **Username**: `postgres`
   * **Password**: `<pg-password>`
3. Run the initial DDL scripts located in the `database` folder to seed/initialize table schema (e.g., `users`, `resources`, `bookings`, `maintenance`).

---

## 2. Spring Boot Backend Service (Render Web Service)

Deploy the Spring Boot API service to a **Web Service** instance on Render.

* **Repository**: Link your Git Repository.
* **Root Directory**: `springboot-service`
* **Environment**: `Docker` or `Java` (Standard Maven build).
* **Build Command**:
  ```bash
  ./mvnw clean install -DskipTests
  ```
* **Start Command**:
  ```bash
  java -jar target/bookslot-0.0.1-SNAPSHOT.jar
  ```
* **Environment Variables**:
  * `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<pg-host-name>:5432/bookslot`
  * `SPRING_DATASOURCE_USERNAME`: `<pg-username>`
  * `SPRING_DATASOURCE_PASSWORD`: `<pg-password>`
  * `JWT_SECRET`: `<your-secure-random-jwt-signing-secret>`

---

## 3. FastAPI Room Availability Microservice (Render Web Service)

Deploy the room availability gateway service to a **Web Service** instance on Render.

* **Repository**: Link your Git Repository.
* **Root Directory**: `fastapi-gateway`
* **Environment**: `Python`
* **Build Command**:
  ```bash
  pip install -r requirements.txt
  ```
* **Start Command**:
  ```bash
  uvicorn main:app --host 0.0.0.0 --port $PORT
  ```
* **Environment Variables**:
  * `DB_HOST`: `<pg-host-name>`
  * `DB_PORT`: `5432`
  * `DB_NAME`: `bookslot`
  * `DB_USER`: `<pg-username>`
  * `DB_PASSWORD`: `<pg-password>`

---

## 4. Node.js Reviews Service (Render Web Service)

Deploy the Node.js Express service to a **Web Service** instance on Render.

* **Repository**: Link your Git Repository.
* **Root Directory**: `nodejs-service`
* **Environment**: `Node`
* **Build Command**:
  ```bash
  npm install
  ```
* **Start Command**:
  ```bash
  npm start
  ```
* **Environment Variables**:
  * `MONGO_URI`: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/reviews_db?retryWrites=true&w=majority`
  * `PORT`: `5000`
  * `NODE_ENV`: `production`

---

## 5. React Frontend (Render Static Site)

Deploy the React Vite application to a **Static Site** instance on Render.

* **Repository**: Link your Git Repository.
* **Root Directory**: `frontend`
* **Environment**: `Static Site`
* **Build Command**:
  ```bash
  npm install && npm run build
  ```
* **Publish Directory**: `dist`
* **Environment Variables**:
  * `VITE_API_URL`: Link to your deployed Spring Boot Web Service (e.g. `https://booking-springboot-service.onrender.com`)
  * `VITE_REVIEWS_API_URL`: Link to your deployed Node.js Web Service (e.g. `https://booking-nodejs-service.onrender.com`)

### Redirect Rules (For Client-Side Routing)
Since React Router is used, configure **Redirects/Rewrites** in the Render Static Site dashboard:
* **Source**: `/*`
* **Destination**: `/index.html`
* **Action**: `Rewrite`
This ensures routes like `/dashboard` load correctly when refreshed directly in the browser.
