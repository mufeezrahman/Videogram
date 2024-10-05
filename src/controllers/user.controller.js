import asyncHandler from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId)=>{


    //find the user by id
    const user = await User.findById(userId);

    //generate the access and refresh token for the user
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();


    //save the refresh token in database
    user.refreshToken=refreshToken;
    //validateBeforesave only saves the refreshtoken without any validation
    user.save({validateBeforeSave:false});


    return {
        accessToken,
        refreshToken
    }
}


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

    //Step 2
    if(
        [username,email,fullName,password].some((field)=> field.trim()==="")
    ){
        throw new ApiError(400,"All fields are required!");
    }

    //Step 3
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with same email or username already exists!");
    }


    console.log(req.files)
    //Step 4
    const avatarLocalPath = req.files?.avatar[0]?.path;

    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar File is required!");
    }

    // //Step 5
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
        email,
        password,
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

const loginUser= asyncHandler(async(req,res)=>{
    //accept input data

    const{email,username,password} = req.body;
    //username based or email based

    if(! (username || email)){
        throw new ApiError(400,"Username or email is required");
    }
    //find the user

    const user = await User.findOne({
        $or:[{email},{username}]
    });

    if(!user){
        throw new ApiError(404,"User does not exist!");
    }
    //check the password

    const isPasswordValid=await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid credentials.")
    }
    //generate access token and refresh token

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);

    // Now we dont need access to password and refreshToken in user object

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


    //send secure cookies
    //By enabling the below options cookies can be only modified by server not by the client
    const options ={
        httpOnly:true,
        secure:true
    }
    
    
    //give message
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User Logged In successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )

    const options = {
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(
            200,{},"User logged out successfully"
        )
    )
})

const refreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.RFERESH_TOKEN_SECRET
        )
    
        const user = await  User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401,"Invalid refresh token.")
        }
    
        if(incomingRefreshToken!==user?.refreshToken){
            throw new ApiError(401,"Refresh token has been expired.")
        }
    
        const options ={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshToken(user?._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,refreshToken:newRefreshToken
                },
                "Access token refreshed successfully."
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token.")
    }
})

export {registerUser,loginUser,logoutUser,refreshAccessToken}