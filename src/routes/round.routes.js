import { Router } from "express";
import { pool } from "../db.js";
import { expressjwt } from 'express-jwt';
import jwks from 'jwks-rsa';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

const checkJwt = expressjwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${process.env.ISSUER_BASE_URL}/.well-known/jwks.json`
  }),
  audience: process.env.AUDIENCE,
  issuer: `${process.env.ISSUER_BASE_URL}/`,
  algorithms: ['RS256']
});

router.post('/new-round', checkJwt, async (req, res) => {
    try{
        const result = await pool.query('SELECT round_id FROM Rounds WHERE is_active = true');
        if(result.rows.length !== 0){
            res.status(204).send('No content');
        }else{
            await pool.query('INSERT INTO Rounds (is_active) VALUES (true)');
            res.send('New round started');
        }
    }catch(err){
        console.error('Error starting new round:', err);
        return res.status(500).send('Internal Server Error');
    }
});

router.post('/close', checkJwt, async (req, res) => {
    try{
        const result = await pool.query('SELECT is_active FROM Rounds WHERE is_active = true');
        if(result.rows.length === 0){
            res.status(204).send('No content');
        }else{
            await pool.query('UPDATE Rounds SET is_active = false WHERE is_active = true');
            res.send('Round closed');
        }
    }catch(err){
        console.error('Error closing round:', err);
        return res.status(500).send('Internal Server Error');
    }
});

router.post('/save-results', checkJwt, async (req, res) => {
    const {numbers} = req.body;
    try{
        const result = await pool.query('SELECT * FROM Rounds ORDER BY round_id DESC LIMIT 1');
        if(result.rows.length === 0){
            res.status(400).send('Bad request');
            return;
        }
        if(result.rows[0].is_active === true){
            res.status(400).send('Bad request');
            return;
        }
        if(result.rows[0].winning_numbers !== null){
            res.status(400).send('Bad request');
            return;
        }
        await pool.query('UPDATE Rounds SET winning_numbers = $1 WHERE round_id = $2',
            [numbers, result.rows[0].round_id]
        );
        res.status(204).send('No content');
    }catch(err){
        console.error('Error saving results:', err);
        return res.status(500).send('Internal Server Error');
    }
});

export default router;