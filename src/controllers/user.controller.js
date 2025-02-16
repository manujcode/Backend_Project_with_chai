import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
const registerUser = asyncHandler( async(req,res)=>{

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    
    const {username, email , password,fullname} = req.body;

    if((!username || !email || !password|| !fullname) ||([username, email , password,fullname].some((field)=>field?.trim() === ""))){
        console.log(req.body)

        throw new  ApiError(409,"All fields are required");
    }
    console.log(req.files,"dckjdcn")
   
    const userExists = await User.findOne({$or:[{username},{email}]})

    if(userExists){
        throw new ApiError(409,"user with this username or email already exits");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
      
    let coverImageLocalPath = null;

    if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avtar j file is required")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if(!avatar){
    console.log(avatarLocalPath)
    throw new ApiError(400,"Avtar  j file is required")
   }




    const user = await User.create(
        { 
            fullname,
            avatar:avatar.url,
            coverImage:coverImage?.url || null,
            email,
            password,
            username:username.toLowerCase()

        }
    )
 
    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createUser){
        throw new ApiError( 500,"Some thing went wrong while registering user")

    }
    
    return res.status(201).json(
        new ApiResponse(200,createUser,"User rigister successfully")
    )
})

const generateAccessAndRefereshTokens = async(userId)=>{
    try {  
    const user =await User.findById(userId)
    console.log(user)
    const accessToken =  user.generateAccessToken();
    const refreshToken =  user.generateRefreshToken();
     
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave:false}); 
     
    return {accessToken,refreshToken} 

    } catch (error) {
         console.log(error)
        throw new ApiError(500,"Error in generating tokens",)
    }

}


const loginUser = asyncHandler(async(req,res)=>{
    
     // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const {email,username,password}= req.body;

    if(!email && !username){
        throw new ApiError(400,"Email or username is required")
    }

    const user = await User.findOne({$or:[{email},{username}]})
    if(!user){
        throw new ApiError(400,"User not found")
    }

    const isPasswordMatch = await user.isPasswordCorrect(password);

    if(!isPasswordMatch){
        throw new ApiError(400,"Password is incorrect")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefereshTokens(user._id);
     
    const logginUser = await User.findById(user._id).select("-password -refreshToken");

    const option ={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,option)
    .cookie("refreshToken",refreshToken,option)
    .json(new ApiResponse(200,logginUser,"User logged in successfully"))

})
 

const logoutUser = asyncHandler(async(req,res)=>{
    // clear cookies
    // send response
     await User.findByIdAndUpdate(req.user._id,{
        $unset:{
            refreshToken:1
        },
     },{
        new:true
    })

    const option ={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",option)
    .clearCookie("refreshToken",option)
    .json(new ApiResponse(200,{},"User logged out successfully"))
})
 
const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthenticated req ")
    }
     
    try{
        const decoded = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decoded?._id)

        if(!user){
            throw new ApiError(401,"Unauthenticated req ")
        } 

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Unauthenticated req ")
        }

        const {accessToken,refreshToken} = await generateAccessAndRefereshTokens(user._id);

        const option ={
            httpOnly:true,
            secure:true
        }

        res.status(200)
        .cookie("accessToken",accessToken,option)
        .cookie("refreshToken",refreshToken,option)
        .json( new ApiResponse(200,{accessToken,refreshToken},"Access token refreshed successfully"))
    }
    catch(error){
        throw new ApiError(401, error?.message ||"Invalide refresh token")
    }


})


export {registerUser,loginUser,logoutUser,refreshAccessToken}