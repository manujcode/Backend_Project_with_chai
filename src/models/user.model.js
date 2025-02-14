import mongoose  ,{Schema} from "mongoose";
import { type } from "os";
import jwt from "jsonwebtoken";
const userSchema = new Schema({
    username :{
        type:string,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        index:true,
    },
    email:{
        type:string,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
    },
    fullname:{
        type:string,
        required:true,
        trim:true,
        index:true,
    },
    avtar:{
        type:string,
         required:true, 
        },
        coverImage:{
            type:string,
        },
    watchHistory:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],
    password:{
        type:string,
        required:[true,"password is required"],
    },
    refreshToken:{
        type:string,
    },




}
,{timestamps:true}
);

userSchema.pre("save",async function(next){

    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,8);
    }
    next();
});

userSchema.methods.generateAccessToken = async function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
    },
process.env.ACCESS_TOKEN_SECRET,
{
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
}
)
}

userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign({
        _id:this._id,
    },
process.env.ACCESS_TOKEN_SECRET,
{
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
}
)
}




export const User = mongoose.model("User",userSchema);


