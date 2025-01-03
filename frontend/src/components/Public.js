import { Link } from "react-router-dom"
import "./Public.css";

const Public = () => {

    const content = (
        <section className="public">
            <header>
                <h1>Welcome to Wavelength!</h1>
            </header>
            <footer>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
            </footer>
        </section>

    )
    return content
}
export default Public