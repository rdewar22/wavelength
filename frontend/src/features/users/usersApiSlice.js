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
        uploadAudio: builder.mutation({
            query: ({ username, audioFile }) => {
                const formData = new FormData();
                formData.append('audio', audioFile);
                
                return {
                    url: `/users/${username}/audio`,
                    method: 'POST',
                    body: formData,
                    // Don't need to set Content-Type header as it will be automatically set with boundary
                };
            },
            // Transform the response to make it easier to use in components
            transformResponse: (response) => {
                return {
                    success: true,
                    audioUrl: response.fileUrl,
                    key: response.key,
                    message: response.message
                };
            },
            // Handle errors consistently
            transformErrorResponse: (response) => {
                return {
                    success: false,
                    error: response.data?.message || 'Failed to upload audio file'
                };
            }
        }),
    })
})

export const {
    useFindUsersQuery,
    useGetUserQuery,
    useNewProfPicMutation,
    useUploadAudioMutation,
} = usersApiSlice 