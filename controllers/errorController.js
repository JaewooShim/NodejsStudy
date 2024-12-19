const httpStatus = require("http-status-codes");

module.exports = {
    logErrors: (error, req, res, next) => {
        console.log(error.stack);
        next(error);
    },
    pageNotFoundError: (req, res) => {
        let errorCode = httpStatus.StatusCodes.NOT_FOUND;
        res.status(errorCode);
        res.render("error");
    },
    internalServerError: (error, req, res, next) => {
        let errorCode = httpStatus.StatusCodes.INTERNAL_SERVER_ERROR;
        console.log(error.stack);
        res.status(errorCode);
        res.send(`${errorCode} | Sorry, our application is experiencing a problem!`);
    }
}