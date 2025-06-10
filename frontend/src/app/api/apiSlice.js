import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials, logOut } from '../../features/auth/authSlice'

const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:3500',
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

    if (result?.error?.originalStatus === 403) {
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
            api.dispatch(logOut())
        }
    }

    return result
}

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Post', 'User', 'Audio'],
    endpoints: builder => ({})
})