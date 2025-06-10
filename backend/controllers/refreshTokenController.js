const User = require('../model/User');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    
    const cookieOptions = {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        secure: process.env.NODE_ENV === 'production'
    };
    
    res.clearCookie('jwt', cookieOptions);

    const foundUser = await User.findOne({ refreshToken }).exec();

    // Detected refresh token reuse!
    if (!foundUser) {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) return res.sendStatus(403); //Forbidden
                console.log('attempted refresh token reuse!')
                // Delete refresh tokens of hacked user
                const hackedUser = await User.findOneAndUpdate(
                    { username: decoded.username },
                    { $set: { refreshToken: [] } }
                );
                hackedUser.refreshToken = [];
                const result = await hackedUser.save();
            }
        )
        return res.sendStatus(403); //Forbidden
    }

    const newRefreshTokenArray = foundUser.refreshToken.filter(rt => rt !== refreshToken);

    // evaluate jwt 
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) {
                console.log('expired refresh token')
                foundUser.refreshToken = [...newRefreshTokenArray];
                const result = await foundUser.save();
            }
            if (err || foundUser.username !== decoded.username) return res.sendStatus(403);

            // Refresh token was still valid
            const roles = Object.values(foundUser.roles);
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": decoded.username,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '50m' }
            );

            const newRefreshToken = jwt.sign(
                { "username": foundUser.username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1d' }
            );
            // Saving refreshToken with current user
            foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
            const result = await User.findOneAndUpdate(
                { username: foundUser.username },
                { $set: { refreshToken: [...newRefreshTokenArray, newRefreshToken] } }
            );
            const userName = decoded.username

            // Creates Secure Cookie with refresh token
            const cookieOptions = {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
                secure: process.env.NODE_ENV === 'production'
            };
            
            res.cookie('jwt', newRefreshToken, cookieOptions);
            const userId = foundUser._id;

            // Send access token, user info, and user data
            res.json({ 
                accessToken, 
                userName, 
                userId,
                user: {
                    _id: foundUser._id,
                    username: foundUser.username,
                    profilePicUri: foundUser.profilePicUri
                }
            })
        }
    );
}

module.exports = { handleRefreshToken }