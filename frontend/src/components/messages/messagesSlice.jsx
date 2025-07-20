import { createSlice } from "@reduxjs/toolkit";


const messagesSlice = createSlice({
    name: 'messages',
    initialState: { selectedChat: null, user: null, notification: [], chats: null },
    reducers: {
        setMessages: (state, action) => {
            const { selectedChat, user, notification, chats } = action.payload
            state.selectedChat = selectedChat
            state.user = user
            state.notification = notification
            state.chats = chats
        },
    },

})

export const { setMessages } = messagesSlice.actions

export default messagesSlice.reducer

export const selectCurrentUser = (state) => state.auth.user