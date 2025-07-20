import React, { useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { useGetPostsQuery } from "../../components/postsApiSlice";
import PostExcerpt from '../posts/PostExcerpt';
import { selectCurrentUserId } from '../../components/authSlice';
import { Link } from "react-router-dom";
import Spinner from '../common/Spinner';
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

  let postsContent;
  if (isPostsLoading) {
    postsContent = <Spinner />;
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

  return (
    <>
      <div className="main-feed">
        <div className="content-sections">
          <div className="posts-section">
            <h2>Posts</h2>
            <div className="post-controls">
              <Link to={userId ? "/addpostform" : "/login"} className="add-post-button">
                {userId ? "Create New Post" : "Login"}
              </Link>
            </div>
            <div className="posts-list">
              {postsContent}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainFeed; 