import asyncHandler from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async(req,res) =>{
    //Step 1 Get user details from frontend
    //Step 2 Validate all fields(Correct format and check for empty entries)
    //Step 3 Check if the user already exists
    //Step 4 Chexk for images, check for avatar
    //Step 5 Upload them to cloudinary, avatar
    //Step 6 create a user object - create entry in db
    //Step 7 remove password and refresh token from response field
    //Step 8 Check for user creation
    //Step 9 Return response

    //Step 1 If data is coming from a URL or form
    const {username, email, fullName, password} = req.body;
    console.log("Email:",email);

    //Step 2
    if(
        [username,email,fullName,password].some((field)=> field.trim()==="")
    ){
        throw new ApiError(400,"All fields are required!");
    }

    //Step 3
    const existedUser = User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with same email or username already exists!");
    }

    //Step 4
    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(avatarLocalPath);

    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    console.log(coverImageLocalPath);

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar File is required!");
    }

    //Step 5
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avatar File is required!");
    }

    //Step 6 & 7
    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        username:username.toLowerCase()
    })
    //Removing the password and refreshToken
    const createdUser = await User.find(user._id).select(
        "-password -refreshToken"
    );

    //Step 8
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user!");
    }

    //Step 9
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully!")
    )

})

export {registerUser}