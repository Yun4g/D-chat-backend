export const globalErrorHandler = (err, req, res, next) => {
    console.error(err.stack);
    if (res.statusCode === 500) {
        res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
    else {
        res.status(res.statusCode).json({ error: err.message });
    }
    next();
};
