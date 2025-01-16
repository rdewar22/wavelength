import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate } from 'react-router-dom';
import { setCredentials, selectCurrentToken, logOut } from './authSlice'; 
import { useRefreshQuery } from './authApiSlice';

const PersistLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { refetch } = useRefreshQuery();
  const [isLoading, setIsLoading] = useState(true);
  let accessToken = useSelector(selectCurrentToken);

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        const response = await refetch();
        console.log("response:", response);
        accessToken = 1;
        if (isMounted) {
          if (response?.data?.accessToken) {
            dispatch(setCredentials({ 
              user: response.data.userName, 
              accessToken: response.data.accessToken 
            }));
          } else {
            dispatch(logOut());
            navigate('/login');
          }
        }
      } catch (err) {
        console.error('Failed to refresh token:', err);
        dispatch(logOut());
        navigate('/login');
      } finally {
        isMounted && setIsLoading(false);
      }
    };

    // Only verify if we don't have a token
    if (!accessToken) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return <Outlet />;
};

export default PersistLogin;