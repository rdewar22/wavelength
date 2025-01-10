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
            query: ({ userName, formData }) => {
                
                console.log("formdata:", formData);
                console.log("formdata.file:", formData.file);
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
    useGetUsersQuery,
    useGetUserQuery,
    useNewProfPicMutation,
} = usersApiSlice 