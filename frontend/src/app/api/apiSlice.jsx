import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logOut } from '../../features/auth/authSlice'

const baseQuery = fetchBaseQuery({
    baseUrl: 'wavelength-backend-eq3t.onrender.com',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token
        if (token) {
            headers.set("authorization", `Bearer ${token}`)
        }
        return headers
    }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)

    if (result?.error?.status === 403) {
        // console.log('sending refresh token')
        // send refresh token to get new access token
        const refreshResult = await baseQuery({
            url: '/refresh',
            method: 'POST'
        }, api, extraOptions)
        
        if (refreshResult?.data) {
            // store the new token with the complete user object
            api.dispatch(setCredentials({ 
                user: refreshResult.data.user,
                accessToken: refreshResult.data.accessToken,
                userId: refreshResult.data.userId
            }))
            // retry the original query with new access token
            result = await baseQuery(args, api, extraOptions)
        } else {
            // Handle various refresh errors
            if (refreshResult?.error?.status === 500) {
                console.error('Server error during token refresh:', refreshResult.error);
                // Don't logout on server errors, just return the error
                return refreshResult;
            } else if (refreshResult?.error?.status === 409) {
                console.log('Concurrent refresh request detected, retrying...');
                // For 409 errors, we could retry or just return the error
                return refreshResult;
            } else if (refreshResult?.error?.status === 403 || refreshResult?.error?.status === 401) {
                // Invalid/expired refresh token
                api.dispatch(logOut())
            } else {
                // Other errors during refresh
                console.error('Unexpected error during token refresh:', refreshResult?.error);
                api.dispatch(logOut())
            }
        }
    }

    return result;
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Post', 'User', 'Audio'],
    endpoints: builder => ({})
})