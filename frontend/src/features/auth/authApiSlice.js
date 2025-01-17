import { apiSlice } from "../../app/api/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        login: builder.mutation({
            query: credentials => ({
                url: '/auth',
                method: 'POST',
                body: { ...credentials }
            })
        }),
        logout: builder.query({
            query: () => ({
                url: '/logout',
                method: 'GET',  
            })
        }),
        refresh: builder.query({
            query: () => ({
                url: '/',
                method: 'GET',  
            })
        }),

    })
})

export const {
    useLoginMutation,
    useLogoutQuery,
    useRefreshQuery,
} = authApiSlice