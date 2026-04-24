export const sendResponse = (
    res: any,
    {
        statusCode = 200,
        success = true,
        message = "",
        data = null,
    }
) => {
    res.status(statusCode).json({
        success,
        message,
        data,
    });
};