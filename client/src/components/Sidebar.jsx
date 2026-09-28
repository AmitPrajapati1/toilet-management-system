import React from "react";
import { NavLink } from "react-router-dom";

const menuItems = [
    {
        to: "/",
        label: "Dashboard",
        icon: "bi-speedometer2",
    },
    {
        to: "/families",
        label: "Families",
        icon: "bi-people",
    },
    {
        to: "/payments",
        label: "Family Payments",
        icon: "bi-cash-stack",
    },
    {
        to: "/individual",
        label: "Individual Payments",
        icon: "bi-person-check",
    },
    {
        to: "/expenses",
        label: "Expenses",
        icon: "bi-receipt",
    },
    {
        to: "/staff",
        label: "Staff",
        icon: "bi-person-badge",
    },
    {
        to: "/cleaning",
        label: "Cleaning",
        icon: "bi-stars",
    },
    {
        to: "/maintenance",
        label: "Maintenance",
        icon: "bi-tools",
    },
    {
        to: "/reports",
        label: "Reports",
        icon: "bi-bar-chart",
    },
    {
        to: "/settings",
        label: "Settings",
        icon: "bi-gear",
    },
];

export default function Sidebar({
    collapsed,
    setCollapsed,
    mobileOpen,
    setMobileOpen,
}) {
    const handleNavClick = () => {
        // Close sidebar on mobile after selecting a page
        if (setMobileOpen) {
            setMobileOpen(false);
        }
    };

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay ${
                    mobileOpen ? "show" : ""
                }`}
                onClick={() => setMobileOpen(false)}
            />

            <aside
                className={`
                    desktop-sidebar
                    ${collapsed ? "sidebar-collapsed" : ""}
                    ${mobileOpen ? "sidebar-mobile-open" : ""}
                `}
            >
                <div className="sidebar">
                    {/* Sidebar Header */}
                    <div className="sidebar-header">
                        <div className="sidebar-brand">
                            <div className="sidebar-brand-icon">
                                <i className="bi bi-building"></i>
                            </div>

                            <div className="sidebar-brand-text">
                                <span className="brand-title">
                                    Toilet Management
                                </span>
                                <span className="brand-subtitle">
                                    Society Management
                                </span>
                            </div>
                        </div>

                        {/* Desktop collapse button */}
                        <button
                            type="button"
                            className="sidebar-collapse-btn"
                            onClick={() => setCollapsed(!collapsed)}
                            title={
                                collapsed
                                    ? "Expand Sidebar"
                                    : "Collapse Sidebar"
                            }
                        >
                            <i
                                className={`bi ${
                                    collapsed
                                        ? "bi-chevron-right"
                                        : "bi-chevron-left"
                                }`}
                            ></i>
                        </button>

                        {/* Mobile close button */}
                        <button
                            type="button"
                            className="sidebar-mobile-close"
                            onClick={() => setMobileOpen(false)}
                            aria-label="Close menu"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="sidebar-nav">
                        <div className="sidebar-section-title">
                            <span>MAIN MENU</span>
                        </div>

                        {menuItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === "/"}
                                onClick={handleNavClick}
                                className={({ isActive }) =>
                                    `sidebar-link ${isActive ? "active" : ""}`
                                }
                                title={collapsed ? item.label : ""}
                            >
                                <span className="sidebar-link-icon">
                                    <i className={`bi ${item.icon}`}></i>
                                </span>

                                <span className="sidebar-link-text">
                                    {item.label}
                                </span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Bottom */}
                    <div className="sidebar-footer">
                        <div className="sidebar-footer-inner">
                            <i className="bi bi-shield-check"></i>

                            <div className="sidebar-footer-text">
                                <strong>Admin Panel</strong>
                                <span>Management System</span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}