import mongoose,{ Schema } from "mongoose";
import {connect} from '../db/mongoconnection.js';
import validator from 'validator';
import {getUserIdFromToken} from '../services/authorization.js';

connect();

const userSchema = new Schema({
    user_id: {
        type:String,
        unique:true,
        required:true,
        trim:true,
    },
    username: {
        type:String,
        unique:true,
        required:true,
        trim:true
    },
    name: {
        type: String,
        required: false,
    },
    email:{
        type: String,
        unique:true,
        required:true,
        lowercase:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalid Email")
            }
        }
    },
    picture:{ type: String},
    isPro: { type: Boolean, default: false },
    user_platform: {
        name: {
            type: String, 
            enum: ['FIGMA', 'SKETCH', 'CANVA'],
            require: true,
            default: 'FIGMA'
        },
        id: String,
        access_allowed: Boolean,
        number_of_images_generated: Number,
        user_platform_images:  [{
            imageSchema: {
                type: Schema.Types.ObjectId, ref: 'Images'
            }
        }
        ]
    },
    user_images:  [{
        imageSchema: {
            type: Schema.Types.ObjectId, ref: 'Images'
        }
    }
    ],
    // user ka account ka credentials b store krna ka usna login with kia use kia ha login with figma ya google ya twitter schema ma 
},{
    timestamps: true,
})

const imagesSchema = new Schema({
    image_url: { type: String, require: true },
    type: {
        type: String, 
        enum: ['IMAGE_TO_IMAGE', 'TEXT_TO_IMAGE'], 
        require: true },
    prompt: {
        type: String, 
        require: true
    },
    seed: {
        type: String
    },
    customizations: {
        guidance_scale: Number,
        height: Number,
        num_inference_steps: Number,
        width: Number,
    },
    requested_from: { 
        type: String 
    },
    favourite: {
        type: Boolean 
    },
    
},{
        timestamps: true,
    })

userSchema.statics.isUserExist = async function({
    email,
    name,
    nickname,
    picture,
}, access_token) {
    
    try{
        console.log(email)
        const user = await User.findOne({email});
        console.log('finding user', user);

        if(!user){
            const user_id = getUserIdFromToken(access_token);
            const newUser = User.create({
                user_id,
                username:nickname,
                email,
                name,
                picture,
            })
            
            return newUser;
        }

        return user;

    }catch(err){
        console.log(err);
        throw new Error(err);
    }
}

const Images = mongoose.model('Image', imagesSchema);
const User = mongoose.model('User', userSchema);

export {Images, User}