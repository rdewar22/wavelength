import './UploadAudio.css'
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { selectCurrentUserId } from "../auth/authSlice";
import {
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap";
import { useUploadAudioMutation } from "../audio/audioApiSlice";

const UploadAudio = ({
    onAudioUploaded,
    buttonLabel = "Upload Audio"
}) => {
    const [modal, setModal] = useState(false);
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [uploadAudio] = useUploadAudioMutation();
    const userId = useSelector(selectCurrentUserId);

    const toggle = () => {
        setModal(!modal);
        if (!modal) {
            setFile(null);
            setTitle('');
            setIsRecording(false);
            if (mediaRecorder && mediaRecorder.state === "recording") {
                mediaRecorder.stop();
            }
        }
    };

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
            toast.error("Could not access microphone", {
                hideProgressBar: true,
            });
            console.error("Error accessing microphone:", err);
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

        try {
            const result = await uploadAudio({
                userId,
                title: title.trim(),
                file: file
            }).unwrap();

            if (result.success) {
                toast.success("Audio uploaded successfully!");
                if (onAudioUploaded) {
                    onAudioUploaded(result.audioUrl);
                }
                setFile(null);
                setTitle('');
                setModal(false);
            } else {
                toast.error(result.error || "Failed to upload audio");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload audio file");
        }
    };

    return (
        <div>
            <button className="upload-audio-trigger-btn" onClick={toggle}>
                Upload Audio
            </button>
            
            <Modal 
                isOpen={modal} 
                toggle={toggle} 
                className="upload-audio-modal"
                size="lg"
                centered
            >
                <ModalHeader toggle={toggle} className="modal-title">
                    Upload Audio
                </ModalHeader>
                
                <ModalBody>
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

                    {/* File Preview */}
                    {file && (
                        <div className="selected-file-preview">
                            <button 
                                className="remove-file-btn" 
                                onClick={removeFile}
                                title="Remove file"
                                type="button"
                            >
                                ×
                            </button>
                            <div className="selected-file-info">
                                <div className="file-icon">
                                    🎵
                                </div>
                                <div className="file-details">
                                    <div className="file-name">{file.name}</div>
                                    <div className="file-size">{formatFileSize(file.size)}</div>
                                </div>
                            </div>
                            <div className="audio-preview">
                                <audio controls>
                                    <source src={URL.createObjectURL(file)} type={file.type} />
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        </div>
                    )}
                </ModalBody>
                
                <ModalFooter>
                    <button 
                        className="upload-btn" 
                        onClick={handleSubmit} 
                        disabled={!file || !title.trim()}
                    >
                        <span>⬆️</span>
                        Upload Audio
                    </button>
                    <button className="cancel-btn" onClick={toggle}>
                        Cancel
                    </button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default UploadAudio; 