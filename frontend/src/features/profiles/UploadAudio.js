import './UploadAvatar.css'
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { selectCurrentUser } from "../auth/authSlice";
import {
    Form,
    Button,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap";
import { useUploadAudioMutation } from "../users/usersApiSlice";

const UploadAudio = ({
    onAudioUploaded,
    buttonLabel = "Upload Audio"
}) => {
    const [modal, setModal] = useState(false);
    const [file, setFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [uploadAudio] = useUploadAudioMutation();
    const username = useSelector(selectCurrentUser);

    const toggle = () => {
        setModal(!modal);
        if (!modal) {
            setFile(null);
            setIsRecording(false);
            if (mediaRecorder && mediaRecorder.state === "recording") {
                mediaRecorder.stop();
            }
        }
    };

    const handleFileChange = ({ target: { files } }) => {
        if (files?.length) {
            const { type } = files[0];
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
                    setFile(files[0]);
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

    const handleSubmit = async () => {
        if (!file) {
            toast.error("Please select or record an audio file", {
                hideProgressBar: true,
            });
            return;
        }

        try {
            const result = await uploadAudio({
                username,
                audioFile: file
            }).unwrap();

            if (result.success) {
                toast.success("Audio uploaded successfully!");
                if (onAudioUploaded) {
                    onAudioUploaded(result.audioUrl);
                }
                setFile(null);
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
            <Button size="sm" onClick={toggle}>
                {buttonLabel}
            </Button>
            <Modal isOpen={modal} toggle={toggle}>
                <ModalHeader toggle={toggle}>Upload Audio</ModalHeader>
                <ModalBody>
                    <Form>
                        <FormGroup>
                            <Label for="audioFile">Select Audio File</Label>
                            <Input
                                type="file"
                                name="audioFile"
                                id="audioFile"
                                accept="audio/*"
                                onChange={handleFileChange}
                                disabled={isRecording}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label>Or Record Audio</Label>
                            <div className="d-flex gap-2">
                                {!isRecording ? (
                                    <Button
                                        color="primary"
                                        onClick={startRecording}
                                        disabled={!!file}
                                    >
                                        Start Recording
                                    </Button>
                                ) : (
                                    <Button
                                        color="danger"
                                        onClick={stopRecording}
                                    >
                                        Stop Recording
                                    </Button>
                                )}
                            </div>
                        </FormGroup>
                        {file && (
                            <FormGroup>
                                <Label>Selected Audio:</Label>
                                <div className="selected-file">
                                    {file.name}
                                    <audio controls>
                                        <source src={URL.createObjectURL(file)} type={file.type} />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            </FormGroup>
                        )}
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleSubmit} disabled={!file}>
                        Upload
                    </Button>
                    <Button color="secondary" onClick={toggle}>
                        Cancel
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default UploadAudio; 