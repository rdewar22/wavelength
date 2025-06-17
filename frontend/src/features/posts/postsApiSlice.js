import {
    createSelector,
    createEntityAdapter
} from "@reduxjs/toolkit";
import { sub } from 'date-fns';
import { apiSlice } from "../../app/api/apiSlice";

const postsAdapter = createEntityAdapter({
    // sortComparer: (a, b) => b.date.localeCompare(a.date),
    selectId: (post) => post._id,
})

const initialState = postsAdapter.getInitialState()

export const postsApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getPosts: builder.query({
            query: () => '/publicPosts',
            keepUnusedDataFor: 3600,
            transformResponse: responseData => {
                let min = 1;
                const loadedPosts = responseData.map(post => {
                    if (!post?.reactions) post.reactions = {
                        thumbsUp: 0,
                        thumbsDown: 0,
                    }
                    return post;
                });
                return postsAdapter.setAll(initialState, loadedPosts)
            },
            providesTags: (result, error, arg) => [
                { type: 'Post', id: "LIST" },
                ...(result?.ids ? result.ids.map(id => ({ type: 'Post', id })) : [])
            ]
        }),
        getPostsByUserId: builder.query({
            query: userId => `/publicPosts/${userId}`,
            keepUnusedDataFor: 3600,
            transformResponse: responseData => {
                let min = 1;
                const loadedPosts = responseData.map(post => {
                    if (!post?.date) post.date = sub(new Date(), { minutes: min++ }).toISOString();
                    if (!post?.reactions) post.reactions = {
                        thumbsUp: 0,
                        thumbsDown: 0,
                    }
                    return post;
                });
                return postsAdapter.setAll(initialState, loadedPosts)
            },
            providesTags: (result, error, arg) => {
                // console.log(result)
                return [
                    { type: 'Post', id: "LIST" },
                    ...(result?.ids ? result.ids.map(id => ({ type: 'Post', id })) : [])
                ]
            }
        }),
        addNewPost: builder.mutation({
            query: initialPost => ({
                url: '/posts',
                method: 'POST',
                body: {
                    ...initialPost,
                    date: new Date().toISOString(),
                    reactions: {
                        thumbsUp: 0,
                        thumbsDown: 0,
                    }
                }
            }),
            invalidatesTags: [
                { type: 'Post', id: "LIST" }
            ]
        }),
        updatePost: builder.mutation({
            query: initialPost => ({
                url: `/posts/${initialPost.id}`,
                method: 'PUT',
                body: {
                    ...initialPost,
                    date: new Date().toISOString()
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Post', id: arg.id }
            ]
        }),
        deletePost: builder.mutation({
            query: (id) => ({
                url: `/posts/${id}`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Post', id: arg.id }
            ]
        }),
        addReaction: builder.mutation({
            query: ({ postId, reactions }) => ({
                url: `posts/${postId}`,
                method: 'PATCH',
                // In a real app, we'd probably need to base this on user ID somehow
                // so that a user can't do the same reaction more than once
                body: { reactions }
            }),
            async onQueryStarted({ postId, reactions }, { dispatch, queryFulfilled }) {
                // `updateQueryData` requires the endpoint name and cache key arguments,
                // so it knows which piece of cache state to update
                const patchResult = dispatch(
                    postsApiSlice.util.updateQueryData('getPosts', undefined, draft => {
                        // The `draft` is Immer-wrapped and can be "mutated" like in createSlice
                        const post = draft.entities[postId]
                        const now = new Date();
                        const isoStringWithOffset = now.toISOString().replace('Z', '+00:00')
                        if (post) {
                            post.reactions = reactions
                            post.updatedAt = isoStringWithOffset
                        }
                    })
                )
                try {
                    await queryFulfilled
                } catch {
                    patchResult.undo()
                }
            }
        })

    })
})

export const {
    useGetPostsQuery,
    useGetPostsByUserIdQuery,
    useAddNewPostMutation,
    useUpdatePostMutation,
    useDeletePostMutation,
    useAddReactionMutation
} = postsApiSlice

// return the query result object
export const selectPostsResult = postsApiSlice.endpoints.getPosts.select()

// Creates memoized selector
const selectPostsData = createSelector(
    selectPostsResult,
    postsResult => postsResult.data // normalized state object with ids and entities
)

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
    selectAll: selectAllPosts,
    selectById: selectPostById,
    selectIds: selectPostIds
    // Pass in a selector that returns the posts slice of state
} = postsAdapter.getSelectors(state => selectPostsData(state) ?? initialState)

// Create selectors for user-specific posts cache
export const selectPostsByUserResult = (userId) => postsApiSlice.endpoints.getPostsByUserId.select(userId)

export const selectPostsByUserData = createSelector(
    [selectPostsByUserResult],
    (selectResult) => (state, userId) => selectResult(state)?.data
)

// Create user-specific post selectors
export const getUserPostSelectors = (userId) => {
    return postsAdapter.getSelectors((state) => {
        const result = postsApiSlice.endpoints.getPostsByUserId.select(userId)(state);
        return result?.data ?? initialState;
    });
};

// Combined selector that can find posts from either global or user-specific cache
export const selectPostByIdFromAnyCache = createSelector(
    [
        // Input selector 1: Try global cache
        (state, postId) => selectPostById(state, postId),
        // Input selector 2: Try user-specific cache
        (state, postId, userId) => {
            if (!userId) return null;
            const userPostsResult = postsApiSlice.endpoints.getPostsByUserId.select(userId)(state);
            const userPostsData = userPostsResult?.data;
            return userPostsData?.entities?.[postId] || null;
        },
        // Input selector 3: Pass through the postId for validation
        (state, postId) => postId
    ],
    // Result function: Choose the first available post and ensure it has an id
    (globalPost, userPost, postId) => {
        const post = globalPost || userPost;
        // Add minimal transformation to avoid the identity function warning
        return post && post._id === postId ? post : null;
    }
);