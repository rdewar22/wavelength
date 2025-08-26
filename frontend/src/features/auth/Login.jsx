import { useRef, useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"

import { useDispatch } from "react-redux"
import { setCredentials } from "../../components/authSlice"
import { useLoginMutation } from "../../components/authApiSlice"
import usePersist from "../../hooks/usePersist"
import './Login.css'


const Login = () => {
    const userRef = useRef()
    const errRef = useRef()
    const [user, setUser] = useState('')
    const [pwd, setPwd] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [errMsg, setErrMsg] = useState('')
    const navigate = useNavigate()
    const location = useLocation()
    const [persist, setPersist] = usePersist()

    const [login, { isLoading }] = useLoginMutation()
    const dispatch = useDispatch()

    useEffect(() => {
        userRef.current.focus()
    }, [])

    // Check for error message from navigation state (from PersistLogin)
    useEffect(() => {
        if (location.state?.error) {
            setErrMsg(location.state.error);
            // Clear the state to prevent showing the error again on refresh
            location.state.error = null;
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const userData = await login({ user, pwd }).unwrap()
            dispatch(setCredentials({ 
                user: userData.user,
                accessToken: userData.accessToken,
                userId: userData.userId,
                isProfPicInDb: userData.isProfPicInDb
            }))
            setUser('')
            setPwd('')
            navigate('/')
        } catch (err) {
            if (!err?.originalStatus) {
                setErrMsg('No Server Response');
            } else if (err.originalStatus === 400) {
                setErrMsg('Missing Username or Password');
            } else if (err.originalStatus === 401) {
                setErrMsg('Unauthorized');
            } else {
                setErrMsg('Login Failed')
            }
            if (errRef.current) {
                errRef.current.focus();
            }
        }
    }

    const handleUserInput = (e) => setUser(e.target.value)
    const handlePwdInput = (e) => setPwd(e.target.value)
    const handlePersistClick = () => setPersist(prev => !prev)
    const togglePasswordVisibility = () => setShowPassword(prev => !prev)

    const content = isLoading ? <h1 className="loading-message">This page may take up to 50 seconds to load because I am using the free plan of my hosting service. Welcome to the site! My name is Robby Dewar, and I am primarily using this site to showcase my abilities as a web designer. Thank you for visiting! Please let me know if you encounter any bugs. You can contact me at dewarrob@msu.edu.

        If you are viewing this site because I applied for a job at your company, I believe I would make a great addition to any team. I hold a bachelor's degree in Computer Science from Michigan State University, and most of my experience lies in developing web applications. I am a an open-minded individual who believes that computers have the potential to make the world an infinitely better place.

        </h1> : (
        <section className="login">
            <Link to='/' className="logo">Wavelength</Link>
            <p 
                ref={errRef} 
                className={`${errMsg ? "errmsg" : "offscreen"} ${errMsg ? "navigation-error" : ""}`} 
                aria-live="assertive"
            >
                {errMsg}
            </p>


            <h1 className="login-header">Login</h1>


            <form className="login-form" onSubmit={handleSubmit}>
                <label className="username-label" htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    ref={userRef}
                    value={user}
                    onChange={handleUserInput}
                    autoComplete="username"
                    required
                />

                <label className="password-label" htmlFor="password">Password:</label>
                <div className="password-input-container">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        onChange={handlePwdInput}
                        value={pwd}
                        autoComplete="current-password"
                        required
                    />
                    <button
                        type="button"
                        className="password-visible-btn"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </button>
                </div>
                <label htmlFor="persist" className="form-persist">
                    <input
                        type="checkbox"
                        className="form-checkbox"
                        id="persist"
                        onChange={handlePersistClick}
                        checked={persist}
                    />
                    Trust This Device
                </label>
                <div className="login-links-container">
                    <Link className="no_account" to='/register'>Don't have an account?</Link>
                    <Link className="forgot_password" to='/register'>Forgot Password?</Link>
                </div>
                <button className="sign-in-btn">Sign In</button>
            </form>
        </section>
    )

    return content
}

export default Login