import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar({ setMobileOpen }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem("adminLoggedIn");
        localStorage.removeItem("adminLoggedIn");

        navigate("/login", { replace: true });
    };

    return (
        <nav className="top-navbar">
            <div className="navbar-left">
                {/* Mobile menu button */}
                <button
                    type="button"
                    className="mobile-menu-btn"
                    onClick={() => setMobileOpen(true)}
                    aria-label="Open menu"
                >
                    <i className="bi bi-list"></i>
                </button>

                <div className="navbar-page-info">
                    <span className="navbar-welcome">
                        Society Public Toilet Management
                    </span>
                </div>
            </div>

            <div className="navbar-right">
                <div className="navbar-admin">
                    <div className="admin-avatar">
                        <i className="bi bi-person"></i>
                    </div>

                    <div className="admin-info">
                        <strong>Admin</strong>
                        <small>Administrator</small>
                    </div>
                </div>

                {/* Logout Button */}
                <button
                    type="button"
                    className="navbar-logout-btn"
                    onClick={handleLogout}
                    title="Logout"
                >
                    <i className="bi bi-box-arrow-right"></i>
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    );
}