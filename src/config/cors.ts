import { CorsOptions } from "cors";

const whitelist = [process.env.FRONTEND_URL, "http://localhost:5173"];

export const corsConfig: CorsOptions = {
    origin: function(origin, callback) {

        if(!origin || whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Error de cors'));
        }
    }
}