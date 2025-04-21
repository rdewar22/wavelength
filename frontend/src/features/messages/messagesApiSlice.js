import { createEntityAdapter } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const messagesAdapter = createEntityAdapter({
    selectId: (message) => message._id,
})

const initialState = messagesAdapter.getInitialState()

export const messagesApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getMessagesForUserName: builder.query({
            query: username => `/messages/${username}`,
            transformResponse: responseData => {
                let min = 1;
                const loadedMessages = responseData.map(message => {
                    return message;
                });
                return messagesAdapter.setAll(initialState, loadedMessages)
            },
            providesTags: (result, error, arg) => [
                { type: 'Message', id: "LIST" },
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