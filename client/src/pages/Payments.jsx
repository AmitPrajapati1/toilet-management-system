import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { api } from "../services/api";

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

const PAYMENT_METHODS = [
    "Cash",
    "UPI",
    "Bank Transfer",
    "Cheque",
    "Other",
];

const PAYMENT_STATUSES = [
    "Paid",
    "Pending",
];

const getToday = () => {
    return new Date().toISOString().split("T")[0];
};

const getCurrentMonthYear = () => {
    const now = new Date();

    return {
        month: MONTHS[now.getMonth()],
        year: now.getFullYear(),
    };
};

const getEmptyForm = () => {
    const current = getCurrentMonthYear();

    return {
        familyId: "",
        month: current.month,
        year: current.year,
        amount: 120,
        method: "Cash",
        paidDate: getToday(),
        status: "Paid",
    };
};

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [families, setFamilies] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState(getEmptyForm());

    // --------------------------------------------------
    // TABLE SEARCH
    // --------------------------------------------------

    const [searchBy, setSearchBy] = useState("familyId");
    const [searchText, setSearchText] = useState("");

    // --------------------------------------------------
    // TABLE SORTING
    // --------------------------------------------------

    const [sortField, setSortField] = useState("paidDate");
    const [sortDirection, setSortDirection] = useState("desc");

    // --------------------------------------------------
    // SEARCHABLE FAMILY SELECTOR
    // --------------------------------------------------

    const [familySearch, setFamilySearch] = useState("");
    const [showFamilyResults, setShowFamilyResults] =
        useState(false);

    const familySearchRef = useRef(null);

    // --------------------------------------------------
    // LOAD DATA
    // --------------------------------------------------

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                paymentsResponse,
                familiesResponse,
            ] = await Promise.all([
                api.get("/family-payments"),
                api.get("/families"),
            ]);

            setPayments(paymentsResponse.data || []);
            setFamilies(familiesResponse.data || []);
        } catch (err) {
            console.error(
                "Failed to load payment data:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Failed to load family payment data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --------------------------------------------------
    // FAMILY HELPERS
    // --------------------------------------------------

    const findFamily = (familyId) => {
        return families.find(
            (family) =>
                String(family.familyId) ===
                String(familyId)
        );
    };

    const getFamilyName = (payment) => {
        const family = findFamily(payment.familyId);

        return (
            payment.headName ||
            payment.familyHeadName ||
            family?.headName ||
            family?.familyHeadName ||
            "-"
        );
    };

    const getFamilyPhone = (payment) => {
        const family = findFamily(payment.familyId);

        return (
            payment.phone ||
            payment.mobile ||
            payment.phoneNumber ||
            family?.phone ||
            family?.mobile ||
            family?.phoneNumber ||
            "-"
        );
    };

    // --------------------------------------------------
    // SELECTED FAMILY
    // --------------------------------------------------

    const selectedFamily = useMemo(() => {
        if (!form.familyId) {
            return null;
        }

        return findFamily(form.familyId);
    }, [form.familyId, families]);

    // --------------------------------------------------
    // SEARCHABLE FAMILY RESULTS
    // --------------------------------------------------

    const filteredFamilies = useMemo(() => {
        const search = familySearch
            .trim()
            .toLowerCase();

        let result = [...families];

        if (search) {
            result = result.filter((family) => {
                const familyId = String(
                    family.familyId || ""
                ).toLowerCase();

                const headName = String(
                    family.headName ||
                        family.familyHeadName ||
                        ""
                ).toLowerCase();

                const phone = String(
                    family.phone ||
                        family.mobile ||
                        family.phoneNumber ||
                        ""
                ).toLowerCase();

                return (
                    familyId.includes(search) ||
                    headName.includes(search) ||
                    phone.includes(search)
                );
            });
        }

        return result.slice(0, 50);
    }, [families, familySearch]);

    // --------------------------------------------------
    // TABLE SEARCH
    // --------------------------------------------------

    const filteredPayments = useMemo(() => {
        const search = searchText
            .trim()
            .toLowerCase();

        if (!search) {
            return payments;
        }

        return payments.filter((payment) => {
            if (searchBy === "familyId") {
                return String(
                    payment.familyId || ""
                )
                    .toLowerCase()
                    .includes(search);
            }

            if (searchBy === "headName") {
                return getFamilyName(payment)
                    .toLowerCase()
                    .includes(search);
            }

            return true;
        });
    }, [
        payments,
        searchText,
        searchBy,
        families,
    ]);

    // --------------------------------------------------
    // TABLE SORTING
    // --------------------------------------------------

    const sortedPayments = useMemo(() => {
        const data = [...filteredPayments];

        data.sort((a, b) => {
            let valueA;
            let valueB;

            switch (sortField) {
                case "familyId":
                    valueA = String(
                        a.familyId || ""
                    );
                    valueB = String(
                        b.familyId || ""
                    );
                    break;

                case "headName":
                    valueA = getFamilyName(a);
                    valueB = getFamilyName(b);
                    break;

                case "phone":
                    valueA = getFamilyPhone(a);
                    valueB = getFamilyPhone(b);
                    break;

                case "month":
                    valueA = `${
                        a.year || ""
                    }-${MONTHS.indexOf(a.month)}`;

                    valueB = `${
                        b.year || ""
                    }-${MONTHS.indexOf(b.month)}`;
                    break;

                case "amount":
                    valueA = Number(a.amount || 0);
                    valueB = Number(b.amount || 0);
                    break;

                case "method":
                    valueA = String(
                        a.method || ""
                    );
                    valueB = String(
                        b.method || ""
                    );
                    break;

                case "paidDate":
                    valueA = new Date(
                        a.paidDate || 0
                    ).getTime();

                    valueB = new Date(
                        b.paidDate || 0
                    ).getTime();
                    break;

                case "status":
                    valueA = String(
                        a.status || ""
                    );
                    valueB = String(
                        b.status || ""
                    );
                    break;

                default:
                    valueA = "";
                    valueB = "";
            }

            if (
                typeof valueA === "string" &&
                typeof valueB === "string"
            ) {
                const result =
                    valueA.localeCompare(
                        valueB,
                        undefined,
                        {
                            numeric: true,
                            sensitivity: "base",
                        }
                    );

                return sortDirection === "asc"
                    ? result
                    : -result;
            }

            if (valueA < valueB) {
                return sortDirection === "asc"
                    ? -1
                    : 1;
            }

            if (valueA > valueB) {
                return sortDirection === "asc"
                    ? 1
                    : -1;
            }

            return 0;
        });

        return data;
    }, [
        filteredPayments,
        sortField,
        sortDirection,
        families,
    ]);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection((current) =>
                current === "asc"
                    ? "desc"
                    : "asc"
            );
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const sortIcon = (field) => {
        if (sortField !== field) {
            return "↕";
        }

        return sortDirection === "asc"
            ? "↑"
            : "↓";
    };

    // --------------------------------------------------
    // FAMILY SELECTOR
    // --------------------------------------------------

    const selectFamily = (family) => {
        setForm((current) => ({
            ...current,
            familyId: family.familyId,
        }));

        setFamilySearch("");
        setShowFamilyResults(false);
        setError("");
    };

    const clearSelectedFamily = () => {
        setForm((current) => ({
            ...current,
            familyId: "",
        }));

        setFamilySearch("");
        setShowFamilyResults(false);
    };

    // Close family search when clicking outside
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                familySearchRef.current &&
                !familySearchRef.current.contains(
                    event.target
                )
            ) {
                setShowFamilyResults(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );
        };
    }, []);

    // --------------------------------------------------
    // ADD PAYMENT
    // --------------------------------------------------

    const openAddModal = () => {
        setEditingId(null);
        setForm(getEmptyForm());

        setFamilySearch("");
        setShowFamilyResults(false);

        setError("");
        setSuccess("");

        setShowModal(true);
    };

    // --------------------------------------------------
    // EDIT PAYMENT
    // --------------------------------------------------

    const openEditModal = (payment) => {
        const current = getCurrentMonthYear();

        setEditingId(payment._id);

        setForm({
            familyId: payment.familyId || "",
            month:
                payment.month ||
                current.month,
            year:
                payment.year ||
                current.year,
            amount:
                payment.amount !== undefined &&
                payment.amount !== null
                    ? payment.amount
                    : 120,
            method:
                payment.method || "Cash",
            paidDate: payment.paidDate
                ? String(
                      payment.paidDate
                  ).substring(0, 10)
                : getToday(),
            status:
                payment.status || "Paid",
        });

        setFamilySearch("");
        setShowFamilyResults(false);

        setError("");
        setSuccess("");

        setShowModal(true);
    };

    // --------------------------------------------------
    // CLOSE MODAL
    // --------------------------------------------------

    const closeModal = () => {
        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingId(null);
        setForm(getEmptyForm());

        setFamilySearch("");
        setShowFamilyResults(false);
        setError("");
    };

    // --------------------------------------------------
    // FORM CHANGE
    // --------------------------------------------------

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    // --------------------------------------------------
    // ADD / UPDATE PAYMENT
    // --------------------------------------------------

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!form.familyId) {
            setError(
                "Please select a family."
            );
            return;
        }

        if (!form.month) {
            setError(
                "Please select a month."
            );
            return;
        }

        if (
            !form.amount ||
            Number(form.amount) <= 0
        ) {
            setError(
                "Please enter a valid amount."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const payload = {
                familyId: form.familyId,
                month: form.month,
                year: Number(form.year),
                amount: Number(form.amount),
                method: form.method,
                paidDate: form.paidDate,
                status: form.status,
            };

            if (editingId) {
                await api.put(
                    `/family-payments/${editingId}`,
                    payload
                );

                setSuccess(
                    "Payment updated successfully."
                );
            } else {
                await api.post(
                    "/family-payments",
                    payload
                );

                setSuccess(
                    "Payment added successfully."
                );
            }

            setShowModal(false);
            setEditingId(null);
            setForm(getEmptyForm());

            setFamilySearch("");
            setShowFamilyResults(false);

            await loadData();
        } catch (err) {
            console.error(
                "Payment save error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Unable to save payment."
            );
        } finally {
            setSaving(false);
        }
    };

    // --------------------------------------------------
    // DELETE PAYMENT
    // --------------------------------------------------

    const handleDelete = async (payment) => {
        const familyName =
            getFamilyName(payment);

        const confirmed = window.confirm(
            `Are you sure you want to delete this payment?\n\nFamily: ${familyName}\nMonth: ${
                payment.month || "-"
            } ${payment.year || ""}`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/family-payments/${payment._id}`
            );

            setSuccess(
                "Payment deleted successfully."
            );

            await loadData();
        } catch (err) {
            console.error(
                "Payment delete error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Unable to delete payment."
            );
        }
    };

    // --------------------------------------------------
    // FORMAT DATE
    // --------------------------------------------------

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return String(date);
        }

        return parsed.toLocaleDateString(
            "en-IN"
        );
    };

    // --------------------------------------------------
    // STATUS CLASS
    // --------------------------------------------------

    const getStatusClass = (status) => {
        if (
            String(status).toLowerCase() ===
            "paid"
        ) {
            return "bg-success";
        }

        return "bg-warning text-dark";
    };

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    return (
        <div className="container-fluid py-3">

            {/* PAGE HEADER */}

            <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                <div>
                    <h2 className="mb-1">
                        Family Payments
                    </h2>

                    <p className="text-muted mb-0">
                        Manage monthly family
                        payments of ₹120.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openAddModal}
                >
                    <i className="bi bi-plus-lg me-1"></i>
                    Add Payment
                </button>
            </div>

            {/* SUCCESS MESSAGE */}

            {success && (
                <div
                    className="alert alert-success alert-dismissible fade show"
                    role="alert"
                >
                    {success}

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() =>
                            setSuccess("")
                        }
                    ></button>
                </div>
            )}

            {/* ERROR MESSAGE */}

            {error && !showModal && (
                <div
                    className="alert alert-danger alert-dismissible fade show"
                    role="alert"
                >
                    {error}

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() =>
                            setError("")
                        }
                    ></button>
                </div>
            )}

            {/* TABLE SEARCH */}

            <div className="card shadow-sm mb-3">
                <div className="card-body">
                    <div className="row g-2 align-items-end">

                        <div className="col-md-3">
                            <label className="form-label fw-semibold">
                                Search By
                            </label>

                            <select
                                className="form-select"
                                value={searchBy}
                                onChange={(event) => {
                                    setSearchBy(
                                        event.target.value
                                    );
                                    setSearchText("");
                                }}
                            >
                                <option value="familyId">
                                    Family ID
                                </option>

                                <option value="headName">
                                    Family Head Name
                                </option>
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label fw-semibold">
                                Search
                            </label>

                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bi bi-search"></i>
                                </span>

                                <input
                                    type="text"
                                    className="form-control"
                                    value={searchText}
                                    onChange={(event) =>
                                        setSearchText(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder={
                                        searchBy ===
                                        "familyId"
                                            ? "Enter Family ID..."
                                            : "Enter Family Head Name..."
                                    }
                                />

                                {searchText && (
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() =>
                                            setSearchText(
                                                ""
                                            )
                                        }
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="text-muted small">
                                Showing{" "}
                                <strong>
                                    {
                                        sortedPayments.length
                                    }
                                </strong>{" "}
                                of{" "}
                                <strong>
                                    {payments.length}
                                </strong>{" "}
                                payments
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PAYMENT TABLE */}

            <div className="card shadow-sm">
                <div className="card-body p-0">

                    {loading ? (
                        <div className="text-center py-5">
                            <div
                                className="spinner-border text-primary"
                                role="status"
                            ></div>

                            <div className="mt-2 text-muted">
                                Loading payments...
                            </div>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover table-bordered align-middle mb-0">

                                <thead className="table-light">
                                    <tr>

                                        <th
                                            role="button"
                                            onClick={() =>
                                                handleSort(
                                                    "familyId"
                                                )
                                            }
                                            className="text-nowrap"
                                        >
                                            Family ID{" "}
                                            {sortIcon(
                                                "familyId"
                                            )}
                                        </th>

                                        <th
                                            role="button"
                                            onClick={() =>
                                                handleSort(
                                                    "headName"
                                                )
                                            }
                                            className="text-nowrap"
                                        >
                                            Family Head Name{" "}
                                            {sortIcon(
                                                "headName"
                                            )}
                                        </th>

                                        <th
                                            role="button"
                                            onClick={() =>
                                                handleSort(
                                                    "phone"
                                                )
                                            }
                                            className="text-nowrap"
                                        >
                                            Phone Number{" "}
                                            {sortIcon(
                                                "phone"
                                            )}
                                        </th>

                                        <th
                                            role="button"
                                            onClick={() =>
                                                handleSort(
                                                    "month"
                                                )
                                            }
                                            className="text-nowrap"
                                        >
                                            Month{" "}
                                            {sortIcon(
                                                "month"
                                            )}
                                        </th>

                                        <th
                                            role="button"
                                            onClick={() =>
                                                handleSort(
                                                    "amount"
                                                )
                                            }
                                            className="text-nowrap"
                                        >
                                            Amount{" "}
                                            {sortIcon(
                                                "amount"
                                            )}
                                        </th>

                                        <th
                                            role="button"
                                            onClick={() =>
                                                handleSort(
                                                    "method"
                                                )
                                            }
                                            className="text-nowrap"
                                        >
                                            Method{" "}
                                            {sortIcon(
                                                "method"
                                            )}
                                        </th>

                                        <th
                                            role="button"
                                            onClick={() =>
                                                handleSort(
                                                    "paidDate"
                                                )
                                            }
                                            className="text-nowrap"
                                        >
                                            Paid Date{" "}
                                            {sortIcon(
                                                "paidDate"
                                            )}
                                        </th>

                                        <th
                                            role="button"
                                            onClick={() =>
                                                handleSort(
                                                    "status"
                                                )
                                            }
                                            className="text-nowrap"
                                        >
                                            Status{" "}
                                            {sortIcon(
                                                "status"
                                            )}
                                        </th>

                                        <th className="text-nowrap">
                                            Actions
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>
                                    {sortedPayments.length ===
                                    0 ? (
                                        <tr>
                                            <td
                                                colSpan="9"
                                                className="text-center py-5"
                                            >
                                                <div className="text-muted">
                                                    <i className="bi bi-receipt fs-2 d-block mb-2"></i>

                                                    {searchText
                                                        ? "No payments found for your search."
                                                        : "No family payments found."}
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedPayments.map(
                                            (payment) => (
                                                <tr
                                                    key={
                                                        payment._id
                                                    }
                                                >
                                                    <td>
                                                        <strong>
                                                            {payment.familyId ||
                                                                "-"}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {getFamilyName(
                                                            payment
                                                        )}
                                                    </td>

                                                    <td>
                                                        {getFamilyPhone(
                                                            payment
                                                        )}
                                                    </td>

                                                    <td>
                                                        {payment.month ||
                                                            "-"}{" "}
                                                        {payment.year ||
                                                            ""}
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            ₹
                                                            {Number(
                                                                payment.amount ||
                                                                    0
                                                            ).toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        {payment.method ||
                                                            "-"}
                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            payment.paidDate
                                                        )}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`badge ${getStatusClass(
                                                                payment.status
                                                            )}`}
                                                        >
                                                            {payment.status ||
                                                                "Pending"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="d-flex gap-1">

                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-primary"
                                                                title="Edit Payment"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        payment
                                                                    )
                                                                }
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-danger"
                                                                title="Delete Payment"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        payment
                                                                    )
                                                                }
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>

                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    )}
                                </tbody>

                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* ==================================================
                ADD / EDIT MODAL
            ================================================== */}

            {showModal && (
                <>
                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">

                            <div className="modal-content">

                                <form
                                    onSubmit={
                                        handleSubmit
                                    }
                                >

                                    {/* MODAL HEADER */}

                                    <div className="modal-header">
                                        <h5 className="modal-title">
                                            {editingId
                                                ? "Edit Family Payment"
                                                : "Add Family Payment"}
                                        </h5>

                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={
                                                closeModal
                                            }
                                            disabled={
                                                saving
                                            }
                                        ></button>
                                    </div>

                                    {/* MODAL BODY */}

                                    <div className="modal-body">

                                        {error && (
                                            <div className="alert alert-danger">
                                                {error}
                                            </div>
                                        )}

                                        <div className="row g-3">

                                            {/* FAMILY SELECTOR */}

                                            <div className="col-12">

                                                <label className="form-label fw-semibold">
                                                    Family{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>

                                                <div
                                                    className="position-relative"
                                                    ref={
                                                        familySearchRef
                                                    }
                                                >

                                                    {!selectedFamily ? (
                                                        <>
                                                            <div className="input-group">

                                                                <span className="input-group-text">
                                                                    <i className="bi bi-search"></i>
                                                                </span>

                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={
                                                                        familySearch
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) => {
                                                                        setFamilySearch(
                                                                            event
                                                                                .target
                                                                                .value
                                                                        );

                                                                        setShowFamilyResults(
                                                                            true
                                                                        );
                                                                    }}
                                                                    onFocus={() =>
                                                                        setShowFamilyResults(
                                                                            true
                                                                        )
                                                                    }
                                                                    placeholder="Search Family ID, Family Head Name or Phone Number..."
                                                                    autoComplete="off"
                                                                />

                                                            </div>

                                                            {showFamilyResults && (
                                                                <div
                                                                    className="position-absolute bg-white border rounded shadow-sm w-100"
                                                                    style={{
                                                                        zIndex: 1060,
                                                                        maxHeight:
                                                                            "280px",
                                                                        overflowY:
                                                                            "auto",
                                                                    }}
                                                                >
                                                                    {filteredFamilies.length ===
                                                                    0 ? (
                                                                        <div className="p-3 text-center text-muted">
                                                                            <i className="bi bi-search fs-4 d-block mb-1"></i>

                                                                            No family found.
                                                                        </div>
                                                                    ) : (
                                                                        filteredFamilies.map(
                                                                            (
                                                                                family
                                                                            ) => {
                                                                                const familyPhone =
                                                                                    family.phone ||
                                                                                    family.mobile ||
                                                                                    family.phoneNumber ||
                                                                                    "-";

                                                                                const familyName =
                                                                                    family.headName ||
                                                                                    family.familyHeadName ||
                                                                                    "-";

                                                                                return (
                                                                                    <button
                                                                                        type="button"
                                                                                        key={
                                                                                            family._id
                                                                                        }
                                                                                        className="dropdown-item p-3 border-bottom"
                                                                                        onClick={() =>
                                                                                            selectFamily(
                                                                                                family
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <div className="d-flex justify-content-between align-items-start">

                                                                                            <div>

                                                                                                <div className="fw-semibold">
                                                                                                    {
                                                                                                        family.familyId
                                                                                                    }
                                                                                                </div>

                                                                                                <div>
                                                                                                    {
                                                                                                        familyName
                                                                                                    }
                                                                                                </div>

                                                                                                <small className="text-muted">
                                                                                                    {
                                                                                                        familyPhone
                                                                                                    }
                                                                                                </small>

                                                                                            </div>

                                                                                            <i className="bi bi-chevron-right text-muted"></i>

                                                                                        </div>
                                                                                    </button>
                                                                                );
                                                                            }
                                                                        )
                                                                    )}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="border rounded p-3 bg-light">

                                                            <div className="d-flex justify-content-between align-items-center">

                                                                <div>

                                                                    <div className="fw-bold">
                                                                        {
                                                                            selectedFamily.familyId
                                                                        }
                                                                    </div>

                                                                    <div>
                                                                        {selectedFamily.headName ||
                                                                            selectedFamily.familyHeadName ||
                                                                            "-"}
                                                                    </div>

                                                                    <small className="text-muted">
                                                                        {selectedFamily.phone ||
                                                                            selectedFamily.mobile ||
                                                                            selectedFamily.phoneNumber ||
                                                                            "-"}
                                                                    </small>

                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    onClick={
                                                                        clearSelectedFamily
                                                                    }
                                                                >
                                                                    <i className="bi bi-arrow-left me-1"></i>
                                                                    Change
                                                                </button>

                                                            </div>

                                                        </div>
                                                    )}

                                                </div>

                                                <small className="text-muted">
                                                    Search by Family ID,
                                                    Family Head Name,
                                                    or Phone Number.
                                                </small>

                                            </div>

                                            {/* MONTH */}

                                            <div className="col-md-4">

                                                <label className="form-label fw-semibold">
                                                    Month{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>

                                                <select
                                                    name="month"
                                                    className="form-select"
                                                    value={
                                                        form.month
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    required
                                                >
                                                    {MONTHS.map(
                                                        (
                                                            month
                                                        ) => (
                                                            <option
                                                                key={
                                                                    month
                                                                }
                                                                value={
                                                                    month
                                                                }
                                                            >
                                                                {
                                                                    month
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>

                                            </div>

                                            {/* YEAR */}

                                            <div className="col-md-4">

                                                <label className="form-label fw-semibold">
                                                    Year
                                                </label>

                                                <select
                                                    name="year"
                                                    className="form-select"
                                                    value={
                                                        form.year
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                >
                                                    {Array.from(
                                                        {
                                                            length: 6,
                                                        },
                                                        (
                                                            _,
                                                            index
                                                        ) =>
                                                            new Date().getFullYear() -
                                                            2 +
                                                            index
                                                    ).map(
                                                        (
                                                            year
                                                        ) => (
                                                            <option
                                                                key={
                                                                    year
                                                                }
                                                                value={
                                                                    year
                                                                }
                                                            >
                                                                {
                                                                    year
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>

                                            </div>

                                            {/* AMOUNT */}

                                            <div className="col-md-4">

                                                <label className="form-label fw-semibold">
                                                    Amount{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>

                                                <div className="input-group">

                                                    <span className="input-group-text">
                                                        ₹
                                                    </span>

                                                    <input
                                                        type="number"
                                                        name="amount"
                                                        className="form-control"
                                                        value={
                                                            form.amount
                                                        }
                                                        onChange={
                                                            handleChange
                                                        }
                                                        min="1"
                                                        required
                                                    />

                                                </div>

                                            </div>

                                            {/* PAYMENT METHOD */}

                                            <div className="col-md-4">

                                                <label className="form-label fw-semibold">
                                                    Payment Method
                                                </label>

                                                <select
                                                    name="method"
                                                    className="form-select"
                                                    value={
                                                        form.method
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                >
                                                    {PAYMENT_METHODS.map(
                                                        (
                                                            method
                                                        ) => (
                                                            <option
                                                                key={
                                                                    method
                                                                }
                                                                value={
                                                                    method
                                                                }
                                                            >
                                                                {
                                                                    method
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>

                                            </div>

                                            {/* STATUS */}

                                            <div className="col-md-4">

                                                <label className="form-label fw-semibold">
                                                    Status
                                                </label>

                                                <select
                                                    name="status"
                                                    className="form-select"
                                                    value={
                                                        form.status
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                >
                                                    {PAYMENT_STATUSES.map(
                                                        (
                                                            status
                                                        ) => (
                                                            <option
                                                                key={
                                                                    status
                                                                }
                                                                value={
                                                                    status
                                                                }
                                                            >
                                                                {
                                                                    status
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>

                                            </div>

                                            {/* PAID DATE */}

                                            <div className="col-md-4">

                                                <label className="form-label fw-semibold">
                                                    Paid Date
                                                </label>

                                                <input
                                                    type="date"
                                                    name="paidDate"
                                                    className="form-control"
                                                    value={
                                                        form.paidDate
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />

                                            </div>

                                        </div>
                                    </div>

                                    {/* MODAL FOOTER */}

                                    <div className="modal-footer">

                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={
                                                closeModal
                                            }
                                            disabled={
                                                saving
                                            }
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={
                                                saving
                                            }
                                        >
                                            {saving ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                    ></span>

                                                    Saving...
                                                </>
                                            ) : editingId ? (
                                                <>
                                                    <i className="bi bi-check-lg me-1"></i>
                                                    Update Payment
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-plus-lg me-1"></i>
                                                    Add Payment
                                                </>
                                            )}
                                        </button>

                                    </div>

                                </form>

                            </div>
                        </div>
                    </div>

                    {/* MODAL BACKDROP */}

                    <div
                        className="modal-backdrop fade show"
                        style={{
                            zIndex: 1040,
                        }}
                        onClick={closeModal}
                    ></div>
                </>
            )}
        </div>
    );
}
