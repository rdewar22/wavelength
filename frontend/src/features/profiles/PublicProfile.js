import './Profile.css'
import React, { useState, useEffect } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { useGetPostsByUserIdQuery } from '../posts/postsApiSlice';
import { useGetAudiosByUserIdQuery } from '../audio/audioApiSlice';
import PostExcerpt from '../posts/PostExcerpt';
import { Spinner } from 'reactstrap';
import AudioExcerpt from '../audio/AudioExcerpt';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUserId } from '../auth/authSlice';

const PublicProfile = ({ token }) => {
    const location = useLocation();
    const { userName } = useParams();
    const navigate = useNavigate();

    const userId = location.state.publicUserId;
    const currentUserId = useSelector(selectCurrentUserId);

    const [isProfPic, setProfPic] = useState(true);
    const [isProfPicLoading, setIsProfPicLoading] = useState(true);
    const [counter, setCounter] = useState(0);

    const profilePicUri = `https://robby-wavelength-test.s3.us-east-2.amazonaws.com/profile-pictures/${userName}_profPic.jpeg`
    const imageSrc = profilePicUri + "?" + Math.random().toString(36);

    // Redirect if user is viewing their own profile
    useEffect(() => {
        if (userId === currentUserId) {
            navigate("/profile");
        }
    }, [userId, currentUserId, navigate]);

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

    let audiosContent;
    if (isAudiosLoading) {
        audiosContent = <p>"Loading..."</p>;
    } else if (isAudiosSuccess) {
        if (audiosData?.ids && audiosData.ids.length > 0) {
            audiosContent = (audiosData?.ids || []).slice().reverse().map(data => <AudioExcerpt key={data} audioId={data} userId={userId} />);
        } else {
            audiosContent = <p className="empty-state">No audio files uploaded yet.</p>;
        }
    } else if (isAudiosError) {
        audiosContent = <p>Error: {audiosError?.originalStatus} {audiosError?.status}</p>
    }

    let postsContent;
    if (isPostsLoading) {
        postsContent = <p>"Loading..."</p>;
    } else if (isPostsSuccess) {
        if (posts?.ids && posts.ids.length > 0) {
            postsContent = [...(posts?.ids || [])].reverse().map(postId => <PostExcerpt key={postId} postId={postId} userId={userId} />);
        } else {
            postsContent = <p className="empty-state">No posts yet.</p>;
        }
    } else if (isPostsError) {
        postsContent = <p>Error: {postsError?.originalStatus} {postsError?.status}</p>
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
                        </div>
                    </div>
                    <div className='profile-name'>{userName}</div>
                </div>

                <div className="content-sections">

                    <div className="posts-section">
                        <div className="body">
                            <h2>Posts</h2>
                            {postsContent}
                        </div>
                    </div>
                    <div className="audio-section">
                        <h3>Audio Files</h3>
                        <div className="audio-list">
                            {audiosContent || <p>No audio files uploaded yet</p>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PublicProfile;