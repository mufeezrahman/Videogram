import jwt from "jsonwebtoken"
import asyncHandler from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"

//Here res is not being used in the function below so we can replace it with _ 
export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")

        if(!token){
            throw new ApiError(401,"Unauthorized request");
        }

        const decoded_token= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decoded_token?._id).select("-password -refreshToken")

        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user=user;//From here we get access to the user object which we can use in logoutUser function
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }
})