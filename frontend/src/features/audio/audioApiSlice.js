import {
    createSelector,
    createEntityAdapter
} from "@reduxjs/toolkit";
import { sub } from 'date-fns';
import { apiSlice } from "../../app/api/apiSlice";

const audiosAdapter = createEntityAdapter({
    // sortComparer: (a, b) => b.date.localeCompare(a.date),
    selectId: (audio) => audio._id,
})

const initialState = audiosAdapter.getInitialState()

// Get the selectors
const {
    selectAll: selectAllAudios,
    selectById: selectAudioById,
    selectIds: selectAudioIds
} = audiosAdapter.getSelectors(state => {
    // Access the correct path in the state tree
    return state?.api?.queries?.[`getAudiosByUserId(${state?.auth?.user})`]?.data ?? initialState
})

export const audiosApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getAudiosByUserId: builder.query({
            query: userId => `/audios/${userId}`,
            transformResponse: responseData => {
                let min = 1;
                const loadedAudios = responseData.map(audio => {
                    if (!audio?.date) audio.date = sub(new Date(), { minutes: min++ }).toISOString();
                    if (!audio?.reactions) audio.reactions = {
                        thumbsUp: 0,
                        thumbsDown: 0,
                    }
                    return audio;
                });
                return audiosAdapter.setAll(initialState, loadedAudios)
            },
            providesTags: (result, error, arg) => [
                { type: 'Audio', id: "LIST" },
                ...(result?.ids ? result.ids.map(id => ({ type: 'Audio', id })) : [])
            ]
        })
    })
})

export const {
    useGetAudiosByUserIdQuery,
} = audiosApiSlice

// Custom selectors
export const selectAudiosByUser = createSelector(
    [selectAllAudios, (state, userId) => userId],
    (audios, userId) => audios?.filter(audio => audio.userId === userId) ?? []
)

// You can add more custom selectors here as needed
