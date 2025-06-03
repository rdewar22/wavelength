import PostAuthor from "../posts/PostAuthor";
import TimeAgo from "../posts/TimeAgo";
import ReactionButtons from "../posts/ReactionButtons";

import { useSelector } from "react-redux";
import { selectAudioById } from "./audioApiSlice";


const formatLikeS3Url = (str) => {
    // First, URL-encode the string (turns spaces into %20)
    let encoded = encodeURIComponent(str);
    
    // Replace %20 with +
    encoded = encoded.replace(/%20/g, '+');
    
    return encoded;
  };

const AudioExcerpt = ({ audioId }) => {
    const audio = useSelector(state => selectAudioById(state, audioId))

    return (
        <article>
            <h2>{audio?.title}</h2>
            <p className="postCredit">
                <audio controls preload="metadata">
                    <source src={formatLikeS3Url(audio.title)} type="audio/mpeg" />
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