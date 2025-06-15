import { useSelector } from "react-redux";
import { selectCurrentUserName, selectCurrentToken } from "./authSlice";
import { Link } from "react-router-dom";

const Welcome = () => {
    const userName = useSelector(selectCurrentUserName)
    const token = useSelector(selectCurrentToken)

    const welcome = userName ? `Welcome ${userName}!` : 'Welcome!'
    const tokenAbbr = `${token.slice(0, 9)}...`

    const content = (
        <section className="welcome">
            <h1>{welcome}</h1>
            <p>Token: {tokenAbbr}</p>
            <p><Link to="/userslist">Go the the Users List</Link></p>
        </section>
    )
    return content
}    

export default Welcome