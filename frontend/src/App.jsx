import { useLocation, Routes, Route } from "react-router-dom";
import Register from "./features/registration/Register";
import Login from "./features/auth/Login";
import RequireAuth from "./components/RequireAuth";
import MainFeed from "./features/feed/MainFeed";
import NotFound from "./features/common/404";
import AddPostForm from "./features/posts/AddPostForm";
import Profile from "./features/profiles/Profile";
import PersistLogin from "./components/PersistLogin";
import Navbar from "./features/navbar/Navbar";
import { MessagesTab } from "./features/messages/MessagesTab";
import { ToastContainer } from 'react-toastify';
import SinglePostPage from "./features/posts/SinglePostPage";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const location = useLocation();

  // Define the paths where the navigation bar should be displayed
  const hideNavAndMsgsPaths = ['/login', '/register'];
  
 const showNavAndMsgs = !hideNavAndMsgsPaths.includes(location.pathname);

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
      {showNavAndMsgs && <Navbar />}
      <Routes>
        {/* public routes */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        
        {/* protected routes */}
        <Route element={<PersistLogin />}>
          <Route path="/:pageUserName" element={<Profile />} />
          <Route index element={<MainFeed />} />
          <Route path="singlepost/:postId" element={<SinglePostPage />} />
          <Route element={<RequireAuth />}>
            <Route path="addpostform" element={<AddPostForm />} />
          </Route>
        </Route>

        {/* Catch all - replace with 404 component if you want */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {showNavAndMsgs && <MessagesTab />}
    </>
  )

}

export default App;
