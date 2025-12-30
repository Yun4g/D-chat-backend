export const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Authorization header missing');
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).send('Token missing');
    }
    next();
};
