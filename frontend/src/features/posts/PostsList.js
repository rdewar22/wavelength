import { useSelector } from "react-redux";
import PostsExcerpt from "./PostsExcerpt";
import { useGetPostsQuery, selectPostIds } from "./postsApiSlice";
import "./PostsList.css"

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
        content = <p className="loading-message">This page may take up to 50 seconds to load because I am using the free plan of my hosting service. Welcome to the site! My name is Robby Dewar, and I am primarily using this site to showcase my abilities as a web designer. Thank you for visiting! Please let me know if you encounter any bugs. You can contact me at dewarrob@msu.edu.

        If you are viewing this site because I applied for a job at your company, I believe I would make a great addition to any team. I hold a bachelor's degree in Computer Science from Michigan State University, and most of my experience lies in developing web applications. I am a kind and open-minded individual who believes that computers have the potential to make the world an infinitely better place.
        
        I understand that many people fear a future dominated by technology, worrying that it may cause us to lose our connections to each other and to nature. I believe that computers can actually bring people closer to the world and to those around them. :)</p>;
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