import React, { useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useGetPostsQuery } from '../posts/postsApiSlice';
import { useGetAllAudiosQuery } from '../audio/audioApiSlice';
import PostExcerpt from '../posts/PostExcerpt';
import AudioExcerpt from '../audio/AudioExcerpt';
import { selectCurrentUserId } from '../auth/authSlice';
import { Link } from "react-router-dom";
import UploadAudio from "../profiles/UploadAudio";
import './MainFeed.css';

// Lazy loading wrapper component
const LazyComponent = ({ children, threshold = 0.1 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  const observerCallback = useCallback((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Disconnect observer once component is visible
        if (ref.current) {
          ref.current.disconnect();
        }
      }
    });
  }, []);

  React.useEffect(() => {
    const observer = new IntersectionObserver(observerCallback, {
      threshold,
      rootMargin: '50px' // Start loading 50px before component comes into view
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.disconnect();
      }
    };
  }, [observerCallback, threshold]);

  return (
    <div ref={ref}>
      {isVisible ? children : <div style={{ height: '200px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px' }} />}
    </div>
  );
};

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
        <LazyComponent key={postId}>
          <PostExcerpt postId={postId} userId={userId} />
        </LazyComponent>
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
          <LazyComponent key={audioId}>
            <AudioExcerpt audio={audio} />
          </LazyComponent>
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


        <div className="content-sections">
          <div className="posts-section">
            <h2>All Posts</h2>
            <div className="post-controls">
              <Link to={userId ? "/addpostform" : "/login"} className="add-post-button">
                {userId ? "Create New Post" : "Login"}
              </Link>
            </div>
            <div className="posts-list">
              {postsContent}
            </div>
          </div>

          <div className="main-feed-audio-section">
            <h2>All Audio Files</h2>
            <div className="audio-controls">
              {userId ? (
                <Link to="/uploadaudio" className="add-post-button">
                  Upload Audio
                </Link>
              ) : (
                <Link to="/login" className="add-post-button">
                  Login
                </Link>
              )}
            </div>
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