import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useGetPostsQuery } from '../posts/postsApiSlice';
import { useGetAllAudiosQuery } from '../audio/audioApiSlice';
import PostExcerpt from '../posts/PostExcerpt';
import AudioExcerpt from '../audio/AudioExcerpt';
import { selectCurrentUserId } from '../auth/authSlice';
import './MainFeed.css';

const MainFeed = () => {
  const userId = useSelector(selectCurrentUserId);

  // Fetch all posts
  const {
    data: posts,
    isLoading: isPostsLoading,
    isSuccess: isPostsSuccess,
    isError: isPostsError,
    error: postsError
  } = useGetPostsQuery();

  // Fetch all audios
  const {
    data: audiosData,
    isLoading: isAudiosLoading,
    isSuccess: isAudiosSuccess,
    isError: isAudiosError,
    error: audiosError
  } = useGetAllAudiosQuery();

  let postsContent;
  if (isPostsLoading) {
    postsContent = <p>"Loading posts..."</p>;
  } else if (isPostsSuccess) {
    if (posts?.ids && posts.ids.length > 0) {
      postsContent = [...(posts?.ids || [])].reverse().map(postId => (
        <PostExcerpt key={postId} postId={postId} userId={userId} />
      ));
    } else {
      postsContent = <p className="empty-state">No posts yet. Be the first to share!</p>;
    }
  } else if (isPostsError) {
    postsContent = <p>Error loading posts: {postsError?.originalStatus} {postsError?.status}</p>
  }

  let audiosContent;
  if (isAudiosLoading) {
    audiosContent = <p>"Loading audio files..."</p>;
  } else if (isAudiosSuccess) {
    if (audiosData?.ids && audiosData.ids.length > 0) {
      audiosContent = (audiosData?.ids || []).slice().reverse().map(audioId => {
        const audio = audiosData.entities[audioId];
        return (
          <AudioExcerpt key={audioId} audio={audio} />
        );
      });
    } else {
      audiosContent = <p className="empty-state">No audio files uploaded yet. Be the first to share audio!</p>;
    }
  } else if (isAudiosError) {
    audiosContent = <p>Error loading audio files: {audiosError?.originalStatus} {audiosError?.status}</p>
  }

  return (
    <>
      <div className="main-feed">
        {/* <div className='feed-page-header'>
          <div className='feed-title'>
            <h1>Main Feed</h1>
            <p>Discover posts and audio from the community</p>
          </div>
        </div> */}

        <div className="content-sections">
          <div className="posts-section">
              <h2>All Posts</h2>
              <div className="posts-list">
                {postsContent}
              </div>
          </div>
          
          <div className="main-feed-audio-section">
            <h2>All Audio Files</h2>
            <div className="audio-list">
              {audiosContent}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainFeed; 