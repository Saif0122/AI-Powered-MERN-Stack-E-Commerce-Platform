export const faviconHandler = (req, res, next) => {
    if (req.originalUrl && req.originalUrl.includes('favicon.ico')) {
        return res.status(204).end();
    }
    next();
};

export default faviconHandler;
