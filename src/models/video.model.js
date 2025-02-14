import mongoose,{Schema} from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const vedioSchema = new Schema({
    title:{
        type:String,
        required:true,
        trim:true,
        index:true,
    },
    description:{
        type:String,
        required:true,
        trim:true,
    },
    thumbnail:{
        type:String,
        required:true,
    },
    videoFile:{
        type:String,//cloudinary url
        required:true,
    },
    duration:{
        type:String,
        required:true,
    },
    views:{
        type:Number,
        default:0,
    },
    isPublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
    },
    
},{timestamps:true});

vedioSchema.plugin(mongooseAggregatePaginate)

export const Vedio = mongoose.model("Vedio",vedioSchema);
