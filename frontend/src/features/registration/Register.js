import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRegisterMutation } from "./registrationApiSlice";
import { Link } from "react-router-dom";
import "./Register.css";

const USER_REGEX = /^[A-z][A-z0-9-_]{4,24}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const USERNAME_LENGTH_REGEX = /^.{4,24}$/;
const STARTS_WITH_LETTER_REGEX = /^[A-Za-z]/;
const ALLOWED_CHARS_REGEX = /^[A-Za-z0-9_-]+$/;

const PWD_LENGTH_REGEX = /^.{8,24}$/;
const ONE_UPPERCASE_AND_LOWERCASE_REGEX = /^(?=.*[a-z])(?=.*[A-Z])/;
const ONE_DIGIT_REGEX = /^(?=.*[0-9])/;
const ONE_SPECIAL_CHAR_REGEX = /^(?=.*[!@#$%])/;

const Register = () => {
    const userRef = useRef();
    const errRef = useRef();

    const [user, setUser] = useState('');
    const [validName, setValidName] = useState(false);
    const [validNameLength, setValidNameLength] = useState(false);
    const [nameStartsWithLetter, setNameStartsWithLetter] = useState(false);
    const [validNameAllowedChars, setValidNameAllowedChars] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [pwd, setPwd] = useState('');
    const [pwdIsValid, setPwdIsValid] = useState(false);
    const [isValidPwdLength, setIsValidPwdLength] = useState(false);
    const [hasOneUppercaseAndLowercaseChar, setHasOneUppercaseAndLowercaseChar] = useState(false);
    const [pwdHasADigit, setPwdHasADigit] = useState(false);
    const [pwdHasSpecialChar, setPwdSpecialChar] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);

    const [register, { isLoading }] = useRegisterMutation();
    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setValidName(USER_REGEX.test(user));
        setValidNameLength(USERNAME_LENGTH_REGEX.test(user));
        setNameStartsWithLetter(STARTS_WITH_LETTER_REGEX.test(user));
        setValidNameAllowedChars(ALLOWED_CHARS_REGEX.test(user));
    }, [user])

    useEffect(() => {
        setPwdIsValid(PWD_REGEX.test(pwd));
        setIsValidPwdLength(PWD_LENGTH_REGEX.test(pwd));
        setHasOneUppercaseAndLowercaseChar(ONE_UPPERCASE_AND_LOWERCASE_REGEX.test(pwd));
        setPwdHasADigit(ONE_DIGIT_REGEX.test(pwd));
        setPwdSpecialChar(ONE_SPECIAL_CHAR_REGEX.test(pwd));
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd])

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd, matchPwd])

    const handleSubmit = async (e) => {
        e.preventDefault();
        // if button enabled with JS hack
        const v1 = USER_REGEX.test(user);
        const v2 = PWD_REGEX.test(pwd);
        if (!v1 || !v2) {
            setErrMsg("Invalid Entry");
            return;
        }
        try {
            const response = await register({ user, pwd }).unwrap();

            setSuccess(true);
            //clear state and controlled inputs
            //need value attrib on inputs for this
            // setUser('');
            setPwd('');
            setMatchPwd('');
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 409) {
                setErrMsg('Username Taken');
            } else {
                setErrMsg('Registration Failed')
            }
            errRef.current.focus();
        }
    }

    return (
        <>
            <Link to='/' className="logo">Wavelength</Link>
            {success ? (
                <section className="registerSuccess">
                    <h1>Thank you for registering {user}, welcome to Wavelength.</h1>
                    <p>
                        <br />
                        <Link to='/login'>Sign In</Link>
                    </p>
                </section>
            ) : (
                <section className="registerSection">
                    <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                    <h1>Register</h1>
                    <form onSubmit={handleSubmit} autoComplete="off">
                        <label htmlFor="username">
                            Username:
                            <FontAwesomeIcon icon={faCheck} className={validName ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={validName || !user ? "hide" : "invalid"} />
                        </label>
                        <input
                            type="text"
                            id="username"
                            ref={userRef}
                            autoComplete="off"
                            onChange={(e) => setUser(e.target.value)}
                            value={user}
                            required
                            aria-invalid={validName ? "false" : "true"}
                            aria-describedby="uidnote"
                            onFocus={() => setUserFocus(true)}
                            onBlur={() => setUserFocus(false)}
                        />
                        <p id="uidnote" className={userFocus && user ? "instructions" : "offscreen"}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            Username must be 4 - 24 characters
                            <FontAwesomeIcon icon={faCheck} className={validNameLength ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={validNameLength || !user ? "hide" : "invalid"} />
                            <br />
                            begin with a letter
                            <FontAwesomeIcon icon={faCheck} className={nameStartsWithLetter ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={nameStartsWithLetter || !user ? "hide" : "invalid"} />
                            <br />
                            Letters, numbers, underscores, hyphens allowed.
                            <FontAwesomeIcon icon={faCheck} className={validNameAllowedChars ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={validNameAllowedChars || !user ? "hide" : "invalid"} />
                        </p>


                        <label htmlFor="password">
                            Password:
                            <FontAwesomeIcon icon={faCheck} className={pwdIsValid ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={pwdIsValid || !pwd ? "hide" : "invalid"} />
                        </label>
                        <input
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            onChange={(e) => setPwd(e.target.value)}
                            value={pwd}
                            required
                            aria-invalid={pwdIsValid ? "false" : "true"}
                            aria-describedby="pwdnote"
                            onFocus={() => setPwdFocus(true)}
                            onBlur={() => setPwdFocus(false)}
                        />
                        <p id="pwdnote" className={pwdFocus ? "instructions" : "offscreen"}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            Password must be 8 - 24 characters 
                            <FontAwesomeIcon icon={faCheck} className={isValidPwdLength ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={isValidPwdLength || !user ? "hide" : "invalid"} />
                            <br />
                            include upper and lowercase letters
                            <FontAwesomeIcon icon={faCheck} className={hasOneUppercaseAndLowercaseChar ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={hasOneUppercaseAndLowercaseChar || !user ? "hide" : "invalid"} />
                            <br /> 
                            a number 
                            <FontAwesomeIcon icon={faCheck} className={pwdHasADigit ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={pwdHasADigit || !user ? "hide" : "invalid"} />
                            <br /> 
                            & a special character.
                            <FontAwesomeIcon icon={faCheck} className={pwdHasSpecialChar ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={pwdHasSpecialChar || !user ? "hide" : "invalid"} />
                            <br />
                            
                            Allowed special characters: <span aria-label="exclamation mark">!</span> <span aria-label="at symbol">@</span> <span aria-label="hashtag">#</span> <span aria-label="dollar sign">$</span> <span aria-label="percent">%</span>
                        </p>


                        <label htmlFor="confirm_pwd">
                            Confirm Password:
                            <FontAwesomeIcon icon={faCheck} className={validMatch && matchPwd ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={validMatch || !matchPwd ? "hide" : "invalid"} />
                        </label>
                        <input
                            type="password"
                            id="confirm_pwd"
                            autoComplete="new-password"
                            onChange={(e) => setMatchPwd(e.target.value)}
                            value={matchPwd}
                            required
                            aria-invalid={validMatch ? "false" : "true"}
                            aria-describedby="confirmnote"
                            onFocus={() => setMatchFocus(true)}
                            onBlur={() => setMatchFocus(false)}
                        />
                        <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            Must match the first password input field.
                        </p>

                        <button disabled={!validName || !pwdIsValid || !validMatch ? true : false}>Sign Up</button>
                    </form>
                    <p>
                        Already registered?<br />
                        <span className="line">
                            {/*put router link here*/}
                            <Link to='/login'>Sign In</Link>
                        </span>
                    </p>
                </section>
            )}
        </>
    )
}

export default Register