import { Link } from "react-router-dom"
import "./Public.css";

const Public = () => {

    const content = (
        <section className="public">
            <header>
                <h1 className="title">Wavelength</h1>
            </header>
            <br />
            <footer className="public-footer">
                <Link to="/register" className="button">register</Link>
                <Link to="/login" className="button">login</Link>
            </footer>
        </section>

    )
    return content
}
export default Public