import './AudioModal.css'
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { selectCurrentUserId } from "../../components/authSlice";
import { useUploadAudioMutation } from "../../components/audioApiSlice";
import AudioFilePlayer from "./AudioFilePlayer";

const AudioModal = ({ onClose, handleAudio }) => {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [uploadAudio] = useUploadAudioMutation();
    const userId = useSelector(selectCurrentUserId);
    const navigate = useNavigate();

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            const { type } = selectedFile;
            // Check if the file type is an allowed audio format
            if (type.startsWith('audio/') || type === 'video/webm') {
                const allowedTypes = [
                    'audio/mpeg',
                    'audio/wav',
                    'audio/ogg',
                    'audio/mp4',
                    'audio/x-m4a',
                    'audio/webm',
                    'video/webm'  // WebM format from MediaRecorder
                ];
                if (allowedTypes.includes(type)) {
                    setFile(selectedFile);
                    // Set default title from filename if no title is set
                    if (!title) {
                        const fileName = selectedFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
                        setTitle(fileName);
                    }
                } else {
                    toast.error("Only MP3, WAV, OGG, M4A, and WebM audio formats are allowed", {
                        hideProgressBar: true,
                    });
                }
            } else {
                toast.error("Please select an audio file", {
                    hideProgressBar: true,
                });
            }
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setFile(new File([blob], 'recording.webm', { type: 'audio/webm' }));
                if (!title) {
                    setTitle(`Recording ${new Date().toLocaleString()}`);
                }
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error("Error details:", err.name, err.message);
            if (err.name === 'NotAllowedError') {
                toast.error("Microphone access was denied", { hideProgressBar: true });
            } else if (err.name === 'NotFoundError') {
                toast.error("No microphone found", { hideProgressBar: true });
            } else {
                toast.error("Microphone error: " + err.message, { hideProgressBar: true });
            }
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const removeFile = () => {
        setFile(null);
        // Reset the file input
        const fileInput = document.getElementById('audioFile');
        if (fileInput) {
            fileInput.value = '';
        }
        // Optionally clear the title if it was auto-generated
        if (title.startsWith('Recording ') || title === file?.name?.replace(/\.[^/.]+$/, "")) {
            setTitle('');
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            toast.error("Please select or record an audio file", {
                hideProgressBar: true,
            });
            return;
        }

        if (!title.trim()) {
            toast.error("Please enter a title for your audio", {
                hideProgressBar: true,
            });
            return;
        }

        if (onClose) {
            if (handleAudio) {
                handleAudio(title.trim(), file);
            }
            onClose();
        } else {
            // navigate back to the add post page
            navigate(-1);
        }

    };

    return (
        <div className="upload-audio-content">
            <div className="upload-audio-grid">
                {/* Left Column - Form */}
                <div className="upload-audio-form-column">
                    {/* Title Input */}
                    <div className="upload-audio-form-group">
                        <label className="upload-audio-label" htmlFor="audioTitle">
                            Audio Title
                        </label>
                        <input
                            type="text"
                            id="audioTitle"
                            className="upload-audio-input"
                            placeholder="Enter a title for your audio..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* File Upload Section */}
                    <div className="upload-audio-form-group">
                        <label className="upload-audio-label">
                            Select Audio File
                        </label>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                id="audioFile"
                                className="file-input-custom"
                                accept="audio/*"
                                onChange={handleFileChange}
                                disabled={isRecording}
                            />
                            <label
                                htmlFor="audioFile"
                                className={`file-input-button ${file ? 'has-file' : ''}`}
                            >
                                <span>📁</span>
                                {file ? `Selected: ${file.name}` : 'Choose Audio File'}
                            </label>
                        </div>
                    </div>

                    {/* Section Divider */}
                    <div className="section-divider">OR</div>

                    {/* Recording Section */}
                    <div className="recording-section">
                        <label className="upload-audio-label">
                            Record Audio Live
                        </label>
                        <div className="recording-controls">
                            {!isRecording ? (
                                <button
                                    className="record-btn start"
                                    onClick={startRecording}
                                    disabled={!!file}
                                >
                                    <span>🎤</span>
                                    Start Recording
                                </button>
                            ) : (
                                <>
                                    <button
                                        className="record-btn stop"
                                        onClick={stopRecording}
                                    >
                                        <span>⏹️</span>
                                        Stop Recording
                                    </button>
                                    <div className="recording-indicator">
                                        <div className="recording-dot"></div>
                                        Recording...
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Preview */}
                <div className="upload-audio-preview-column">
                    {file ? (
                        <AudioFilePlayer 
                            audioFile={file}
                            onRemove={removeFile}
                            formatFileSize={formatFileSize}
                        />
                    ) : (
                        <div className="no-file-placeholder">
                            <div className="placeholder-icon">🎵</div>
                            <p>Select or record an audio file to preview</p>
                        </div>
                    )}
                    {/* Action Button */}
                    <div className="upload-audio-actions">
                        <button
                            className="upload-btn"
                            onClick={handleSubmit}
                            disabled={!file || !title.trim()}
                        >
                            Add Audio to Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudioModal; 