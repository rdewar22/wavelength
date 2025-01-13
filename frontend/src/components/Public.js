import { Link } from "react-router-dom"
import "./Public.css";

const Public = () => {

    const content = (
        <section className="public">
            <header>
                <h1>Welcome to Wavelength!</h1>
            </header>
            <br />
            <footer className="public-footer">
                <Link to="/register" className="button">Register</Link>
                <Link to="/login" className="button">Login</Link>
            </footer>
        </section>

    )
    return content
}
export default Public