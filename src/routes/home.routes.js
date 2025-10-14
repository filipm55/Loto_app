import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

router.get('/', async(req, res) => {
    let buyTicketLink = false;
    let roundCount = 0;
    let winning_numbers = null;
    try{
        const result = await pool.query('SELECT * FROM Rounds ORDER BY round_id DESC LIMIT 1');
        if(result.rows.length === 0){
            buyTicketLink = false;
        }
        else{
            if(result.rows[0].is_active === true){
                buyTicketLink = true;
            }
            roundCount = await pool.query(
                'SELECT COUNT(*) FROM tickets WHERE round_id = $1', [result.rows[0].round_id]
            );
            roundCount = roundCount.rows[0].count;
            if(result.rows[0].winning_numbers !== null){
                winning_numbers = result.rows[0].winning_numbers.join(' ');
            }
        }
    }catch(err){
        console.error('Error fetching active round:', err);
        return res.status(500).send('Internal Server Error');
    }

    res.render('index', 
        { user: req.oidc.user, 
        buyTicketLink: buyTicketLink,
        roundCount: roundCount,
        winning_numbers: winning_numbers
    });
})

export default router;