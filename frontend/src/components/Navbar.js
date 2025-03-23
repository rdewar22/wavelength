import "./Navbar.css"
import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logOut } from "../features/auth/authSlice"
import { Link } from "react-router-dom"
import { useLogoutQuery } from "../features/auth/authApiSlice"
import { SearchBar } from "./SearchBar"
import { selectCurrentUser } from "../features/auth/authSlice"
import { MessageTab } from "./MessagesTab"

export default function Navbar() {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const user = useSelector(selectCurrentUser);

    const [errMsg, setErrMsg] = useState('');
    const errRef = useRef();
    const { logout } = useLogoutQuery();



    const handleLogout = async (e) => {
        e.preventDefault()

        try {
            dispatch(logOut());
            await logout();
            navigate('/login')
        } catch (err) {
            if (!err?.originalStatus) {
                setErrMsg('No Server Response');
            } else if (err.originalStatus === 401) {
                setErrMsg('Unauthorized');
            } else {
                setErrMsg('Logout Failed')
            }
            if (errRef.current) {
                errRef.current.focus();
            }
        }
    }
    return (
        <>
            <nav className="nav">
                <Link to="/" className="site-title">Wavelength</Link>
                <SearchBar />
                <ul>
                    <li>
                        <Link to="/profile">Profile</Link>
                    </li>
                    <li>
                        <Link to="/addpostform">New Post</Link>
                    </li>
                    {user ? (
                        <>
                            <li>
                                <a onClick={handleLogout}>Logout</a>
                            </li>
                        </>
                    ) : (
                        // Show Login and Register if no user is logged in
                        <>
                            <li>
                                <Link to="/login">Login</Link>
                            </li>
                            <li>
                                <Link to="/register">Register</Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </>
    )
}