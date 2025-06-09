const User = require('../model/User');

const handleLogout = async (req, res) => {
    // On client, also delete the accessToken

    const cookies = req.cookies;
    const cookieOptions = {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        secure: process.env.NODE_ENV === 'production'
    };
    
    if (!cookies?.jwt) return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;

    // Is refreshToken in db?
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
        res.clearCookie('jwt', cookieOptions);
        return res.sendStatus(204);
    }

    // Delete refreshToken in db
    foundUser.refreshToken = foundUser.refreshToken.filter(rt => rt !== refreshToken);
    const result = await foundUser.save();

    res.clearCookie('jwt', cookieOptions);
    res.sendStatus(204);
}

module.exports = { handleLogout }