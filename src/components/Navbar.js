import "./Navbar.css"
import { useRef, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { logOut } from "../features/auth/authSlice"
import { useLogoutQuery } from "../features/auth/authApiSlice"

export default function Navbar() {

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [errMsg, setErrMsg] = useState('')
    const errRef = useRef()



    const handleLogout = async (e) => {
        e.preventDefault()

        try {
            dispatch(logOut());
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
    return <nav className="nav">
        <a href="/" className="site-title">Wavelength</a>
        <ul>
            <li>
                <a href="/messages">Messages</a>
            </li>
            <li>
                <a href="/newpost">New Post</a>
            </li>
            <li>
                <a onClick={handleLogout}>Logout</a>
            </li>
        </ul>
    </nav>
}