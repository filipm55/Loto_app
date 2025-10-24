# Loto App

A web application for managing lottery rounds and tickets built with **Node.js (Express)**, **PostgreSQL**, and **Auth0** authentication.  
The app allows users to log in via Auth0, buy lottery tickets, view ticket QR codes, and see winning numbers when a round is closed.

---

##  Features

-  **Auth0 Login** – Secure authentication with Auth0  
-  **Buy Ticket** – Authenticated users can buy tickets and generate a QR code  
-  **View Tickets** – Each ticket can be viewed via a unique QR code link  
-  **Rounds System** – Admin can start, close, and save results for rounds  
-  **Database Sync** – Users automatically stored/updated in PostgreSQL  
-  **EJS Templates** – Dynamic frontend rendering  
-  **M2M Authorization** – Secured API routes for admin actions via Auth0 Machine-to-Machine tokens  

---

## Tech Stack

| Technology | Description |
|-------------|--------------|
| **Node.js + Express** | Backend framework |
| **EJS** | Template engine for dynamic views |
| **PostgreSQL** | Relational database |
| **Auth0** | Authentication & authorization provider |
| **ngrok** | Temporary public tunnel for local testing |
| **qrcode** | Generates QR codes for tickets |

---

## Project Structure
```
src/
├── app.js                # Main Express app entry point
├── db.js                 # PostgreSQL connection setup
│
├── routes/
│   ├── home.routes.js    # Homepage, login, and public routes
│   ├── ticket.routes.js  # Ticket purchase, details, and QR code routes
│   └── round.routes.js   # Admin-only routes for new-round, close, save-results
│
├── middleware/
│   ├── userSync.js       # Sync Auth0 user info with PostgreSQL
│   └── checkJwt.js       # Middleware for verifying M2M tokens on admin routes
│
├── public/
│   ├── css/
│   │   ├── style.css             # Main page styles
│   │   ├── buy-ticket.css        # Ticket purchase page
│   │   ├── ticket-details.css    # Ticket details page
│   │   └── qr-view.css           # QR display page
│   └── scripts/
│       └── formValidation.js     # Client-side ticket input validation
│
└── views/
    ├── index.ejs                 # Homepage view
    ├── buy-ticket.ejs            # Ticket purchase form
    ├── ticket-details.ejs        # Ticket info page
    └── qr-view.ejs               # QR code view
```


---

##  Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/filim55/loto-app.git
cd loto-app
```
### 2. Install dependencies

```bash
npm install
```
### 3. Create a .env file
```ini
PORT=4010

# PostgreSQL
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=loto_db

# Auth0
CLIENT_ID=your_auth0_client_id
CLIENT_SECRET=your_auth0_client_secret
ISSUER_BASE_URL=https://your-domain.eu.auth0.com
BASE_URL=http://localhost:4010
SECRET=your_long_random_secret
AUDIENCE=your_audience
ISSUER_BASE_URL_M2M=https://your-domain.eu.auth0.com
```

### 4. Initialize Database

- create database: loto_db

## How It Works

1. User Login – User logs in via Auth0

2. Sync Middleware – User info is saved/updated in PostgreSQL

3. Active Round – If an active round exists, the buy ticket button appears

4. Buy Ticket – User fills the form, ticket is stored in DB, and QR code is generated

5. QR Code View – Ticket can be opened via public URL (e.g., /ticket/:id)

6. Admin Routes – /new-round, /close, use M2M Auth via Auth0, /save-results sends 6 winning numbers

##  M2M Authorization (Admin Endpoints)

Certain administrative endpoints require **Machine-to-Machine (M2M)** authentication using **Auth0**.

###  Protected Endpoints

| Endpoint | Method | Description | Auth Required |
|-----------|---------|--------------|----------------|
| `/new-round` | `POST` | Starts a new round | ✅ Yes |
| `/close` | `POST` | Closes the current active round | ✅ Yes |
| `/save-results` | `POST` | Saves winning numbers for the last closed round | ✅ Yes |

---

###  1. Obtain Access Token (Admin Only)

To access `/new-round` or `/close`, you need an **Access Token** from Auth0 using **Machine-to-Machine credentials**.

**Request:**
```bash
POST https://your-domain.eu.auth0.com/oauth/token
Content-Type: application/json

{
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "audience": "YOUR_AUDIENCE",
  "grant_type": "client_credentials"
}
```
**Response:**
```bash
{
  "access_token": "YOUR_ACCESS_TOKEN",
  "token_type": "Bearer"
}
```

### 2. Use the Token in Your Requests
**Start a New Round**
```bash
POST http://localhost:4010/new-round
Authorization: Bearer YOUR_ACCESS_TOKEN
```
**Close the Active Round**
```bash
POST http://localhost:4010/close
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### 3. Save Results
 
It accepts a JSON body containing an array of **6 numbers**:

```bash
POST http://localhost:4010/save-results
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```
```json
{
  "numbers": [3, 7, 14, 22, 30, 41]
}
```
If the round is valid (recently closed and no results yet), the numbers are stored in the database.

## Public Acces (Testing with ngrok)
To test your application publicly (e.g., for QR code redirection or Auth0 login), use ngrok.
1. Start your Express server locally:
```bash
npm start
```
2. Run ngrok on the same port (e.g. 4010):
```bash
ngrok http 4010
```
3. ngrok will generate a public URL:
```bash
https://abc123.ngrok.io
```
4. Use that URL in your .env file and Auth0 settings:
```ini
BASE_URL=https://abc123.ngrok.io
```
This allows your app to be accessed from any device, including mobile.
***Note: if you want to test it for Auth0 login, you will need to update callback and logout URI in your Auth0 application***