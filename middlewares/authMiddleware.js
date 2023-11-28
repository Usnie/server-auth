import jwt from "jsonwebtoken"
import tokenService from "../services/tokenService.js"

function authMiddleware(req,res,next){
    const authorizationHeaders = req.headers.authorization
    if(!authorizationHeaders){
        return res.status(401).json({message:'Client is not authorized'})
    }
    const accessToken = authorizationHeaders.split(' ')[1]
    if(!accessToken){
        return res.status(401).json({message:'Client is not authorized'})
    }
    const user = tokenService.validateAccessToken(accessToken)
    if(!user){
        return res.status(401).json({message:'Client is not authorized'})
    }
    req.body.user = user
    next()
}

export default authMiddleware;