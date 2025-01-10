import { apiSlice } from "../../app/api/apiSlice"

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getUsers: builder.query({
            query: () => '/users',
            keepUnusedDataFor: 5,
        }),
        getUser: builder.query({
            query: id => `/users/?userId=${id}`,
            keepUnusedDataFor: 5,
        }),
        newProfPic: builder.mutation({
            query: ({ userName, imageUri }) => ({
                url: `/users/${userName}`,
                method: 'PUT',
                body: imageUri
            }),
        })
    
    })
})

export const {
    useGetUsersQuery,
    useGetUserQuery,
    useNewProfPicMutation,
} = usersApiSlice 