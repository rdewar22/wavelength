import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { setCredentials, selectCurrentToken, logOut } from './authSlice';
import { useRefreshMutation } from './authApiSlice';
import { Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';

import usePersist from '../hooks/usePersist';

const PersistLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMountedLoading, setIsMountedLoading] = useState(true);
  const [trueSuccess, setTrueSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  let accessToken = useSelector(selectCurrentToken);

  const [persist] = usePersist();

  const [refresh, {
    isUninitialized,
    isLoading,
    isSuccess,
    isError,
    error
  }] = useRefreshMutation();

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      if (isRefreshing) {
        console.log('Refresh already in progress, skipping...');
        setIsMountedLoading(false);
        return;
      }

      setIsRefreshing(true);

      try {
        const response = await refresh();
        setTrueSuccess(true);
        if (isMounted) {
          if (response?.data?.accessToken) {
            dispatch(setCredentials({
              user: response.data.user,
              userId: response.data.userId,
              accessToken: response.data.accessToken
            }));
          } else if (response?.error?.status === 500) {
            // Server error - don't logout, just show error
            console.error('Server error during refresh. Please try again later.');
          } else {
            dispatch(logOut());
            // navigate('/login');
          }
        }
      } catch (err) {
        console.error('Failed to refresh token:', err);
        if (isMounted) {
          // Only logout if it's not a server error
          if (err?.status !== 500) {
            dispatch(logOut());
          }
          // navigate('/login');
        }
      } finally {
        if (isMounted) {
          setIsMountedLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    // Only verify if we don't have a token
    (!accessToken && persist) ? verifyRefreshToken() : setIsMountedLoading(false);

    return () => {
      isMounted = false;
      setIsRefreshing(false);
    };
  }, [accessToken, refresh, dispatch, navigate, persist]);


  if (isMountedLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  let content
  if (!persist) { // persist: no
    content = <Outlet />
  } else if (isLoading) { //persist: yes, token: no
    content = <Spinner />
  } else if (isError) { //persist: yes, token: no
    // Get current page path
    const currentPath = location.pathname;

    // Different content based on current page
    let errorContent;

    if (currentPath === '/login' || currentPath === '/register') {
      // On auth pages, show minimal error
      errorContent = (
        <p className='errmsg'>
          Session expired. Please try logging in again.
        </p>
      );
    } else if (currentPath === '/' || currentPath === '/posts') {
      // On home/posts pages, allow viewing but suggest login
      errorContent = (
        <>
          <p className='errmsg'>
            Logged out. <Link to="/login">Login</Link> to post and interact, or continue browsing without logging in.
          </p>
          <Outlet />
        </>
      );
    } else if (currentPath.startsWith('/singlepost')) {
      // On single post pages, allow viewing but suggest login
      errorContent = (
        <>
          <p className='errmsg'>
            You are not logged in. <Link to="/login">Login</Link> to access all features, or continue browsing.
          </p>
          <Outlet />
        </>
      );
    } else if (currentPath.match(/^\/[^\/]+$/)) {
      // Profile pages (/:pageUserName) - allow viewing but suggest login
      errorContent = (
        <>
          <p className='errmsg'>
            You are not logged in. <Link to="/login">Login</Link> to access all features, or continue browsing.
          </p>
          <Outlet />
        </>
      );
    } else {
      // Default message for other pages - navigate to login with error
      // This will display the error message on the login page
      navigate('/login', { 
        state: { 
          error: error?.data?.message || 'Session expired. Please login again.' 
        } 
      });
      return null;
    }

    content = errorContent;
  } else if (isSuccess && trueSuccess) { //persist: yes, token: yes
    content = <Outlet />
  } else if (accessToken && isUninitialized) { //persist: yes, token: yes
    content = <Outlet />
  } else {
    content = <Outlet />
  }

  return content
};

export default PersistLogin;