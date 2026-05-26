import {ApiResponse} from "../utils/api-response.utils.js";
import { asyncHandler } from "../utils/async-handler.utils.js";

const healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(200, {message: "API is healthy"}, null)
    );
});

export {healthCheck};