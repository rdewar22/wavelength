import { useSelector } from "react-redux";
import PostsExcerpt from "./PostExcerpt";
import { useGetPostsQuery, selectPostIds } from "./postsApiSlice";

const PostsList = () => {

    const {
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetPostsQuery()

    const orderedPostIds = useSelector(selectPostIds);

    let content;
    if (isLoading) {
        content = <p>Loading...</p>;
    } else if (isSuccess) {
        content = [...orderedPostIds].reverse().map(postId => <PostsExcerpt key={postId} postId={postId} />);
    } else if (isError) {
        content = <p>Error: {error.originalStatus} {error.status}</p>  //JSON.stringify()
    }

    return (
        <>
            <section>
                {content || <p>No posts available.</p>}
            </section>
        </>

    )
}

export default PostsList