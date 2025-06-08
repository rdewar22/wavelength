import './Profile.css'
import React, { useState, useEffect } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { useGetPostsByUserIdQuery } from '../posts/postsApiSlice';
import { useGetAudiosByUserIdQuery } from '../audio/audioApiSlice';
import PostsExcerpt from '../posts/PostsExcerpt';
import { Spinner } from 'reactstrap';
import AudioExcerpt from '../audio/AudioExcerpt';
import { useLocation, useParams } from 'react-router-dom';

const PublicProfile = ({ token }) => {
    const location = useLocation();
    const { userName } = useParams();
    const userId = location.state.publicUserId;
    const [isProfPic, setProfPic] = useState(true);
    const [isProfPicLoading, setIsProfPicLoading] = useState(true);
    const profilePicUri = `https://robby-wavelength-test.s3.us-east-2.amazonaws.com/profile-pictures/${userName}_profPic.jpeg`
    const imageSrc = profilePicUri + "?" + Math.random().toString(36);
    const [counter, setCounter] = useState(0);

    // Fetch posts
    const {
        data: posts,
        isLoading: isPostsLoading,
        isSuccess: isPostsSuccess,
        isError: isPostsError,
        error: postsError
    } = useGetPostsByUserIdQuery(userId);

    // Fetch audios - make sure we have a userId before fetching
    const {
        data: audiosData,
        isLoading: isAudiosLoading,
        isSuccess: isAudiosSuccess,
        isError: isAudiosError,
        error: audiosError
    } = useGetAudiosByUserIdQuery(userId, {
        skip: !userId // Skip the query if we don't have a userId
    })


    let postsContent;
    if (isPostsLoading) {
        postsContent = <p>"Loading..."</p>;
    } else if (isPostsSuccess) {
        postsContent = [...(posts?.ids || [])].reverse().map(postId => <PostsExcerpt key={postId} postId={postId} />);
    } else if (isPostsError) {
        postsContent = <p>Error: {postsError?.originalStatus} {postsError?.status}</p>
    }

    let audiosContent;
    if (isAudiosLoading) {
        audiosContent = <p>"Loading..."</p>;
    } else if (isAudiosSuccess) {
        audiosContent = (audiosData?.ids || []).slice().reverse().map(data => <AudioExcerpt key={data} audioId={data} />);
    } else if (isAudiosError) {
        audiosContent = <p>Error: {audiosError?.originalStatus} {audiosError?.status}</p>
    }

    const reloadParent = () => {
        setCounter(prev => prev + 1);
        setProfPic(true)
    };


    return (
        <>
            <div className="profile">
                <div className='profile-page-header'>
                    <div className="avatar">
                        <div className="avatar-wrapper">
                            {isProfPic ? (
                                <>
                                    {isProfPicLoading && <Spinner />}
                                    <img
                                        src={imageSrc}
                                        alt={`${userName} avatar`}
                                        onLoad={() => setIsProfPicLoading(false)}
                                        onError={() => {
                                            setProfPic(false);
                                            setIsProfPicLoading(false);
                                        }}
                                        style={{ display: isPostsLoading ? 'none' : 'block' }}
                                    />
                                </>
                            ) : (
                                <IoPersonCircleOutline size={40} />
                            )}
                            {/* <UploadAvatar
                                avatarUrl={profilePicUri}
                                reloadParent={reloadParent}
                            /> */}
                        </div>
                    </div>
                    <p className='profile-name'>{userName}</p>
                </div>

                <div className="audio-section">
                    <h3>Audio Files</h3>
                    {/* <div className="audio-controls">
                        <UploadAudio
                            buttonLabel="Upload New Audio"
                        />
                    </div> */}
                    <div className="audio-list">
                        {audiosContent || <p>No audio files uploaded yet</p>}
                    </div>
                </div>

                <div className="body">
                    {postsContent}
                </div>
            </div>
        </>
    );
};

export default PublicProfile;