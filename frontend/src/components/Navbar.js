import "./Navbar.css"
import { useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logOut } from "../features/auth/authSlice"
import { Link } from "react-router-dom"
import { useLogoutMutation } from "../features/auth/authApiSlice"
import { SearchBar } from "./SearchBar"
import { selectCurrentUser } from "../features/auth/authSlice"


export default function Navbar() {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const [logout] = useLogoutMutation();
    const user = useSelector(selectCurrentUser);

    const errRef = useRef();



    const handleLogout = async (e) => {
        e.preventDefault()

        try {
            await logout();
            navigate('/login')
        } catch (err) {
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
                                <button onClick={handleLogout}>Logout</button>
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