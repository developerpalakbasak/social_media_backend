// userRoutes.js

import express from "express";
import { addBio, addlocation, createUser, deleteProfile, deleteUser, findUser, loginUser, resetPassword, searchUser, sendMailReq, suggestedUser, updateAvatarImage, updateUserInfo, userFromUserId, userInfo, userLogout, userName, userNameAvailability } from "../../../controllers/userController.js";
import { isAuthenticated } from "../../../middleware/auth.js";
import upload from "../../../middleware/multer.js";
const userRouter = express.Router();

// Unauth users Routes
userRouter.post("/register", createUser );
userRouter.post("/login", loginUser );
userRouter.post("/recover/find", findUser );
userRouter.post("/recover/send-mail", sendMailReq );
userRouter.put("/recover/:token", resetPassword);

// check username availablity
userRouter.post("/checkusername", userNameAvailability );

// Auth User Routes
userRouter.post("/addbio", isAuthenticated, addBio );
userRouter.post("/addlocation", isAuthenticated, addlocation );
userRouter.get("/info", isAuthenticated, userInfo );
userRouter.get("/logout", isAuthenticated, userLogout );

// Suggested user to follow
userRouter.get("/suggesteduser", isAuthenticated, suggestedUser)
userRouter.get("/search", isAuthenticated, searchUser );


// Update user profile photo 
userRouter.post("/updateavatar", isAuthenticated, upload.single("image"), updateAvatarImage)

userRouter.post("/updateuserinfo", isAuthenticated, updateUserInfo );
userRouter.delete("/deleteprofile", isAuthenticated, deleteProfile)

// user delete
userRouter.delete("/deleteuser", isAuthenticated, deleteUser)

userRouter.get("/@:username", isAuthenticated, userName );
userRouter.get("/:id", isAuthenticated, userFromUserId );

export default userRouter;
