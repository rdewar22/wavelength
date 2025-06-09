import { useRef, useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"

import { useDispatch } from "react-redux"
import { setCredentials } from "./authSlice"
import { useLoginMutation } from "./authApiSlice"
import usePersist from "../../hooks/usePersist"
import './Login.css'


const Login = () => {
    const userRef = useRef()
    const errRef = useRef()
    const [user, setUser] = useState('')
    const [pwd, setPwd] = useState('')
    const [errMsg, setErrMsg] = useState('')
    const navigate = useNavigate()
    const [persist, setPersist] = usePersist()

    const [login, { isLoading }] = useLoginMutation()
    const dispatch = useDispatch()

    useEffect(() => {
        userRef.current.focus()
    }, [])

    useEffect(() => {
        setErrMsg('')
    }, [user, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const userData = await login({ user, pwd }).unwrap()
            dispatch(setCredentials({ ...userData, user }))
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

    const content = isLoading ? <h1 className="loading-message">This page may take up to 50 seconds to load because I am using the free plan of my hosting service. Welcome to the site! My name is Robby Dewar, and I am primarily using this site to showcase my abilities as a web designer. Thank you for visiting! Please let me know if you encounter any bugs. You can contact me at dewarrob@msu.edu.

        If you are viewing this site because I applied for a job at your company, I believe I would make a great addition to any team. I hold a bachelor's degree in Computer Science from Michigan State University, and most of my experience lies in developing web applications. I am a kind and open-minded individual who believes that computers have the potential to make the world an infinitely better place.

        I understand that many people fear a future dominated by technology, worrying that it may cause us to lose our connections to each other and to nature. I believe that computers can actually bring people closer to the world and to those around them. :)</h1> : (
        <section className="login">
            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>

            <Link to='/' className="logo">Wavelength</Link>

            <h1 className="login-header">Login</h1>


            <form className="login-form" onSubmit={handleSubmit}>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    ref={userRef}
                    value={user}
                    onChange={handleUserInput}
                    autoComplete="off"
                    required
                />

                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    onChange={handlePwdInput}
                    value={pwd}
                    required
                />
                <label htmlFor="persist" className="form__persist">
                    <input
                        type="checkbox"
                        className="form__checkbox"
                        id="persist"
                        onChange={handlePersistClick}
                        checked={persist}
                    />
                    Trust This Device
                </label>
                <Link className="no_account" to='/register'>Don't have an account?</Link>
                <Link className="forgot_password" to='/register'>Forgot Password?</Link>
                <button>Sign In</button>
            </form>
        </section>
    )

    return content
}

export default Login