import ReactionButtons from "./ReactionButtons";
import TimeAgo from "../common/TimeAgo";
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useSelector } from "react-redux";
import { selectPostById } from "./postsApiSlice";

const SinglePostPage = () => {
    const { postId } = useParams()
    const post = useSelector(state => selectPostById(state, postId))

    if (!post) {
        return (
            <section>
                <h2>Post not found!</h2>
            </section>
        )
    }

    return (
        <article>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <p className="postCredit">
                <Link to={`/publicprofile/${post?.author?.username}`} state={{ publicUserId: post?.author?._id }}>{post?.author?.username}</Link>
                <TimeAgo created={post.createdAt} lastEdited={post.updatedAt} />
            </p>
            <ReactionButtons post={post} />
        </article>
    )
}

export default SinglePostPage