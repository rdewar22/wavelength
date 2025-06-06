import PostAuthor from "../posts/PostAuthor";
import TimeAgo from "../posts/TimeAgo";
import ReactionButtons from "../posts/ReactionButtons";
import "./AudioExcerpt.css";

import { useSelector } from "react-redux";
import { selectAudioData, useDeleteAudioMutation } from "./audioApiSlice";
import { selectCurrentUserId } from "../auth/authSlice";
import { toast } from "react-toastify";
import Swal from "sweetalert2";


const formatLikeS3Url = (str) => {
    // First, URL-encode the string (turns spaces into %20)
    let encoded = encodeURIComponent(str);

    // Replace %20 with +
    encoded = encoded.replaceAll(/%20/g, '+');
    encoded = encoded.replaceAll('%2F', '-');

    encoded = "https://robby-wavelength-test.s3.us-east-2.amazonaws.com/audio-files/" + encoded + ".webm";

    return encoded;
};

const AudioExcerpt = ({ audioId }) => {
    const userId = useSelector(selectCurrentUserId);
    const [deleteAudio, { isLoading: isDeleting }] = useDeleteAudioMutation();

    const audio = useSelector(state => {
        const audioData = selectAudioData(state, userId);
        return audioData?.entities?.[audioId];
    });

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
            // Your delete logic here
        } else {
            // User clicked "No" or closed the dialog
            return false;
        }
    };

    if (!audio) {
        return <article><p style={{ color: 'red' }}>Audio not found</p></article>
    }

    return (
        <article style={{ position: 'relative' }}>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="delete-audio-button"
                title="Delete audio"
            >
                {isDeleting ? '...' : '×'}
            </button>

            <h2 style={{ color: 'black' }}>{audio?.title}</h2>
            <p className="postCredit">
                <audio controls preload="metadata">
                    <source src={formatLikeS3Url(audio?.title)} type="audio/webm" />
                    Your browser does not support the audio element.
                </audio>

                {/* <PostAuthor userId={post?._id} /> */}
                <TimeAgo created={audio?.createdAt} lastEdited={audio?.updatedAt} />
            </p>
            {/* <ReactionButtons post={post} /> */}
        </article>
    )
}

export default AudioExcerpt