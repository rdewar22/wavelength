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
        logout: builder.mutation({
            query: () => ({
                url: '/logout',
                method: 'POST',  
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
    useLogoutMutation,
    useRefreshQuery,
} = authApiSlice