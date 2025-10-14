import { Router } from "express";
import { pool } from "../db.js";
import pkg from 'express-openid-connect';
import qrcode from 'qrcode';
import dotenv from 'dotenv';
dotenv.config();

const { requiresAuth } = pkg;
const router = Router();

router.get('/buy-ticket', requiresAuth(), (req, res) => {
    res.render('ticket', { user: req.oidc.user });
});

router.get('/ticket/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM Tickets WHERE ticket_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).send('Ticket not found');
        }
        const user_card_id = await pool.query('SELECT card_id FROM Users WHERE user_id = $1',
            [result.rows[0].user_id]
        );
        const winning_numbers = await pool.query('SELECT winning_numbers FROM Rounds WHERE round_id = $1',
            [result.rows[0].round_id]
        );
        const ticket = result.rows[0];
        ticket.ticket_numbers = ticket.ticket_numbers.join(' ');
        ticket.card_id = user_card_id.rows[0].card_id;
        ticket.winning_numbers = winning_numbers.rows[0].winning_numbers;
        res.render('ticketDetails', { ticket });
    } catch (err) {
        console.error('Error fetching ticket:', err);
        res.status(500).send('Internal Server Error');
    }
});


router.post('/save-ticket', async (req, res) =>{
    const user_id = req.oidc.user.sub;
    const {card_id, ticket_numbers} = req.body;
    const ticket_numbers_array = ticket_numbers.split(',').map(Number);
    try{
        const result = await pool.query('SELECT round_id FROM Rounds WHERE is_active = true');
        if(result.rows.length === 0){
            console.error('No active round found');
            return res.status(400).send('Bad Request');
        }
        const round_id = result.rows[0].round_id;
        const insertResult = await pool.query('INSERT INTO Tickets (ticket_numbers, user_id, round_id) VALUES ($1, $2, $3) RETURNING *',
        [ticket_numbers_array, user_id, round_id]);
        const ticket_id = insertResult.rows[0].ticket_id;

        await pool.query('UPDATE Users SET card_id = $1 WHERE user_id = $2',
            [card_id, user_id]
        );
        const ticketURL = `${process.env.BASE_URL}/ticket/${ticket_id}`;
        const qrDataUrl = await qrcode.toDataURL(ticketURL);
        res.render('ticketQrCode', { qrDataUrl , ticketURL });


    }catch(err){
        console.error('Error inserting ticket:', err);
        return res.status(500).send('Internal Server Error');
    }
});



export default router;