import React from "react";
import { Link } from 'react-router-dom';
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { selectCurrentUserId } from "../../components/authSlice";
import { selectPostByIdFromAnyCache, useDeletePostMutation } from "../../components/postsApiSlice";
import AudioFilePlayer from "../audio/AudioFilePlayer";
import UserProfileNav from "../profiles/UserProfileNav";
import ReactionButtons from "./ReactionButtons";
import TimeAgo from "../common/TimeAgo";
import "./PostExcerpt.css"

const PostExcerpt = React.memo(({ postId, userId }) => {
    const currentUserId = useSelector(selectCurrentUserId);
    const post = useSelector(state => selectPostByIdFromAnyCache(state, postId, userId))
    const postAuthorId = post?.author?._id;
    const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

    const handleDelete = async () => {

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete this post!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            toast.success('Post deleted successfully!');
            await deletePost(postId).unwrap();
            return true;
        } else {
            return false;
        }
    }
    return (
        <article className="post-excerpt">
            <h3 className="post-title">{post?.title}</h3>
            {postAuthorId === currentUserId && (
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="delete-post-button"
                    title="Delete post"
                >
                    {isDeleting ? '...' : '×'}
                </button>
            )}
            {post?.audioTitle && <AudioFilePlayer audioTitle={post?.audioTitle} audioAuthorId={post?.author?._id} />}
            <p className="excerpt">{post?.description?.substring(0, 75)}{post?.content?.length > 75 ? '...' : ''}</p>

            <div className="postCredit">
                <div className="post-meta-row">
                    {post?.description?.length > 75 && (
                        <Link to={`/singlepost/${post?._id}`} className="view-post-link">
                            View Post
                        </Link>
                    )}
                    <div className="author-info">
                        <span>by</span>
                        <UserProfileNav userName={post?.author?.username} userId={post?.author?._id} />
                        <div className="time-ago">
                            <TimeAgo created={post?.createdAt} lastEdited={post?.updatedAt} />
                        </div>
                    </div>
                </div>

            </div>

            <ReactionButtons post={post} />
        </article>
    )
})

PostExcerpt.displayName = 'PostExcerpt';

export default PostExcerpt