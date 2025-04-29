import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const messagesAdapter = createEntityAdapter({
    selectId: (message) => message._id,
})

const initialState = messagesAdapter.getInitialState()

export const messagesApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getMessagesForUserName: builder.query({
            query: username => `/messages/${username}`,
            transformResponse: (responseData) => {
                const allMessages = [...responseData.sent, ...responseData.received];
                return messagesAdapter.setAll(initialState, allMessages);
            },
            providesTags: (result) => [
                { type: 'Message', id: 'LIST' },
                ...(result?.ids ? result.ids.map(id => ({ type: 'Message', id })) : [])
            ]
        }),
        sendMessage: builder.mutation({
            query: initialMessage => ({
                url: '/messages',
                method: 'POST',
                body: {
                    ...initialMessage
                }
            })
        })
    })
})

export const {
    useGetMessagesForUserNameQuery,
    useSendMessageMutation,
} = messagesApiSlice

// Corrected selector - now takes username parameter
export const selectMessagesResult = (username) =>
    messagesApiSlice.endpoints.getMessagesForUserName.select(username);

// In messagesApiSlice.js
export const makeSelectMessages = (username) => {
    const selectMessagesForUser = createSelector(
        [state => selectMessagesResult(username)(state)],
        messagesResult => messagesResult?.data ?? initialState
    );

    return messagesAdapter.getSelectors(selectMessagesForUser);
};

const selectMessagesData = createSelector(
    selectMessagesResult,
    messagesResult => messagesResult?.data ?? initialState // normalized state object with ids and entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllMessages,
    selectById: selectMessageById,
    selectIds: selectMessageIds
} = messagesAdapter.getSelectors(state => selectMessagesData(state) ?? initialState)
