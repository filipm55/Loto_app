import { pool } from '../db.js';

export async function syncUser(req, res, next) {
    if (req.oidc && req.oidc.isAuthenticated() && !req.userSynced) {
        const user = req.oidc.user;
        try {
            await pool.query(`
                INSERT INTO users (user_id, nickname, email)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id)
                DO UPDATE SET nickname = EXCLUDED.nickname, email = EXCLUDED.email
            `, [user.sub, user.nickname, user.email]);
            req.userSynced = true;
            console.log('User synced successfully!');
        } catch (err) {
            console.error('Error syncing user:', err);
        }
    }
    next();
}
