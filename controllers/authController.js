import User from "../models/userModel.js";
import bcryptjs from 'bcryptjs'
import tokenService from "../services/tokenService.js";
import userDto from "../dtos/userDto.js";
import Token from "../models/tokenModel.js";
class AuthControllers {
    async registration (req, res) {
        try{
        const {username, email, password} = req.body;
        const candidate = await User.findOne({$or:[{username},{email}]})
        if(candidate){
          return res.json('User with such username or email is already existed')
        }
        const hashPassword = await bcryptjs.hash(password,7)
        const newUser = await User.create({username,email,password:hashPassword})
        const userD = new userDto(newUser)
        const tokens = tokenService.generateToken({...userD})
        // await Token.create({user:userD.id,refreshToken:tokens.refreshToken})
        await tokenService.saveToken({userId:userD.id,refreshToken:tokens.refreshToken})
        res.cookie('refreshToken',tokens.refreshToken,{maxAge:30*24*60*60*1000,httpOnly:true})
        res.status(201).json({accesToken:tokens.accessToken,userD})
        }
        catch(e){
            console.log(e.message)
        }
    }

    async login (req,res){
        try{
            const{username,password} = req.body //req recieve from client
            const user = await User.findOne({username})
            if(!user){
                return res.json({message:`User with username ${username} not found`})
            }
            const unhashedPassword = await bcryptjs.compare(password,user.password)
            if(!unhashedPassword){
                return res.json({message:`Password is incorrect`})
            }
        const userD = new userDto(user)
        const tokens = tokenService.generateToken({...userD})
        // await Token.create({user:userD.id,refreshToken:tokens.refreshToken})
        await tokenService.saveToken({userId:userD.id,refreshToken:tokens.refreshToken})
        res.cookie('refreshToken',tokens.refreshToken,{maxAge:30*24*60*60*1000,httpOnly:true})
        res.json({accesToken:tokens.accessToken,userD})
        }
        catch(e){
            console.log(e.message)
        }
    }

    async logout (req, res) {
        try{
        const {refreshToken} = req.cookies
        if(!refreshToken){
            return res.status(401).json({message:'Refresh token is not exist'})
        }
        await Token.deleteOne({refreshToken})
        res.clearCookie('refreshToken')
        res.status(202).json({message:'Refresh token is deleted'})
        }catch(e){
            console.log(e.message);
        }
      }

    async refresh(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
            if(!refreshToken){
                return res.status(401).json({message:'Refresh token is not exist'})
            }
            const userData = tokenService.validateRefreshToken(refreshToken);
            const tokenDatabase = await Token.findOne({refreshToken})
            if(!userData || !tokenDatabase){
                return res.status(401).json({message:'Refresh token is not exist'})
            }
            const user = await User.findById(userData.id);
            const userD = new userDto(user);
            const tokens = tokenService.generateToken({...userD});
            tokenDatabase.refreshToken = tokens.refreshToken
            await tokenDatabase.save() 
            res.cookie('refreshToken', tokens.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true});
            return res.json({accesToken:tokens.accessToken,userD})
        } catch (e) {
            next(e);
        }
    }

}

export default new AuthControllers();