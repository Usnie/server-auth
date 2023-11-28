import mongoose, { Schema, model } from "mongoose";
const TokenSchema = new Schema({
    user:{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    refreshToken:{
        type: String,
        required: true
    }
})

const Token = model('Token', TokenSchema);
export default Token;