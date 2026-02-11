import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">⚡</span>
                    <span className="logo-text">Django React</span>
                </Link>

                <ul className="navbar-menu">
                    <li>
                        <Link
                            to="/"
                            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
                        >
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/about"
                            className={`navbar-link ${isActive('/about') ? 'active' : ''}`}
                        >
                            About
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/dashboard"
                            className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                        >
                            Dashboard
                        </Link>
                    </li>
                </ul>

                <div className="navbar-actions">
                    <button className="btn-secondary">Sign In</button>
                    <button className="btn-primary">Get Started</button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
