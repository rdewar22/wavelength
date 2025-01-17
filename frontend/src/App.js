import { useLocation, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Public from "./components/Public";
import Register from "./features/registration/Register";
import Login from "./features/auth/Login";
import Welcome from "./features/auth/Welcome";
import RequireAuth from "./features/auth/RequireAuth";
import UsersList from "./features/users/UsersList";
import PostsList from "./features/posts/PostsList";
import NotFound from "./components/404";
import AddPostForm from "./features/posts/AddPostForm";
import Profile from "./features/profiles/Profile";
import PersistLogin from "./features/auth/PersistLogin";
import Navbar from "./components/Navbar";


function App() {
  const location = useLocation();

  // Define the paths where the navigation bar should be displayed
  const showNavBarPaths = ['/welcome', '/userslist', '/postslist', '/addpostform', '/profile'];

  // Check if the current path matches one of the allowed paths
  const showNavBar = showNavBarPaths.includes(location.pathname);

  return (
    <>
      {/* Conditionally render the navigation bar */}
      {showNavBar && <Navbar />}
      <Routes>
        <Route path="/" element={< Layout />}>
          {/* public routes */}
          <Route index element={<Public />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* protected routes */}
          <Route element={<PersistLogin />}>
            <Route element={<RequireAuth />}>
              <Route path="welcome" element={<Welcome />} />
              <Route path="userslist" element={<UsersList />} />
              <Route path="postslist" element={<PostsList />} />
              <Route path="addpostform" element={<AddPostForm />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Catch all - replace with 404 component if you want */}
          <Route path="*" element={<NotFound />} />

        </Route>
      </Routes>
    </>
  )

}

export default App;
