import { createSlice } from "@reduxjs/toolkit";

const registrationSlice = createSlice({
    name: 'registration',
    initialState: { user: null, pwd: null },
    reducers: {
        setCredentials: (state, action) => {
            const { user, pwd } = action.payload
            state.user = user
            state.pwd = pwd
        },
    },

})

export const { setCredentials, logOut } = registrationSlice.actions

export default registrationSlice.reducer

export const selectCurrentUser = (state) => state.auth.user
export const selectCurrentToken = (state) => state.auth.token
