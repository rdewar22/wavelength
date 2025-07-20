import {
    createSelector,
    createEntityAdapter
} from "@reduxjs/toolkit";
import { sub } from 'date-fns';
import { apiSlice } from "../app/api/apiSlice";

const audiosAdapter = createEntityAdapter({
    selectId: (audio) => audio.id,
})

const initialState = audiosAdapter.getInitialState()


export const audiosApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getAllAudios: builder.query({
            query: () => ({
                url: `/publicAudios`,
                method: 'GET'
            }),
            transformResponse: responseData => {
                let min = 1;
                const loadedAudios = responseData.map(audio => ({
                    ...audio,
                    id: audio._id || audio.id,  // Ensure an id exists
                    date: audio?.date || audio?.createdAt || sub(new Date(), { minutes: min++ }).toISOString(),
                    reactions: audio?.reactions || { thumbsUp: 0, thumbsDown: 0 }
                }));
                return audiosAdapter.setAll(initialState, loadedAudios)
            },
            providesTags: (result, error, arg) => [
                { type: 'Audio', id: "LIST" },
                ...(result?.ids?.map(id => ({ type: 'Audio', id })) || [])
            ]
        }),
        getAudiosByUserId: builder.query({
            query: userId => ({
                url: `/publicAudios/${userId}`,
                method: 'GET'
            }),
            transformResponse: responseData => {
                let min = 1;
                const loadedAudios = responseData.map(audio => ({
                    ...audio,
                    id: audio._id || audio.id,  // Ensure an id exists
                    date: audio?.date || sub(new Date(), { minutes: min++ }).toISOString(),
                    reactions: audio?.reactions || { thumbsUp: 0, thumbsDown: 0 }
                }));
                return audiosAdapter.setAll(initialState, loadedAudios)
            },
            providesTags: (result, error, arg) => [
                { type: 'Audio', id: "LIST" },
                ...(result?.ids?.map(id => ({ type: 'Audio', id })) || [])
            ]
        }),
        uploadAudio: builder.mutation({
            query: ({ userId, title, file }) => {
                const formData = new FormData();
                formData.append('title', title);
                formData.append('file', file);

                return {
                    url: `/audios/${userId}`,
                    method: 'POST',
                    body: formData,
                };
            },
            invalidatesTags: [
                { type: 'Audio', id: "LIST" }
            ],
            transformResponse: (response) => {
                return {
                    success: true,
                    key: response.key,
                    title: response.title,
                    message: response.message
                };
            },
            transformErrorResponse: (response) => {
                return {
                    success: false,
                    error: response.data?.message || 'Failed to upload audio file'
                };
            }
        }),
        deleteAudio: builder.mutation({
            query: ({ audioId }) => ({
                url: `/audios/${audioId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Audio', id: "LIST" },
                { type: 'Audio', id: arg.audioId }
            ]
        }),
    })
})

export const {
    useGetAudiosByUserIdQuery,
    useUploadAudioMutation,
    useDeleteAudioMutation,
    useGetAllAudiosQuery,
} = audiosApiSlice

export const selectAudioResult = (userId) => audiosApiSlice.endpoints.getAudiosByUserId.select(userId)

// Creates memoized selector
export const selectAudioData = createSelector(
    [(state, userId) => audiosApiSlice.endpoints.getAudiosByUserId.select(userId)(state)],
    (audioResult) => audioResult?.data
)

// getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllAudios,
    selectById: selectAudioById,
    selectIds: selectAudioIds
} = audiosAdapter.getSelectors(state => {
    return selectAudioData(state) ?? initialState;
})

// Additional memoized selectors if needed
export const selectAudiosByUser = createSelector(
    [selectAllAudios, (state, userId) => userId],
    (audios, userId) => audios?.filter(audio => audio.userId === userId) ?? []
)

// Create a memoized selector factory that takes userId as parameter to fix memoization issues
export const makeSelectAudioById = () => createSelector(
    [(state, audioId, userId) => {
        if (!userId) return null;
        const selectAudiosByUserResult = audiosApiSlice.endpoints.getAudiosByUserId.select(userId);
        const result = selectAudiosByUserResult(state);
        return result?.data;
    }, (state, audioId) => audioId],
    (audioData, audioId) => {
        if (!audioData?.entities) return null;
        return audioData.entities[audioId];
    }
);
