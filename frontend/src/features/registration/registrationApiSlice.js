import { apiSlice } from "../../app/api/apiSlice";

export const registrationApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        register: builder.mutation({
            query: credentials => ({
                url: '/register',
                method: 'POST',
                body: { ...credentials }
            })
        })
    })
})

export const {
    useRegisterMutation
} = registrationApiSlice