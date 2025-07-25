import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAddNewPostMutation } from "../../components/postsApiSlice";
import { useSelector } from "react-redux";
import { selectCurrentUserId } from "../../components/authSlice";
import AudioModal from "../audio/AudioModal";
import AudioFilePlayer from "../audio/AudioFilePlayer";
import { toast } from "react-toastify";
import "./AddPostForm.css";

const AddPostForm = () => {
    const [addNewPost, { isLoading }] = useAddNewPostMutation()

    const navigate = useNavigate()

    const [description, setDescription] = useState('')
    const [showAudioModal, setShowAudioModal] = useState(false)
    const [audioTitle, setAudioTitle] = useState('')
    const [imageTitle, setImageTitle] = useState('')
    const [audioFile, setAudioFile] = useState(null);

    const currentUserId = useSelector(selectCurrentUserId)

    const onDescriptionChanged = e => setDescription(e.target.value)

    const canSave = (description || audioFile) && !isLoading;

        const onSavePostClicked = async () => {
        if (canSave) {
            try {
                await addNewPost({ 
                    description, 
                    currentUserId, 
                    imageTitle, 
                    audioTitle, 
                    audioFile 
                }).unwrap()

                setDescription('')
                setAudioTitle('')
                setAudioFile(null)
                setImageTitle('')
                navigate('/')
                // console.log('New post added!')
            } catch (err) {
                console.error('Failed to save the post', err)
                toast.error(err.data?.message || 'Failed to save the post', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
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

                <h1 className="add-post-title">new Post</h1>

                <form className="add-post-form" onSubmit={(e) => e.preventDefault()}>

                    <div className="form-group">
                        <label htmlFor="postDescription" className="form-label">description</label>
                        <textarea
                            id="postDescription"
                            name="postDescription"
                            className="form-textarea"
                            value={description}
                            onChange={onDescriptionChanged}
                            placeholder="description"
                            maxLength={5000}
                        />
                        <div className={getCharacterCountClass(description.length, 5000)}>
                            {description.length}/5000 characters
                        </div>
                    </div>

                    <div>
                        {audioFile || audioTitle ? (
                            <AudioFilePlayer 
                                audioFile={audioFile}
                                audioTitle={audioTitle}
                                onRemove={removeAudio}
                                formatFileSize={formatFileSize}
                            />
                        ) : (
                            <button
                                type="button"
                                className="upload-audio-btn"
                                onClick={openAudioModal}
                            >
                                🎵 Upload Audio
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