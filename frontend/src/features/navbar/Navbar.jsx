import "./Navbar.css"
import { useRef } from "react"
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logOut, selectCurrentUserName, selectCurrentUserId } from "../auth/authSlice"
import { useLogoutMutation } from "../auth/authApiSlice"
import { UserSearchBar } from "../search/UserSearchBar"
import UserProfileNav from "../profiles/UserProfileNav"


export default function Navbar() {

    const dispatch = useDispatch();
    
    const [logout] = useLogoutMutation();
    const userName = useSelector(selectCurrentUserName);
    const userId = useSelector(selectCurrentUserId);

    const errRef = useRef();



    const handleLogout = async (e) => {
        e.preventDefault()

        try {
            await logout();
            dispatch(logOut());
            // navigate('/login')
        } catch (err) {
            console.error('Logout failed:', err);
            if (errRef.current) {
                errRef.current.focus();
            }
        }
    }

    return (
        <>
            <nav className="nav">
                <Link to="/" className="site-title">Wavelength</Link>
                <UserSearchBar />
                <div className="nav-links">
                    <ul>
                        <li>
                            <UserProfileNav userName={userName} userId={userId} />
                        </li>
                        <li>
                            <Link to="/addpostform">New Post</Link>
                        </li>
                        {userName ? (
                            <>
                                <li>
                                    <button onClick={handleLogout}>Logout</button>
                                </li>
                            </>
                        ) : (
                            // Show Register if no user is logged in
                            <>
                                <li>
                                    <Link to="/register">Register</Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </nav>
        </>
    )
}