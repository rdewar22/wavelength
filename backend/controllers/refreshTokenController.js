const User = require('../model/User');
const jwt = require('jsonwebtoken');

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;

    // 1. Check for cookie existence more gracefully
    if (!cookies?.jwt) {
        // Clear any invalid cookie that might exist
        res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            secure: process.env.NODE_ENV === 'production'
        });

        return res.status(401).json({
            message: 'Authentication required: No refresh token provided'
        });
    }

    const refreshToken = cookies.jwt;

    // 2. Additional JWT format validation
    if (typeof refreshToken !== 'string' || !refreshToken.trim()) {
        res.clearCookie('jwt', {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
            secure: process.env.NODE_ENV === 'production'
        });
        return res.status(400).json({
            message: 'Invalid token format'
        });
    }

    const cookieOptions = {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        secure: process.env.NODE_ENV === 'production'
    };

    // Clear the old cookie immediately
    res.clearCookie('jwt', cookieOptions);

    try {
        const foundUser = await User.findOne({ refreshToken }).exec();

        // Detected refresh token reuse!
        if (!foundUser) {
            try {
                const decoded = jwt.verify(
                    refreshToken,
                    process.env.REFRESH_TOKEN_SECRET
                );

                if (decoded?.username) {
                    console.log('Attempted refresh token reuse by user:', decoded.username);
                    await User.findOneAndUpdate(
                        { username: decoded.username },
                        { $set: { refreshToken: [] } }
                    );
                }
            } catch (jwtError) {
                // JWT verification failed - token is invalid/expired
                console.log('Invalid refresh token during reuse detection:', jwtError.message);
            }

            return res.status(403).json({
                message: 'Forbidden: Invalid refresh token'
            });
        }

        const newRefreshTokenArray = foundUser.refreshToken.filter(rt => rt !== refreshToken);

        // Evaluate JWT
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        if (foundUser.username !== decoded.username) {
            return res.status(403).json({
                message: 'Forbidden: User mismatch'
            });
        }

        // Refresh token is valid
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

        // Update user with new refresh token
        foundUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
        
        try {
            await foundUser.save();
        } catch (saveError) {
            if (saveError.name === 'VersionError') {
                // Handle concurrent modification - retry with fresh document
                console.log('Concurrent refresh token update detected, retrying...');
                const freshUser = await User.findById(foundUser._id);
                if (freshUser) {
                    const freshTokenArray = freshUser.refreshToken.filter(rt => rt !== refreshToken);
                    freshUser.refreshToken = [...freshTokenArray, newRefreshToken];
                    await freshUser.save();
                } else {
                    throw new Error('User not found during retry');
                }
            } else {
                throw saveError;
            }
        }

        // Set new secure cookie
        res.cookie('jwt', newRefreshToken, {
            ...cookieOptions,
            maxAge: 24 * 60 * 60 * 1000
        });

        // Send response
        const responseData = {
            accessToken,
            userName: decoded.username,
            userId: foundUser._id,
            isProfPicInDb: foundUser.isProfPicInDb || false,
            user: {
                _id: foundUser._id,
                username: foundUser.username,
                isProfPicInDb: foundUser.isProfPicInDb || false
            }
        };
        console.log('Refresh response:', { isProfPicInDb: foundUser.isProfPicInDb, username: foundUser.username });
        return res.json(responseData);

    } catch (err) {
        // Handle JWT verification errors
        if (err.name === 'TokenExpiredError') {
            console.log('Expired refresh token from user');
            // Remove the expired token from the user's record
            try {
                const userWithExpiredToken = await User.findOne({ refreshToken }).exec();
                if (userWithExpiredToken) {
                    userWithExpiredToken.refreshToken = userWithExpiredToken.refreshToken.filter(
                        rt => rt !== refreshToken
                    );
                    await userWithExpiredToken.save();
                }
            } catch (dbError) {
                console.error('Database error when removing expired token:', dbError);
            }

            return res.status(403).json({
                message: 'Session expired. Please log in again.'
            });
        }

        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({
                message: 'Invalid token'
            });
        }

        if (err.name === 'MongoError' || err.name === 'MongooseError') {
            console.error('Database error during refresh:', err);
            return res.status(503).json({
                message: 'Database temporarily unavailable'
            });
        }

        if (err.name === 'VersionError') {
            console.error('Concurrent refresh token update:', err);
            return res.status(409).json({
                message: 'Concurrent request detected. Please try again.'
            });
        }

        console.error('Refresh token error:', err);
        return res.status(500).json({
            message: 'Internal server error during authentication'
        });
    }
}

module.exports = { handleRefreshToken };