import jwt from "jsonwebtoken";
export const authMiddleware = (req, res, next) => {
    const token = req.cookies?.accessToken;
    if (!token) {
        return res.status(401).json({ message: 'Access Token missing' });
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_JWT_SECRET);
        req.userId = decoded.id;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
