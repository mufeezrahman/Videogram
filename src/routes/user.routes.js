import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser,changePassword, getCurrentUser, updateAccountDetails, updateUserAvatar, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const userRouter = Router();

userRouter.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ])
    ,registerUser)

userRouter.route("/login").post(loginUser)

//secured routes
userRouter.route("/logout").post(verifyJWT,logoutUser)
userRouter.route("/refresh-token").post(refreshAccessToken)
userRouter.route("/change-password").post(verifyJWT,changePassword)
userRouter.route("/current-user").get(verifyJWT,getCurrentUser)
userRouter.route("/update-details").patch(verifyJWT,updateAccountDetails)
userRouter.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
userRouter.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserAvatar)
userRouter.route("/c/:username").get(verifyJWT,getUserChannelProfile)
userRouter.route("/history").get(verifyJWT,getWatchHistory)
export default userRouter;