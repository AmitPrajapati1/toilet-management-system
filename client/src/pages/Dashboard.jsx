
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import StatCard from "../components/StatCard";
import PageTitle from "../components/PageTitle";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Tooltip,
    Legend
);

export default function Dashboard() {
    const navigate = useNavigate();

    const [d, setD] = useState({});

    useEffect(() => {
        api
            .get("/dashboard")
            .then((r) => setD(r.data))
            .catch(console.error);
    }, []);

    const totalFamilyHeads = Number(
        d.totalFamilyHeads || 0
    );

    const totalFamilyMembers = Number(
        d.totalFamilyMembers || d.totalMembers || 0
    );

    const familyIncome = Number(
        d.familyIncome || 0
    );

    const individualIncome = Number(
        d.individualIncome || 0
    );

    const expenses = Number(
        d.expenses || 0
    );

    const totalIncome =
        familyIncome + individualIncome;

    const balance = Number(
        d.balance !== undefined
            ? d.balance
            : totalIncome - expenses
    );

    /*
     * Highest Income
     * Compare Family Income and Individual Income
     */
    const highestIncome = Math.max(
        familyIncome,
        individualIncome
    );

    const highestIncomeType =
        familyIncome >= individualIncome
            ? "Family Income"
            : "Individual Income";

    /*
     * Current API provides total expenses only,
     * so total expenses are displayed here.
     */
    const highestExpense = expenses;

    /*
     * Chart Data
     */
    const incomeExpenseData = useMemo(
        () => ({
            labels: [
                "Family Income",
                "Individual Income",
                "Expenses",
            ],
            datasets: [
                {
                    label: "Amount",
                    data: [
                        familyIncome,
                        individualIncome,
                        expenses,
                    ],
                    backgroundColor: [
                        "rgba(25, 135, 84, 0.85)",
                        "rgba(111, 66, 193, 0.85)",
                        "rgba(220, 53, 69, 0.85)",
                    ],
                    borderColor: [
                        "#198754",
                        "#6f42c1",
                        "#dc3545",
                    ],
                    borderWidth: 1,
                    borderRadius: 8,
                },
            ],
        }),
        [
            familyIncome,
            individualIncome,
            expenses,
        ]
    );

    const doughnutData = useMemo(
        () => ({
            labels: [
                "Family Income",
                "Individual Income",
                "Expenses",
            ],
            datasets: [
                {
                    data: [
                        familyIncome,
                        individualIncome,
                        expenses,
                    ],
                    backgroundColor: [
                        "#198754",
                        "#6f42c1",
                        "#dc3545",
                    ],
                    borderWidth: 2,
                },
            ],
        }),
        [
            familyIncome,
            individualIncome,
            expenses,
        ]
    );

    const financialData = useMemo(
        () => ({
            labels: [
                "Income",
                "Expenses",
                "Balance",
            ],
            datasets: [
                {
                    label: "Financial Summary",
                    data: [
                        totalIncome,
                        expenses,
                        balance,
                    ],
                    borderColor: "#0d6efd",
                    backgroundColor:
                        "rgba(13, 110, 253, 0.15)",
                    tension: 0.35,
                    fill: true,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                },
            ],
        }),
        [
            totalIncome,
            expenses,
            balance,
        ]
    );

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <>
            <PageTitle title="Dashboard" />

            {/* =========================
                BASIC STAT CARDS
            ========================== */}

            <div className="row g-3 mb-4">

                {/* Active Families */}
                <div
                    className="col-md-3"
                    onClick={() => navigate("/families")}
                    style={{ cursor: "pointer" }}
                >
                    <StatCard
                        title="Active Families"
                        value={d.families || 0}
                        icon="bi-people"
                    />
                </div>

                {/* Family Heads */}
                <div
                    className="col-md-3"
                    onClick={() => navigate("/families")}
                    style={{ cursor: "pointer" }}
                >
                    <StatCard
                        title="Family Heads"
                        value={totalFamilyHeads}
                        icon="bi-person-badge"
                    />
                </div>

                {/* Total Family Members */}
                <div
                    className="col-md-3"
                    onClick={() => navigate("/families")}
                    style={{ cursor: "pointer" }}
                >
                    <StatCard
                        title="Total Family Members"
                        value={totalFamilyMembers}
                        icon="bi-person-lines-fill"
                    />
                </div>

                {/* Family Income */}
                <div
                    className="col-md-3"
                    onClick={() => navigate("/payments")}
                    style={{ cursor: "pointer" }}
                >
                    <StatCard
                        title="Family Income"
                        value={`₹${familyIncome.toLocaleString("en-IN")}`}
                        icon="bi-wallet2"
                    />
                </div>

                {/* Individual Income */}
                <div
                    className="col-md-3"
                    onClick={() => navigate("/individual")}
                    style={{ cursor: "pointer" }}
                >
                    <StatCard
                        title="Individual Income"
                        value={`₹${individualIncome.toLocaleString("en-IN")}`}
                        icon="bi-cash"
                    />
                </div>

                {/* Expenses */}
                <div
                    className="col-md-3"
                    onClick={() => navigate("/expenses")}
                    style={{ cursor: "pointer" }}
                >
                    <StatCard
                        title="Expenses"
                        value={`₹${expenses.toLocaleString("en-IN")}`}
                        icon="bi-receipt"
                    />
                </div>
            </div>

            {/* =========================
                HIGHLIGHTED FINANCIAL CARDS
            ========================== */}

            <div className="row g-4 mb-4">

                {/* Highest Income */}
                <div
                    className="col-md-4"
                    onClick={() => navigate(
                        highestIncomeType === "Family Income"
                            ? "/payments"
                            : "/individual"
                    )}
                    style={{ cursor: "pointer" }}
                >
                    <div
                        className="card border-0 h-100 shadow-sm"
                        style={{
                            borderLeft:
                                "6px solid #198754",
                            background:
                                "linear-gradient(135deg, #e8f8ef 0%, #ffffff 100%)",
                        }}
                    >
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="text-muted mb-1">
                                        Highest Income
                                    </p>

                                    <h2
                                        className="fw-bold text-success mb-1"
                                        style={{
                                            fontSize:
                                                "2rem",
                                        }}
                                    >
                                        ₹
                                        {highestIncome.toLocaleString(
                                            "en-IN"
                                        )}
                                    </h2>

                                    <small className="text-muted">
                                        {highestIncomeType}
                                    </small>
                                </div>

                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "52px",
                                        height: "52px",
                                        background:
                                            "#198754",
                                        color: "white",
                                    }}
                                >
                                    <i className="bi bi-arrow-up-circle fs-3"></i>
                                </div>
                            </div>

                            <div className="mt-3">
                                <span className="badge bg-success">
                                    Highest Collection
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Highest Expense */}
                <div
                    className="col-md-4"
                    onClick={() =>
                        navigate("/expenses")
                    }
                    style={{ cursor: "pointer" }}
                >
                    <div
                        className="card border-0 h-100 shadow-sm"
                        style={{
                            borderLeft:
                                "6px solid #dc3545",
                            background:
                                "linear-gradient(135deg, #fff0f1 0%, #ffffff 100%)",
                        }}
                    >
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="text-muted mb-1">
                                        Highest Expense
                                    </p>

                                    <h2
                                        className="fw-bold text-danger mb-1"
                                        style={{
                                            fontSize:
                                                "2rem",
                                        }}
                                    >
                                        ₹
                                        {highestExpense.toLocaleString(
                                            "en-IN"
                                        )}
                                    </h2>

                                    <small className="text-muted">
                                        Total Expenses
                                    </small>
                                </div>

                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "52px",
                                        height: "52px",
                                        background:
                                            "#dc3545",
                                        color: "white",
                                    }}
                                >
                                    <i className="bi bi-arrow-down-circle fs-3"></i>
                                </div>
                            </div>

                            <div className="mt-3">
                                <span className="badge bg-danger">
                                    Expense
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Balance */}
                <div
                    className="col-md-4"
                    onClick={() =>
                        navigate("/reports")
                    }
                    style={{ cursor: "pointer" }}
                >
                    <div
                        className="card border-0 h-100 shadow"
                        style={{
                            borderLeft:
                                "6px solid #0d6efd",
                            background:
                                "linear-gradient(135deg, #e9f2ff 0%, #ffffff 100%)",
                        }}
                    >
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p className="text-muted mb-1">
                                        Current Balance
                                    </p>

                                    <h2
                                        className="fw-bold text-primary mb-1"
                                        style={{
                                            fontSize:
                                                "2.2rem",
                                        }}
                                    >
                                        ₹
                                        {balance.toLocaleString(
                                            "en-IN"
                                        )}
                                    </h2>

                                    <small className="text-muted">
                                        Income − Expenses
                                    </small>
                                </div>

                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "58px",
                                        height: "58px",
                                        background:
                                            "#0d6efd",
                                        color: "white",
                                    }}
                                >
                                    <i className="bi bi-bank fs-3"></i>
                                </div>
                            </div>

                            <div className="mt-3">
                                <span className="badge bg-primary">
                                    Current Balance
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================
                SUMMARY
            ========================== */}

            <div className="row g-3 mb-4">

                {/* Total Income */}
                <div
                    className="col-md-4"
                    onClick={() =>
                        navigate("/reports")
                    }
                    style={{ cursor: "pointer" }}
                >
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="text-muted">
                                Total Income
                            </div>

                            <h4 className="fw-bold text-success mb-0">
                                ₹
                                {totalIncome.toLocaleString(
                                    "en-IN"
                                )}
                            </h4>
                        </div>
                    </div>
                </div>

                {/* Total Expenses */}
                <div
                    className="col-md-4"
                    onClick={() =>
                        navigate("/expenses")
                    }
                    style={{ cursor: "pointer" }}
                >
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="text-muted">
                                Total Expenses
                            </div>

                            <h4 className="fw-bold text-danger mb-0">
                                ₹
                                {expenses.toLocaleString(
                                    "en-IN"
                                )}
                            </h4>
                        </div>
                    </div>
                </div>

                {/* Net Balance */}
                <div
                    className="col-md-4"
                    onClick={() =>
                        navigate("/reports")
                    }
                    style={{ cursor: "pointer" }}
                >
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="text-muted">
                                Net Balance
                            </div>

                            <h4 className="fw-bold text-primary mb-0">
                                ₹
                                {balance.toLocaleString(
                                    "en-IN"
                                )}
                            </h4>
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================
                BAR CHART
            ========================== */}

            <div className="row g-4 mb-4">

                {/* Income vs Expenses */}
                <div
                    className="col-lg-8"
                    onClick={() =>
                        navigate("/reports")
                    }
                    style={{ cursor: "pointer" }}
                >
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 pt-4 px-4">
                            <h5 className="fw-bold mb-1">
                                Income vs Expenses
                            </h5>

                            <small className="text-muted">
                                Financial collection comparison
                            </small>
                        </div>

                        <div
                            className="card-body"
                            style={{
                                height: "350px",
                            }}
                        >
                            <Bar
                                data={
                                    incomeExpenseData
                                }
                                options={
                                    chartOptions
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Doughnut */}
                <div
                    className="col-lg-4"
                    onClick={() =>
                        navigate("/reports")
                    }
                    style={{ cursor: "pointer" }}
                >
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 pt-4 px-4">
                            <h5 className="fw-bold mb-1">
                                Collection Breakdown
                            </h5>

                            <small className="text-muted">
                                Income and expense distribution
                            </small>
                        </div>

                        <div
                            className="card-body"
                            style={{
                                height: "350px",
                            }}
                        >
                            <Doughnut
                                data={doughnutData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position:
                                                "bottom",
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* =========================
                FINANCIAL SUMMARY CHART
            ========================== */}

            <div
                className="card border-0 shadow-sm mb-4"
                onClick={() =>
                    navigate("/reports")
                }
                style={{ cursor: "pointer" }}
            >
                <div className="card-header bg-white border-0 pt-4 px-4">
                    <h5 className="fw-bold mb-1">
                        Financial Summary
                    </h5>

                    <small className="text-muted">
                        Income, expenses and current balance
                    </small>
                </div>

                <div
                    className="card-body"
                    style={{
                        height: "350px",
                    }}
                >
                    <Line
                        data={financialData}
                        options={chartOptions}
                    />
                </div>
            </div>
        </>
    );
}

