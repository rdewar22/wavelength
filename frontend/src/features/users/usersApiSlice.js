import { apiSlice } from "../../app/api/apiSlice"

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        findUsers: builder.query({
            query: (searchString) => ({
                url: '/users',   
                params: { searchString },
                method: 'GET'
            }),
        }),
        getUser: builder.query({
            query: id => `/users/?userId=${id}`,
            keepUnusedDataFor: 5,
        }),
        newProfPic: builder.mutation({
            query: ({ userName, formData }) => {
                return {
                    url: `/users/${userName}`,
                    method: 'PUT',
                    body: formData,
                };
            },
        }),
        
    
    })
})

export const {
    useFindUsersQuery,
    useGetUserQuery,
    useNewProfPicMutation,
} = usersApiSlice 