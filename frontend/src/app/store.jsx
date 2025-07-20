import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../app/api/apiSlice";
import authReducer from '../components/authSlice'

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            // Reduce performance overhead in development
            immutableCheck: {
                warnAfter: 128, // Increase threshold from 32ms to 128ms
                ignoredPaths: [
                    'api.queries', // Ignore RTK Query cache paths
                    'api.mutations',
                    'api.subscriptions'
                ]
            },
            serializableCheck: {
                warnAfter: 128, // Increase threshold for serializable check too
                ignoredActions: [
                    // Ignore RTK Query actions
                    'api/executeQuery/fulfilled',
                    'api/executeQuery/pending',
                    'api/executeQuery/rejected',
                    'api/executeMutation/fulfilled',
                    'api/executeMutation/pending',
                    'api/executeMutation/rejected'
                ],
                ignoredPaths: [
                    'api.queries',
                    'api.mutations',
                    'api.subscriptions'
                ]
            }
            // Alternative: If warnings persist, you can disable entirely in development:
            // immutableCheck: process.env.NODE_ENV === 'production',
            // serializableCheck: process.env.NODE_ENV === 'production'
        }).concat(apiSlice.middleware),
    devTools: process.env.NODE_ENV !== 'production'
})