import "./Navbar.css"
import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logOut } from "../features/auth/authSlice"
import { Link } from "react-router-dom"
import { useLogoutQuery } from "../features/auth/authApiSlice"
import { SearchBar } from "./SearchBar"
import { MessageTab } from "./MessagesTab"

export default function Navbar() {

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [errMsg, setErrMsg] = useState('')
    const errRef = useRef()
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
                <Link to="/postslist" className="site-title">Wavelength</Link>
                <SearchBar />
                <ul>
                    <li>
                        <Link to="/profile">Profile</Link>
                    </li>
                    <li>
                        <Link to="/addpostform">New Post</Link>
                    </li>
                    <li>
                        <a onClick={handleLogout}>Logout</a>
                    </li>
                </ul>
            </nav>
        </>
    )
}