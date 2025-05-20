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
            })
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
} = messagesApiSlice

export const makeSelectMessages = (username) => {
    // Directly create adapter selectors for a username
    const selectMessagesForUser = createSelector(
        (state) => messagesApiSlice.endpoints.getMessagesForUserName.select(username)(state),
        (messagesResult) => messagesResult?.data ?? initialState
    );

    return messagesAdapter.getSelectors(selectMessagesForUser);
};

// Selector for chats
export const selectChatsData = createSelector(
    (state) => messagesApiSlice.endpoints.fetchChatsForUser.select()(state),
    (chatsResult) => chatsResult?.data ?? initialChatsState
)

// Export chats selectors
export const {
    selectAll: selectAllChats,
    selectById: selectChatById,
    selectIds: selectChatIds,
} = chatsAdapter.getSelectors(state => selectChatsData(state) ?? initialChatsState)

const selectMessagesData = createSelector(
    messagesResult => messagesResult?.data ?? initialState // normalized state object with ids and entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllMessages,
    selectById: selectMessageById,
    selectIds: selectMessageIds
} = messagesAdapter.getSelectors(state => selectMessagesData(state) ?? initialState)
