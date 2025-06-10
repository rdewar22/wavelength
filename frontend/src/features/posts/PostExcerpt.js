import TimeAgo from "./TimeAgo";
import ReactionButtons from "./ReactionButtons";
import { Link } from 'react-router-dom';
import { useSelector } from "react-redux";
import { selectPostByIdFromAnyCache } from "./postsApiSlice";
import "./PostExcerpt.css"

const PostExcerpt = ({ postId, userId }) => {
    const post = useSelector(state => selectPostByIdFromAnyCache(state, postId, userId))
    
    return (
        <article className="post-excerpt">
            <h3 className="post-title">{post?.title}</h3>
            <p className="excerpt">{post?.content?.substring(0, 75)}{post?.content?.length > 75 ? '...' : ''}</p>
            <br />
            <p className="postCredit">
                {post?.content?.length > 75 && (
                    <>
                        <Link to={`/singlepost/${post?._id}`}>View Post</Link>
                    </>
                )}
                <span style={{ color: 'black' }}> by </span>
                <Link to={`/publicprofile/${post?.author?.username}`} state={{ publicUserId: post?.author?._id }}>{post?.author?.username}</Link>
                <br /><br />          
                <TimeAgo created={post?.createdAt} lastEdited={post?.updatedAt} />
            </p>
            <ReactionButtons post={post} />

        </article>
    )
}


export default PostExcerpt