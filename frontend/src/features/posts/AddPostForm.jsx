import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAddNewPostMutation } from "./postsApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentUserId } from "../auth/authSlice";
import AudioModal from "../profiles/AudioModal";
import "./AddPostForm.css";

const AddPostForm = () => {
    const [addNewPost, { isLoading }] = useAddNewPostMutation()

    const navigate = useNavigate()

    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [showAudioModal, setShowAudioModal] = useState(false)
    const [audioTitle, setAudioTitle] = useState('')
    const [audioFile, setAudioFile] = useState(null);

    const currentUserId = useSelector(selectCurrentUserId)


    const onTitleChanged = e => setTitle(e.target.value)
    const onContentChanged = e => setContent(e.target.value)

    const canSave = [title, content].every(Boolean) && !isLoading;

    const onSavePostClicked = async () => {
        if (canSave) {
            try {
                await addNewPost({ content, currentUserId }).unwrap()

                setTitle('')
                setContent('')
                setAudioTitle('')
                setAudioFile(null)
                navigate('/')
                // console.log('New post added!')
            } catch (err) {
                console.error('Failed to save the post', err)
            }
        }
    }

    const openAudioModal = () => {
        setShowAudioModal(true)
    }

    const closeAudioModal = () => {
        setShowAudioModal(false)
    }

    const handleAudio = (audioTitle, audioFile) => {
        setAudioTitle(audioTitle);
        setAudioFile(audioFile);
    }

    const removeAudio = () => {
        setAudioTitle('');
        setAudioFile(null);
    }

    const getCharacterCountClass = (count, max) => {
        if (count > max) return 'character-count error';
        if (count > max * 0.8) return 'character-count warning';
        return 'character-count';
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                        <label htmlFor="postContent" className="form-label">Message</label>
                        <textarea
                            id="postContent"
                            name="postContent"
                            className="form-textarea"
                            value={content}
                            onChange={onContentChanged}
                            placeholder="Write your message here."
                            maxLength={5000}
                        />
                        <div className={getCharacterCountClass(content.length, 5000)}>
                            {content.length}/5000 characters
                        </div>
                    </div>

                    <div>
                        {audioFile ? (
                            <div className="selected-file-preview">
                                <button
                                    className="remove-file-btn"
                                    onClick={removeAudio}
                                    title="Remove audio"
                                    type="button"
                                >
                                    ×
                                </button>
                                <div className="selected-file-info">
                                    <div className="file-icon">
                                        🎵
                                    </div>
                                    <div className="file-details">
                                        <div className="file-name">{audioFile.name}</div>
                                        <div className="file-size">{formatFileSize(audioFile.size)}</div>
                                    </div>
                                </div>
                                <div className="audio-preview">
                                    <audio controls>
                                        <source src={URL.createObjectURL(audioFile)} type={audioFile.type} />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="upload-audio-btn"
                                onClick={openAudioModal}
                            >
                                {audioTitle ? `🎵 ${audioTitle}` : '🎵 Upload Audio'}
                            </button>
                        )}
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

            {/* Audio Upload Modal */}
            {showAudioModal && (
                <div className="modal-overlay" onClick={closeAudioModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Upload Audio</h2>
                            <button
                                className="modal-close-btn"
                                onClick={closeAudioModal}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <AudioModal
                                onClose={closeAudioModal}
                                handleAudio={handleAudio}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
export default AddPostForm