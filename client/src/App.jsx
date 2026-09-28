import React from "react";
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import Layout from "./components/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Families from "./pages/Families";
import FamilyDetail from "./pages/FamilyDetail";
import Payments from "./pages/Payments";
import IndividualCollection from "./pages/IndividualCollection";
import Expenses from "./pages/Expenses";
import Staff from "./pages/Staff";
import Cleaning from "./pages/Cleaning";
import Maintenance from "./pages/Maintenance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";


/* =========================
   Protected Route
========================= */

function ProtectedRoute({ children }) {
    const isLoggedIn =
        sessionStorage.getItem("adminLoggedIn") === "true";

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return children;
}


/* =========================
   App
========================= */

export default function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* =========================
                    Login Page
                ========================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* =========================
                    Protected Application
                ========================== */}

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    {/* Dashboard */}
                    <Route
                        index
                        element={<Dashboard />}
                    />

                    {/* Families */}
                    <Route
                        path="families"
                        element={<Families />}
                    />

                    {/* Family Details */}
                    <Route
                        path="families/:id"
                        element={<FamilyDetail />}
                    />

                    {/* Family Payments */}
                    <Route
                        path="payments"
                        element={<Payments />}
                    />

                    {/* Individual Payments */}
                    <Route
                        path="individual"
                        element={<IndividualCollection />}
                    />

                    {/* Expenses */}
                    <Route
                        path="expenses"
                        element={<Expenses />}
                    />

                    {/* Staff */}
                    <Route
                        path="staff"
                        element={<Staff />}
                    />

                    {/* Cleaning */}
                    <Route
                        path="cleaning"
                        element={<Cleaning />}
                    />

                    {/* Maintenance */}
                    <Route
                        path="maintenance"
                        element={<Maintenance />}
                    />

                    {/* Reports */}
                    <Route
                        path="reports"
                        element={<Reports />}
                    />

                    {/* Settings */}
                    <Route
                        path="settings"
                        element={<Settings />}
                    />
                </Route>


                {/* =========================
                    Unknown URL
                ========================== */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}