import PostAuthor from "../posts/PostAuthor";
import TimeAgo from "../posts/TimeAgo";
import ReactionButtons from "../posts/ReactionButtons";

import { useSelector } from "react-redux";
import { selectAudioData } from "./audioApiSlice";
import { selectCurrentUserId } from "../auth/authSlice";

// https://robby-wavelength-test.s3.us-east-2.amazonaws.com/audio-files/Recording+6-2-2025%2C+5%3A56%3A13+PM.webm
// https://robby-wavelength-test.s3.us-east-2.amazonaws.com/audio-files/Recording+6-2-2025%2C+5%3A56%3A13+PM.webm
// Recording+6-2-2025%2C+5%3A56%3A13+PM
// Recording+6-2-2025%2C+5%3A56%3A13+PM 


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
    const userId = useSelector(selectCurrentUserId)
    
    const audio = useSelector(state => {
        const audioData = selectAudioData(state, userId);
        return audioData?.entities?.[audioId];
      });

    if (!audio) {
        return <article><p style={{color: 'red'}}>Audio not found</p></article>
    }

    return (
            <article>
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