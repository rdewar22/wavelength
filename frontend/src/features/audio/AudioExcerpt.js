import PostAuthor from "../posts/PostAuthor";
import TimeAgo from "../posts/TimeAgo";
import ReactionButtons from "../posts/ReactionButtons";
import "./AudioExcerpt.css";

import { useSelector } from "react-redux";
import { selectAudioData, useDeleteAudioMutation } from "./audioApiSlice";
import { selectCurrentUserId } from "../auth/authSlice";
import { toast } from "react-toastify";

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
        if (window.confirm('Are you sure you want to delete this audio?')) {
            try {
                await deleteAudio({ audioId }).unwrap();
                toast.success('Audio deleted successfully!');
            } catch (error) {
                console.error('Failed to delete audio:', error);
                toast.error('Failed to delete audio');
            }
        }
    };

    if (!audio) {
        return <article><p style={{color: 'red'}}>Audio not found</p></article>
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
            
            <h2 style={{color: 'black'}}>{audio?.title}</h2>
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