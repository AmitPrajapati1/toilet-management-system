
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();
        setError("");

        if (username === "admin" && password === "admin123") {
            sessionStorage.setItem("adminLoggedIn", "true");
            localStorage.removeItem("adminLoggedIn");

            navigate("/", { replace: true });
        } else {
            setError("Invalid username or password");
        }
    };

    return (
        <div className="login-page">
            <div className="login-background-shape shape-one"></div>
            <div className="login-background-shape shape-two"></div>

            <div className="login-card">
                {/* Logo */}
                <div className="login-logo-wrapper">
                    <div className="login-icon">
                        <i className="bi bi-building"></i>
                    </div>
                </div>

                {/* Heading */}
                <div className="login-heading">
                    <h1>Welcome Back</h1>
                    <p>Society Public Toilet Management System</p>
                </div>

                {/* Admin Badge */}
                <div className="login-admin-badge">
                    <i className="bi bi-shield-check"></i>
                    <span>Administrator Login</span>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    {/* Username */}
                    <div className="login-field">
                        <label htmlFor="username">Username</label>

                        <div className="login-input-wrapper">
                            <i className="bi bi-person login-input-icon"></i>

                            <input
                                id="username"
                                type="text"
                                className="login-input"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) =>
                                    setUsername(e.target.value)
                                }
                                autoComplete="username"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="login-field">
                        <label htmlFor="password">Password</label>

                        <div className="login-input-wrapper">
                            <i className="bi bi-lock login-input-icon"></i>

                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                className="login-input login-password-input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                autoComplete="current-password"
                                required
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                <i
                                    className={`bi ${
                                        showPassword
                                            ? "bi-eye-slash"
                                            : "bi-eye"
                                    }`}
                                ></i>
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="login-error">
                            <i className="bi bi-exclamation-circle"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Login Button */}
                    <button type="submit" className="login-submit-btn">
                        <span>Login to Dashboard</span>
                        <i className="bi bi-arrow-right"></i>
                    </button>
                </form>

                {/* Demo Credentials */}
                <div className="login-demo-box">
                    <div className="login-demo-header">
                        <i className="bi bi-info-circle"></i>
                        <span>Demo Credentials</span>
                    </div>

                    <div className="login-demo-row">
                        <span>Username</span>
                        <strong>admin</strong>
                    </div>

                    <div className="login-demo-row">
                        <span>Password</span>
                        <strong>admin123</strong>
                    </div>
                </div>

                {/* Footer */}
                <div className="login-footer">
                    <i className="bi bi-shield-lock"></i>
                    <span>Secure Administrator Access</span>
                </div>
            </div>
        </div>
    );
}
