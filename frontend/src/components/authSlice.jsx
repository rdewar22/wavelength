import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState: { user: null, token: null, isProfPicInDb: false, userId: null, profilePicUri: null },
    reducers: {
        setCredentials: (state, action) => {
            const { user, accessToken, isProfPicInDb, userId } = action.payload
            state.user = user
            state.token = accessToken
            state.isProfPicInDb = isProfPicInDb
            state.userId = userId
            // Set profile pic URI with cache busting if user has profile pic
            if (isProfPicInDb && user?.username) {
                state.profilePicUri = `https://robby-wavelength-test.s3.us-east-2.amazonaws.com/profile-pictures/${user.username}_profPic.jpeg?v=${Date.now()}`
            } else {
                state.profilePicUri = null
            }
        },
        updateProfilePic: (state, action) => {
            const { profilePicUri } = action.payload
            if (state.user) {
                state.user.profilePicUri = profilePicUri
                state.profilePicUri = profilePicUri
                state.isProfPicInDb = true
            }
        },
        logOut: (state, action) => {
            state.user = null
            state.token = null
            state.userId = null
            state.isProfPicInDb = false
            state.profilePicUri = null
        }
    },

})

export const { setCredentials, updateProfilePic, logOut } = authSlice.actions

export default authSlice.reducer

export const selectCurrentUserName = (state) => state.auth.user?.username
export const selectCurrentToken = (state) => state.auth.token
export const selectisProfPicInDb = (state) => state.auth.isProfPicInDb
export const selectCurrentUserId = (state) => state.auth.userId
export const selectProfilePicUri = (state) => state.auth.profilePicUri
