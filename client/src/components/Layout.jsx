import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout() {
    const [collapsed, setCollapsed] = useState(() => {
        const saved =
            localStorage.getItem("sidebarCollapsed");

        return saved === "true";
    });

    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem(
            "sidebarCollapsed",
            collapsed.toString()
        );
    }, [collapsed]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 991) {
                setMobileOpen(false);
            }
        };

        window.addEventListener(
            "resize",
            handleResize
        );

        return () => {
            window.removeEventListener(
                "resize",
                handleResize
            );
        };
    }, []);

    return (
        <div
            className={`app-layout ${
                collapsed
                    ? "sidebar-is-collapsed"
                    : ""
            }`}
        >
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div className="main-wrapper">
                <Navbar
                    setMobileOpen={setMobileOpen}
                />

                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}