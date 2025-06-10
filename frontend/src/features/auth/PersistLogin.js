import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { setCredentials, selectCurrentToken, logOut, selectCurrentUser } from './authSlice';
import { useRefreshMutation } from './authApiSlice';
import { Spinner } from 'reactstrap';
import { Link } from 'react-router-dom';

import usePersist from '../../hooks/usePersist';

const PersistLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMountedLoading, setIsMountedLoading] = useState(true);
  const [trueSuccess, setTrueSuccess] = useState(false);

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
          } else {
            dispatch(logOut());
            // navigate('/login');
          }
        }
      } catch (err) {
        console.error('Failed to refresh token:', err);
        if (isMounted) {
          dispatch(logOut());
          // navigate('/login');
        }
      } finally {
        if (isMounted) {
          setIsMountedLoading(false);
        }
      }
    };

    // Only verify if we don't have a token
    (!accessToken && persist) ? verifyRefreshToken() : setIsMountedLoading(false);

    return () => {
      isMounted = false;
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
    } else if (currentPath === '/profile' || currentPath.startsWith('/profile')) {
      // On profile pages, show profile-specific message
      errorContent = (
        <p className='errmsg'>
          You are not logged in. Please <Link to="/login">login</Link> to access your profile.
        </p>
      );
    } else if (currentPath.startsWith('/publicprofile')) {
      // On public profile pages, allow viewing but suggest login
      errorContent = (
        <>
          <p className='errmsg'>
            You are not logged in. <Link to="/login">Login</Link> to access all features, or continue browsing.
          </p>
          <Outlet />
        </>
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
      // On public profile pages, allow viewing but suggest login
      errorContent = (
        <>
          <p className='errmsg'>
            You are not logged in. <Link to="/login">Login</Link> to access all features, or continue browsing.
          </p>
          <Outlet />
        </>
      );
    } else {
      // Default message for other pages
      errorContent = (
        <p className='errmsg'>
          {`${error?.data?.message} - `}
          <Link to="/login">Please login again</Link>.
        </p>
      );
    }

    content = errorContent;
  } else if (isSuccess && trueSuccess) { //persist: yes, token: yes
    content = <Outlet />
  } else if (accessToken && isUninitialized) { //persist: yes, token: yes
    content = <Outlet />
  }

  return content
};

export default PersistLogin;