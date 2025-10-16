import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { auth } from 'express-openid-connect';
import homeRoutes from './routes/home.routes.js'
import roundRoutes from './routes/round.routes.js'
import ticketRoutes from './routes/ticket.routes.js'
import { syncUser } from './middleware/userSync.js';
import { pool } from './db.js';

dotenv.config();

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
}

const port = process.env.PORT

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
    const modelsDir = path.join(__dirname, 'models');
    const sqlFiles = ['Users.sql', 'Rounds.sql', 'Tickets.sql'];
    for(const file of sqlFiles){
        const schema = fs.readFileSync(path.join(modelsDir, file), 'utf8');
        try{
            await pool.query(schema);
        }
        catch(err){
            console.error(`Error initializing ${file}:`, err);
        }
    }
    console.log(`Database initialized successfully`);
}
initializeDatabase().catch(err => console.error('Error initializing database', err));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(auth(config));

app.use(syncUser);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/', homeRoutes);
app.use('/', roundRoutes);
app.use('/', ticketRoutes);



app.listen(port, () => {
    console.log(`Server running at ${process.env.BASE_URL || `http://localhost:${port}`}`);

});