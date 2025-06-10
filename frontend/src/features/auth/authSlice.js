import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState: { user: null, token: null, isProfPicInDb: 0, userId: null },
    reducers: {
        setCredentials: (state, action) => {
            const { user, accessToken, isProfPicInDb, userId } = action.payload
            state.user = user
            state.token = accessToken
            state.isProfPicInDb = isProfPicInDb
            state.userId = userId
        },
        updateProfilePic: (state, action) => {
            if (state.user) {
                state.user.profilePicUri = action.payload.profilePicUri
            }
        },
        logOut: (state, action) => {
            state.user = null
            state.token = null
            state.userId = null
        }
    },

})

export const { setCredentials, updateProfilePic, logOut } = authSlice.actions

export default authSlice.reducer

export const selectCurrentUser = (state) => state.auth.user?.username
export const selectCurrentToken = (state) => state.auth.token
export const selectisProfPicInDb = (state) => state.auth.isProfPicInDb
export const selectCurrentUserId = (state) => state.auth.userId
