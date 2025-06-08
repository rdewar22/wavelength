import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAddNewPostMutation } from "./postsApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectCurrentUserId } from "../auth/authSlice";

const AddPostForm = () => {
    const [addNewPost, { isLoading }] = useAddNewPostMutation()

    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    
    const currentUser = useSelector(selectCurrentUser)
    const currentUserId = useSelector(selectCurrentUserId)
    

    const onTitleChanged = e => setTitle(e.target.value)
    const onContentChanged = e => setContent(e.target.value)

    const canSave = [title, content].every(Boolean) && !isLoading;

    const onSavePostClicked = async () => {
        if (canSave) {
            try {
                await addNewPost({ title, content, currentUserId }).unwrap()

                setTitle('')
                setContent('')
                navigate('/')
                console.log('New post added!')
            } catch (err) {
                console.error('Failed to save the post', err)
            }
        }
    }

    // let usersOptions
    // if (isSuccess) {
    //     usersOptions = users?.ids?.map(id => (
    //         <option key={id} value={id}>
    //             {users.entities[id].name}
    //         </option>
    //     ))
    // }

    return (
        <section>
            <h2>Add a New Post</h2>
            <form>
                <label htmlFor="postTitle">Post Title:</label>
                <input
                    type="text"
                    id="postTitle"
                    name="postTitle"
                    value={title}
                    onChange={onTitleChanged}
                />
                {/* <label htmlFor="postAuthor">Author:</label>
                <select id="postAuthor" value={userId} onChange={onAuthorChanged}>
                    <option value=""></option>
                    {usersOptions}
                </select> */}
                <label htmlFor="postContent">Content:</label>
                <textarea
                    id="postContent"
                    name="postContent"
                    value={content}
                    onChange={onContentChanged}
                />
                <button
                    type="button"
                    onClick={onSavePostClicked}
                    disabled={!canSave}
                >Save Post</button>
            </form>
        </section>
    )
}
export default AddPostForm