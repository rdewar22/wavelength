import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { setCredentials, selectCurrentToken, logOut, selectCurrentUser } from './authSlice'; 
import { useRefreshMutation } from './authApiSlice';

const PersistLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [refresh] = useRefreshMutation();
  const [isLoading, setIsLoading] = useState(true);
  let accessToken = useSelector(selectCurrentToken);
  const userName = useSelector(selectCurrentUser);

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        const response = await refresh();
        if (isMounted) {
          if (response?.data?.accessToken) {
            dispatch(setCredentials({ 
              user: response.data.userName,
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
          setIsLoading(false);
        }
      }
    };

    // Only verify if we don't have a token
    !accessToken ? verifyRefreshToken() : setIsLoading(false);

    return () => {
      isMounted = false;
    };
  }, [accessToken, refresh, dispatch, navigate]);


  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return <Outlet />;
};

export default PersistLogin;