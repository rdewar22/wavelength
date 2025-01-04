import { Navigate, Routes, Route } from "react-router-dom";
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


function App() {
  return (
    <Routes>
      <Route path="/" element={< Layout />}>
        {/* public routes */}
        <Route index element={<Public />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        {/* protected routes */}
        <Route element={<RequireAuth />}>
          <Route path="welcome" element={<Welcome />} />
          <Route path="userslist" element={<UsersList />} />
          <Route path="postslist" element={<PostsList />} />
          <Route path="addpostform" element={<AddPostForm />} />
        </Route>

        {/* Catch all - replace with 404 component if you want */}
        <Route path="*" element={<NotFound />} />

      </Route>
    </Routes>
  )
  
}

export default App;
