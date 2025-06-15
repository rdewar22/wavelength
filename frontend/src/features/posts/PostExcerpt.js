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
            
            <div className="postCredit">
                <div className="post-meta-row">
                    {post?.content?.length > 75 && (
                        <Link to={`/singlepost/${post?._id}`} className="view-post-link">
                            View Post
                        </Link>
                    )}
                    <div className="author-info">
                        <span>by</span>
                        <Link 
                            to={`/${post?.author?.username}`} 
                            state={{ pageUserId: post?.author?._id }}
                            className="author-link"
                        >
                            {post?.author?.username}
                        </Link>
                    </div>
                </div>
                <div className="time-ago">
                    <TimeAgo created={post?.createdAt} lastEdited={post?.updatedAt} />
                </div>
            </div>
            
            <ReactionButtons post={post} />
        </article>
    )
}


export default PostExcerpt