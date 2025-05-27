import { createEntityAdapter, createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";

const messagesAdapter = createEntityAdapter({
    selectId: (message) => message._id,
})

const chatsAdapter = createEntityAdapter({
    selectId: (chat) => chat._id
})

const initialState = messagesAdapter.getInitialState()
const initialChatsState = chatsAdapter.getInitialState()

export const messagesApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getMessagesForUserName: builder.query({
            query: username => `/messages/${username}`,
            transformResponse: (responseData) => {
                return messagesAdapter.setAll(initialState, responseData.messages);
            },
            providesTags: (result) => [
                { type: 'Message', id: 'LIST' },
                ...(result?.ids ? result.ids.map(id => ({ type: 'Message', id })) : [])
            ]
        }),
        sendMessage: builder.mutation({
            query: messageData => ({
                url: '/messages/send',
                method: 'POST',
                body: {
                    content: messageData.message,
                    chatId: messageData.chatId
                }
            }),
            invalidatesTags: [
                { type: 'Message', id: "LIST" },
                { type: 'Chat', id: "LIST" }
            ]
        }),
        fetchChatsForUser: builder.query({
            query: (userId) => ({
                url: `/messages/${userId}`,
                method: 'GET',
            }),
            transformResponse: (responseData) => {
                return chatsAdapter.setAll(initialChatsState, responseData);
            },
            providesTags: (result) => [
                { type: 'Chat', id: 'LIST' },
                ...(result?.ids ? result.ids.map(id => ({ type: 'Chat', id })) : [])
            ]
        }),
        accessChat: builder.mutation({
            query: (groupData) => ({
                url: '/messages',
                method: 'POST',
                body: groupData
            }),
            invalidatesTags: ['Chat']
        }),
        deleteChat: builder.mutation({
            query: (chatId) => ({
                url: `/messages/${chatId}`,
                method: 'DELETE',
            }),
            invalidatesTags: [
                { type: 'Chat', id: 'LIST' },
                { type: 'Message', id: 'LIST' }
            ]
        }),
        getMessagesInChat: builder.query({
            query: (chatId) => ({
                url: `/messages/chat/${chatId}`,
                method: 'GET',
            }),
            transformResponse: (responseData) => {
                return messagesAdapter.setAll(initialState, responseData);
            },
            providesTags: (result) => [
                { type: 'Message', id: 'LIST' },
                ...(result?.ids ? result.ids.map(id => ({ type: 'Message', id })) : [])
            ]
        })
    })
})

export const {
    useGetMessagesForUserNameQuery,
    useAccessChatMutation,
    useSendMessageMutation,
    useFetchChatsForUserQuery,
    useGetMessagesInChatQuery,
    useDeleteChatMutation,
} = messagesApiSlice

// return the query result object
export const selectMessagesResult = (chatId) =>
    messagesApiSlice.endpoints.getMessagesInChat.select(chatId);

const selectMessagesData = createSelector(
    [selectMessagesResult, (state, chatId) => chatId],
    (messagesResult) => messagesResult.data
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllMessages,
    selectById: selectMessageById,
    selectIds: selectMessageIds
} = messagesAdapter.getSelectors(state => selectMessagesData(state) ?? initialState)
