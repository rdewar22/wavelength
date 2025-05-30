import { useLocation, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Register from "./features/registration/Register";
import Login from "./features/auth/Login";
import Welcome from "./features/auth/Welcome";
import RequireAuth from "./features/auth/RequireAuth";
import PostsList from "./features/posts/PostsList";
import NotFound from "./components/404";
import AddPostForm from "./features/posts/AddPostForm";
import Profile from "./features/profiles/Profile";
import PersistLogin from "./features/auth/PersistLogin";
import Navbar from "./components/Navbar";
import { MessageTab } from "./components/messagesTab/MessagesTab";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const location = useLocation();

  // Define the paths where the navigation bar should be displayed
  const showNavBarPaths = ['/', '/welcome', '/userslist', '/postslist', '/addpostform', '/profile'];
  const showMessageTabPaths = ['/', '/welcome', '/userslist', '/postslist', '/addpostform', '/profile'];

  // Check if the current path matches one of the allowed paths
  const showNavBar = showNavBarPaths.includes(location.pathname);
  const showMessageTab = showMessageTabPaths.includes(location.pathname);

  return (
    <>
      {/* Add ToastContainer at the root level */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick={true}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* Conditionally render the navigation bar */}
      {showNavBar && <Navbar />}
      <Routes>
        <Route path="/" element={< Layout />}>
          {/* public routes */}
          <Route index element={<PostsList />} />
          {/* <Route index element={<Public />} /> */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* protected routes */}
          <Route element={<PersistLogin />}>
            <Route element={<RequireAuth />}>
              <Route path="welcome" element={<Welcome />} />
              <Route path="addpostform" element={<AddPostForm />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Catch all - replace with 404 component if you want */}
          <Route path="*" element={<NotFound />} />

        </Route>
      </Routes>
      {showMessageTab && <MessageTab />}
    </>
  )

}

export default App;
