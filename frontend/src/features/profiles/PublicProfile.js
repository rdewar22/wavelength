import './Profile.css'
import React, { useState } from "react";
import { useLocation } from 'react-router-dom';
import { IoPersonCircleOutline } from "react-icons/io5";
import { selectCurrentUser, selectisProfPicInDb } from "../auth/authSlice";
import { useSelector } from "react-redux";
import { useGetPostsByUserNameQuery, selectPostIds } from '../posts/postsApiSlice';
import PostsExcerpt from '../posts/PostsExcerpt';

const PublicProfile = ({ token }) => {
    const location = useLocation();
    const username = location?.state.username;
    const profilePicUri = `https://robby-wavelength-test.s3.us-east-2.amazonaws.com/profile-pictures/${username}_profPic.jpeg`
    const imageSrc = profilePicUri + "?" + Math.random().toString(36);
    const [counter, setCounter] = useState(0);
    const [isProfPic, setProfPic] = useState(true);

    const {
        data: posts,
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetPostsByUserNameQuery(username)


    let content;
    if (isLoading) {
        content = <p>"Loading..."</p>;
    } else if (isSuccess) {
        content = [...posts.ids].reverse().map(postId => <PostsExcerpt key={postId} postId={postId} />);
    } else if (isError) {
        content = <p>Error: {error.originalStatus} {error.status}</p>  //JSON.stringify()
    }

    const reloadParent = () => {
        setCounter(prev => prev + 1); // Incrementing state triggers a re-render
    };

    return (
        <>
            <div className="profile">
                <div className='profile-page-header'>
                    <div className="avatar">
                        <div className="avatar-wrapper">
                            {isProfPic ? (
                                <img
                                    src={imageSrc}
                                    alt={`${username} avatar`}
                                    onError={() => setProfPic(false)}
                                />

                            ) : (
                                <IoPersonCircleOutline size={40} />
                            )}
                        </div>
                    </div>
                    <p className='profile-name'>{username}</p>
                </div>
                <div className="body">
                    {content}
                </div>
            </div>
        </>
    );
};

export default PublicProfile;