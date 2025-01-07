import PostAuthor from "./PostAuthor";
import TimeAgo from "./TimeAgo";
import ReactionButtons from "./ReactionButtons";
import { Link } from 'react-router-dom';

import { useSelector } from "react-redux";
import { selectPostById } from "./postsSlice";

const PostsExcerpt = ({ postId }) => {
    const post = useSelector(state => selectPostById(state, postId))
    console.log("post:", post);

    
    return (
        <article>
            <h2>{post.title}</h2>
            <p className="excerpt">{post?.content?.substring(0, 75)}...</p>
            <p className="postCredit">
                <Link to={`postslist/${post.id}`}>View Post</Link>
                {/* <PostAuthor userId={post?._id} /> */}
                <TimeAgo created={post.createdAt} lastEdited={post.updatedAt} />
            </p>
            <ReactionButtons post={post} />

        </article>
    )
}


export default PostsExcerpt