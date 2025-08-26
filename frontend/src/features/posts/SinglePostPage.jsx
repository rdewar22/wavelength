import ReactionButtons from "./ReactionButtons";
import postTimeStamps from "../common/postTimeStamps";
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useSelector } from "react-redux";
import { selectPostById } from "../../components/postsApiSlice";

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
                <postTimeStamps created={post.createdAt} lastEdited={post.updatedAt} />
            </p>
            <ReactionButtons post={post} />
        </article>
    )
}

export default SinglePostPage