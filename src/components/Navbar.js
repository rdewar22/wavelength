import "./Navbar.css"

export default function Navbar() {
    return <nav className="nav">
        <a href="/" className="site-title">Wavelength</a>
        <ul>
            <li>
                <a href="/messages">Messages</a>
            </li>
            <li>
                <a href="/newpost">New Post</a>
            </li>
        </ul>
    </nav>
}