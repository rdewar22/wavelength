import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAddNewPostMutation } from "./postsApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentUserName, selectCurrentUserId } from "../auth/authSlice";
import "./AddPostForm.css";

const AddPostForm = () => {
    const [addNewPost, { isLoading }] = useAddNewPostMutation()

    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    
    const currentUserName = useSelector(selectCurrentUserName)
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
                // console.log('New post added!')
            } catch (err) {
                console.error('Failed to save the post', err)
            }
        }
    }

    const getCharacterCountClass = (count, max) => {
        if (count > max) return 'character-count error';
        if (count > max * 0.8) return 'character-count warning';
        return 'character-count';
    };

    return (
        <div className="add-post-container">
            <div className="add-post-form-wrapper">
                {isLoading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                    </div>
                )}
                
                <h1 className="add-post-title">Create new Post</h1>
                
                <form className="add-post-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="form-group">
                        <label htmlFor="postTitle" className="form-label">Post Title</label>
                        <input
                            type="text"
                            id="postTitle"
                            name="postTitle"
                            className="form-input"
                            value={title}
                            onChange={onTitleChanged}
                            placeholder="Enter a title for your post..."
                            maxLength={100}
                        />
                        <div className={getCharacterCountClass(title.length, 100)}>
                            {title.length}/100 characters
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="postContent" className="form-label">Content</label>
                        <textarea
                            id="postContent"
                            name="postContent"
                            className="form-textarea"
                            value={content}
                            onChange={onContentChanged}
                            placeholder="Write your post content here... Share your ideas, experiences, or anything you'd like to discuss with the community."
                            maxLength={5000}
                        />
                        <div className={getCharacterCountClass(content.length, 5000)}>
                            {content.length}/5000 characters
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="save-post-btn"
                            onClick={onSavePostClicked}
                            disabled={!canSave}
                        >
                            {isLoading ? 'Publishing...' : 'Publish Post'}
                        </button>
                        <Link to="/" className="cancel-btn">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
export default AddPostForm