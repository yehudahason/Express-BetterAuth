export function errorHandler(err, req, res, next) {
    console.error(err); // log error
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
}
//# sourceMappingURL=errorHandler.js.map