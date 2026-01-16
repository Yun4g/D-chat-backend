import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    userId?: any;
}

interface AccessTokenPayload extends JwtPayload {
  id: string;
  email: string;
}


export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {

    const token = req.cookies?.accessToken;
    if (!token) {
        return res.status(401).json({ message: 'Access Token missing' });
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_JWT_SECRET!) as AccessTokenPayload;
        req.userId = decoded.id;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
