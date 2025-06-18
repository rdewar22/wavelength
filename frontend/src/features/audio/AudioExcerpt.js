import TimeAgoCreated from "./TimeAgoCreated";
import { useSelector } from "react-redux";
import { useDeleteAudioMutation, makeSelectAudioById, useGetAudiosByUserIdQuery } from "./audioApiSlice";
import { selectCurrentUserId } from "../auth/authSlice";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useMemo } from "react";
import "./AudioExcerpt.css";


const formatLikeS3Url = (str) => {
    // First, URL-encode the string (turns spaces into %20)
    let encoded = encodeURIComponent(str);

    // Replace %20 with +
    encoded = encoded.replaceAll(/%20/g, '+');
    encoded = encoded.replaceAll('%2F', '-');

    encoded = "https://robby-wavelength-test.s3.us-east-2.amazonaws.com/audio-files/" + encoded + ".webm";

    return encoded;
};

const AudioExcerpt = ({ audioId, userId: propUserId }) => {
    const currentUserId = useSelector(selectCurrentUserId);
    const userId = propUserId || currentUserId; // Use passed userId or fall back to current user
    const [deleteAudio, { isLoading: isDeleting }] = useDeleteAudioMutation();

    useGetAudiosByUserIdQuery(userId, {
        skip: !userId // Skip the query if we don't have a userId
    });

    // Create memoized selector instance
    const selectAudioById = useMemo(() => makeSelectAudioById(), []);
    const audio = useSelector(state => selectAudioById(state, audioId, userId));

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete this audio!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            // User clicked "Yes", proceed with deletion
            // Show success toast
            toast.success('Audio deleted successfully!');
            await deleteAudio({ audioId }).unwrap();
            return true;
        } else {
            // User clicked "No" or closed the dialog
            return false;
        }
    };

    if (!audio) {
        return (
            <article className="audio-not-found">
                <p>Audio not found</p>
            </article>
        )
    }

    return (
        <article className="audio-excerpt">
            <div className="audio-header">
                <h2 className="audio-title">{audio?.title}</h2>
                {userId === currentUserId && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="delete-audio-button"
                        title="Delete audio"
                    >
                        {isDeleting ? '...' : '×'}
                    </button>
                )}
            </div>

            <div className="audio-player-container">
                <audio controls preload="metadata" className="audio-player">
                    <source src={formatLikeS3Url(audio?.title)} type="audio/webm" />
                    Your browser does not support the audio element.
                </audio>
            </div>

            <div className="audio-meta">
                <div className="audio-timestamp">
                    <TimeAgoCreated created={audio?.createdAt} />
                </div>
            </div>
        </article>
    )
}

export default AudioExcerpt