import { createSlice } from "@reduxjs/toolkit";


const authSlice = createSlice({
    name: 'auth',
    initialState: { user: null, token: null, isProfPicInDb: 0 },
    reducers: {
        setCredentials: (state, action) => {
            const { user, accessToken, isProfPicInDb } = action.payload
            state.user = user
            state.token = accessToken
            state.isProfPicInDb = isProfPicInDb
        },
        logOut: (state, action) => {
            state.user = null
            state.token = null
        }
    },

})

export const { setCredentials, logOut } = authSlice.actions

export default authSlice.reducer

export const selectCurrentUser = (state) => state.auth.user
export const selectCurrentToken = (state) => state.auth.token
export const selectisProfPicInDb = (state) => state.auth.isProfPicInDb
