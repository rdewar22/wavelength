import { useSelector } from "react-redux";
import { selectPostIds } from "./postsSlice";
import PostsExcerpt from "./PostsExcerpt";
import { useGetPostsQuery } from "./postsSlice";
import Navbar from "../../components/Navbar";


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
        console.log("content:", content)
        content = <p>"Loading..."</p>;
    } else if (isSuccess) {
        console.log("content:", content)
        content = orderedPostIds.map(postId => <PostsExcerpt key={postId} postId={postId} />);
    } else if (isError) {
        console.log("content:", content)
        content = <p>Error: {error.originalStatus} {error.status}</p>  //JSON.stringify()
    }

    return (
        <>
            <Navbar />
            <section>
                {content || <p>No posts available.</p>}
            </section>
        </>

    )
}

export default PostsList