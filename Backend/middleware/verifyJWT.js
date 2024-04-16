import jwt from 'jsonwebtoken';
import '../config/loadEnv.js';

export const verifyJWT = (req, res, next) => {
   const authHeader = req.headers.authorization || req.headers.Authorization;
   if(!authHeader?.startsWith('Bearer'))
        return res.status(401).json({ Unauthorized: "missing  token"});

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.userId = decoded.userInfo.id;
        req.role = decoded.userInfo.role;
        next();

    } catch(err) {
        return res.status(401).json({ Unauthorized: "wrong or expired token"});
    }
    
}