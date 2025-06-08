// import { Link } from "react-router-dom";
// import { useGetUsersQuery } from "../users/usersApiSlice";

const PostAuthor = ({ userId }) => {
    return <span>by User {userId}</span>
}

export default PostAuthor

//     const { user: author } = useGetUsersQuery('getUsers', {
//         selectFromResult: ({ data, isLoading }) => ({
//             user: data?.entities[userId]
//         }),
//     })

//     return <span>by {author
//         ? <Link to={`/user/${userId}`}>{author.name}</Link>
//         : 'Unknown author'}</span>
// }
// export default PostAuthor