import { apiSlice } from "../app/api/apiSlice";

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        findUser: builder.query({
            query: (searchString) => ({
                url: '/publicUsers',   
                params: { searchString },
                method: 'GET'
            }),
            providesTags: (result, error, arg) => [
                { type: 'User', id: 'LIST' },
                ...(result || []).map(user => ({ type: 'User', id: user._id }))
            ]
        }),
        getUser: builder.query({
            query: id => `/users/?userId=${id}`,
            keepUnusedDataFor: 5,
            providesTags: (result, error, id) => [
                { type: 'User', id }
            ]
        }),
        newProfPic: builder.mutation({
            query: ({ userName, formData }) => {
                return {
                    url: `/users/${userName}`,
                    method: 'PUT',
                    body: formData,
                };
            },
            invalidatesTags: (result, error, { userName }) => [
                { type: 'User', id: 'LIST' },
                // We need to invalidate by username since we don't have userId here
                // This will cause a re-fetch of user data
                'User'
            ],
            // Add response transformation to include the new profile picture URL
            transformResponse: (response, meta, { userName }) => {
                return {
                    ...response,
                    profilePicUri: `https://robby-wavelength-test.s3.us-east-2.amazonaws.com/profile-pictures/${userName}_profPic.jpeg?v=${Date.now()}`
                };
            }
        }),
        isProfPicInDb: builder.query({
            query: (userName) => `/publicUsers/${userName}/isProfPicInDb`,
            keepUnusedDataFor: 5,
        }),
    })
})

export const {
    useFindUserQuery,
    useGetUserQuery,
    useNewProfPicMutation,
    useIsProfPicInDbQuery,
} = usersApiSlice 