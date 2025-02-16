import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const verifyjwt = async (req, res, next) => {
    
    const token = req.cookies?.accessToken || req.header("authorization")?.replace("Bearer ", "");

    if (!token) {
         throw new ApiError(401, "Unauthenticated");
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded._id).select("-password -refreshToken");
        if(!user){   
            throw new ApiError(401, "Unauthenticated");

        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthenticated" });
    }




}

export {verifyjwt}