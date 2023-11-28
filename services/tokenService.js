import jwt from 'jsonwebtoken'
import Token from '../models/tokenModel.js'

class TokenService{
    generateToken(payload){
        const accessToken = jwt.sign(payload,process.env.ACCESS_TOKEN_KEY,{expiresIn:'30d'})
        const refreshToken = jwt.sign(payload,process.env.REFRESH_TOKEN_KEY,{expiresIn:'30d'})
        return {accessToken,refreshToken}
    }
    async saveToken({userId, refreshToken}) {
        const tokenData = await Token.findOne({user: userId});
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return await tokenData.save();
        }
        return await Token.create({user: userId, refreshToken});
    }
    validateAccessToken(accesshToken) {
        try {
            const user = jwt.verify(accesshToken, process.env.ACCESS_TOKEN_KEY);
            return user;
        } catch (e) {
            return null;
        }
    }
    validateRefreshToken(refreshToken) {
        try {
            const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
            return user;
        } catch (e) {
            return null;
        }
    }

}

export default new TokenService()