import { Request, Response, NextFunction } from "express";





export const authMiddleware = (req: Request , res : Response, next : NextFunction) => {
        const authHeader = req.headers.authorization as string | undefined;
        if (!authHeader) {
            return res.status(401).send('Authorization header missing');
       }
    
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).send('Token missing');
      }

      next();

 }