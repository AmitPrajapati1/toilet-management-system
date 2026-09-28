import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const RELATIONS = [
  "Father",
  "Mother",
  "Husband",
  "Wife",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Grandfather",
  "Grandmother",
  "Grandson",
  "Granddaughter",
  "Other",
];

const GENDERS = ["Male", "Female", "Other"];

const EMPTY_MEMBER = {
  name: "",
  relation: "",
  gender: "",
};

const EMPTY_FORM = {
  headName: "",
  phone: "",
  address: "",
  active: true,
  members: [],
};

export default function Families() {
  const navigate = useNavigate();

  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [sort, setSort] = useState({
    key: "familyId",
    dir: "asc",
  });

  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;

  /* ================================
       LOAD FAMILIES
    ================================= */

  const loadFamilies = async () => {
    try {
      setLoading(true);

      const response = await api.get("/families");

      setFamilies(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load families:", error);

      alert(error.response?.data?.message || "Failed to load families.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFamilies();
  }, []);

  /* ================================
       SEARCH
    ================================= */

  const filteredFamilies = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return families;
    }

    return families.filter((family) => {
      const familyId = String(family.familyId ?? "").toLowerCase();

      const headName = String(family.headName ?? "").toLowerCase();

      const phone = String(
        family.phone ?? family.mobile ?? family.phoneNumber ?? "",
      ).toLowerCase();

      const address = String(family.address ?? "").toLowerCase();

      return (
        familyId.includes(value) ||
        headName.includes(value) ||
        phone.includes(value) ||
        address.includes(value)
      );
    });
  }, [families, search]);

  /* ================================
       SORT
    ================================= */

  const sortedFamilies = useMemo(() => {
    const data = [...filteredFamilies];

    data.sort((a, b) => {
      let aValue = a?.[sort.key];
      let bValue = b?.[sort.key];

      if (sort.key === "familyId") {
        aValue = Number(aValue || 0);
        bValue = Number(bValue || 0);
      } else {
        aValue = String(aValue ?? "").toLowerCase();

        bValue = String(bValue ?? "").toLowerCase();
      }

      if (aValue < bValue) {
        return sort.dir === "asc" ? -1 : 1;
      }

      if (aValue > bValue) {
        return sort.dir === "asc" ? 1 : -1;
      }

      return 0;
    });

    return data;
  }, [filteredFamilies, sort]);

  /* ================================
       PAGINATION
    ================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(sortedFamilies.length / ITEMS_PER_PAGE),
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedFamilies = sortedFamilies.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  /* ================================
       SORT HANDLER
    ================================= */

  const handleSort = (key) => {
    setSort((current) => {
      if (current.key === key) {
        return {
          key,
          dir: current.dir === "asc" ? "desc" : "asc",
        };
      }

      return {
        key,
        dir: "asc",
      };
    });
  };

  const renderSortIcon = (key) => {
    if (sort.key !== key) {
      return <i className="bi bi-arrow-down-up sort-icon-muted"></i>;
    }

    return (
      <i
        className={`bi ${
          sort.dir === "asc" ? "bi-arrow-up" : "bi-arrow-down"
        } sort-icon-active`}
      ></i>
    );
  };

  /* ================================
       OPEN ADD MODAL
    ================================= */

  const openAddModal = () => {
    setEditingFamily(null);

    setForm({
      ...EMPTY_FORM,
      members: [],
    });

    setShowModal(true);
  };

  /* ================================
       OPEN EDIT MODAL
    ================================= */

  const openEditModal = (family) => {
    setEditingFamily(family);

    setForm({
      headName: family.headName || "",
      phone: family.phone || family.mobile || family.phoneNumber || "",
      address: family.address || "",
      active: typeof family.active === "boolean" ? family.active : true,
      members: Array.isArray(family.members)
        ? family.members.map((member) => ({
            name: member.name || "",
            relation: member.relation || "",
            gender: member.gender || "",
          }))
        : [],
    });

    setShowModal(true);
  };

  /* ================================
       CLOSE MODAL
    ================================= */

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingFamily(null);

    setForm({
      ...EMPTY_FORM,
      members: [],
    });
  };

  /* ================================
       FORM CHANGE
    ================================= */

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* ================================
       ADD MEMBER
    ================================= */

  const addMember = () => {
    setForm((current) => ({
      ...current,
      members: [...(current.members || []), { ...EMPTY_MEMBER }],
    }));
  };

  /* ================================
       MEMBER CHANGE
    ================================= */

  const updateMember = (index, field, value) => {
    setForm((current) => {
      const members = [...(current.members || [])];

      members[index] = {
        ...members[index],
        [field]: value,
      };

      return {
        ...current,
        members,
      };
    });
  };

  /* ================================
       REMOVE MEMBER
    ================================= */

  const removeMember = (index) => {
    setForm((current) => ({
      ...current,
      members: current.members.filter(
        (_, memberIndex) => memberIndex !== index,
      ),
    }));
  };

  /* ================================
       SAVE FAMILY
    ================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.headName.trim()) {
      alert("Please enter Family Head Name.");
      return;
    }

    const cleanedMembers = (form.members || []).map((member) => ({
      name: member.name.trim(),
      relation: member.relation,
      gender: member.gender,
    }));

    const invalidMember = cleanedMembers.find(
      (member) => !member.name || !member.relation || !member.gender,
    );

    if (invalidMember) {
      alert("Please complete all Family Member details.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        headName: form.headName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        active: form.active,
        members: cleanedMembers,
      };

      if (editingFamily?._id) {
        await api.put(`/families/${editingFamily._id}`, payload);
      } else {
        await api.post("/families", payload);
      }

      await loadFamilies();

      closeModal();
    } catch (error) {
      console.error("Failed to save family:", error);

      alert(error.response?.data?.message || "Failed to save family.");
    } finally {
      setSaving(false);
    }
  };

  /* ================================
       DELETE FAMILY
    ================================= */

  const handleDelete = async (family) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Family ID ${family.familyId}?`,
    );

    if (!confirmed) return;

    try {
      await api.delete(`/families/${family._id}`);

      await loadFamilies();
    } catch (error) {
      console.error("Failed to delete family:", error);

      alert(error.response?.data?.message || "Failed to delete family.");
    }
  };

  /* ================================
       TOGGLE ACTIVE
    ================================= */

  const toggleActive = async (family) => {
    try {
      await api.put(`/families/${family._id}`, {
        active: !family.active,
      });

      await loadFamilies();
    } catch (error) {
      console.error("Failed to update family status:", error);

      alert(error.response?.data?.message || "Failed to update family status.");
    }
  };

  /* ================================
       MEMBER COUNT
    ================================= */

  const getMemberCount = (family) => {
    return Array.isArray(family.members) ? family.members.length : 0;
  };

  /* ================================
       PAGE BUTTONS
    ================================= */

  const pageNumbers = [];

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="page-container">
      {/* =================================
                PAGE HEADER
            ================================= */}

      <div className="page-header">
        <div>
          <h1 className="page-title">Families</h1>

          <p className="page-subtitle">
            Manage society families and family members
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary add-family-btn"
          onClick={openAddModal}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Add Family
        </button>
      </div>

      {/* =================================
                TABLE CARD
            ================================= */}

      <div className="card page-card shadow-sm">
        <div className="card-body p-0">
          {/* Search */}
          <div className="families-toolbar">
            <div className="families-search">
              <i className="bi bi-search"></i>

              <input
                type="text"
                className="form-control"
                placeholder="Search Family ID, Head Name, Phone or Address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearch("")}
                  title="Clear Search"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>

            <div className="family-count">
              <strong>{sortedFamilies.length}</strong> Families
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table custom-table align-middle mb-0">
              <thead>
                <tr>
                  <th
                    className="sortable-th"
                    onClick={() => handleSort("familyId")}
                  >
                    <span>Family ID</span>
                    {renderSortIcon("familyId")}
                  </th>

                  <th
                    className="sortable-th"
                    onClick={() => handleSort("headName")}
                  >
                    <span>Family Head</span>
                    {renderSortIcon("headName")}
                  </th>

                  <th>Phone Number</th>

                  <th>Address</th>

                  <th>Members</th>

                  <th
                    className="sortable-th"
                    onClick={() => handleSort("active")}
                  >
                    <span>Status</span>
                    {renderSortIcon("active")}
                  </th>

                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="table-empty-state">
                      <div className="loading-state">
                        <div
                          className="spinner-border text-primary"
                          role="status"
                        ></div>

                        <span>Loading families...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedFamilies.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="table-empty-state">
                      <div className="empty-table-state">
                        <i className="bi bi-people"></i>

                        <h5>No Families Found</h5>

                        <p>
                          {search
                            ? "Try a different search."
                            : "Add your first family to get started."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedFamilies.map((family) => (
                    <tr key={family._id}>
                      <td>
                        <span className="family-id-badge">
                          #{family.familyId}
                        </span>
                      </td>

                      <td>
                        <div className="family-head-cell">
                          <div className="family-avatar">
                            {String(family.headName || "F")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{family.headName}</strong>
                          </div>
                        </div>
                      </td>

                      <td>
                        {family.phone ||
                          family.mobile ||
                          family.phoneNumber ||
                          "—"}
                      </td>

                      <td>
                        <span className="address-cell">
                          {family.address || "—"}
                        </span>
                      </td>

                      <td>
                        <span className="member-count-badge">
                          {getMemberCount(family)}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`status-badge ${
                            family.active ? "status-active" : "status-inactive"
                          }`}
                          onClick={() => toggleActive(family)}
                          title="Click to change status"
                        >
                          <span className="status-dot"></span>

                          {family.active ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td>
                        <div className="table-actions justify-content-end">
                          <button
                            type="button"
                            className="action-btn action-view"
                            title="View Family"
                            onClick={() => navigate(`/families/${family._id}`)}
                          >
                            <i className="bi bi-eye"></i>
                          </button>

                          <button
                            type="button"
                            className="action-btn action-edit"
                            title="Edit Family"
                            onClick={() => openEditModal(family)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          <button
                            type="button"
                            className="action-btn action-delete"
                            title="Delete Family"
                            onClick={() => handleDelete(family)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && sortedFamilies.length > 0 && (
            <div className="families-pagination">
              <div className="pagination-info">
                Showing{" "}
                <strong>
                  {Math.min(
                    (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1,
                    sortedFamilies.length,
                  )}
                </strong>{" "}
                to{" "}
                <strong>
                  {Math.min(
                    safeCurrentPage * ITEMS_PER_PAGE,
                    sortedFamilies.length,
                  )}
                </strong>{" "}
                of <strong>{sortedFamilies.length}</strong> families
              </div>

              <div className="pagination-buttons">
                <button
                  type="button"
                  className="pagination-btn"
                  disabled={safeCurrentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                >
                  <i className="bi bi-chevron-left"></i>
                </button>

                {pageNumbers.map((page) => (
                  <button
                    type="button"
                    key={page}
                    className={`pagination-btn ${
                      safeCurrentPage === page ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  className="pagination-btn"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =================================
                ADD / EDIT FAMILY MODAL
            ================================= */}

      {showModal && (
        <div
          className="modal-backdrop-custom"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="card modal-card shadow-lg"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* =========================
                            MODAL HEADER
                        ========================== */}

            <div className="card-header modal-header-custom">
              <div className="modal-title-wrapper">
                <div className="modal-title-icon">
                  <i
                    className={`bi ${
                      editingFamily ? "bi-pencil-square" : "bi-person-plus"
                    }`}
                  ></i>
                </div>

                <div>
                  <strong>
                    {editingFamily ? "Edit Family" : "Add Family"}
                  </strong>

                  <small>
                    {editingFamily
                      ? "Update family information"
                      : "Add a new family to the society"}
                  </small>
                </div>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* =========================
                            MODAL BODY
                            THIS AREA SCROLLS
                        ========================== */}

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="card-body modal-body-custom">
                {/* Family ID */}
                {editingFamily && (
                  <div className="family-id-info">
                    <div className="family-id-info-icon">
                      <i className="bi bi-hash"></i>
                    </div>

                    <div>
                      <strong>Family ID: {editingFamily.familyId}</strong>

                      <span>Family ID is unique and cannot be changed.</span>
                    </div>
                  </div>
                )}

                {/* Family Head Section */}
                <div className="form-section">
                  <div className="form-section-title">
                    <i className="bi bi-person"></i>

                    <div>
                      <strong>Family Head Details</strong>

                      <span>Basic information about the family head</span>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        Family Head Name
                        <span className="required-star">*</span>
                      </label>

                      <input
                        type="text"
                        name="headName"
                        className="form-control"
                        placeholder="Enter family head name"
                        value={form.headName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Mobile Number</label>

                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        placeholder="Enter mobile number"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Address</label>

                      <textarea
                        name="address"
                        className="form-control"
                        rows="3"
                        placeholder="Enter family address"
                        value={form.address}
                        onChange={handleChange}
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <div className="active-toggle-wrapper">
                        <div>
                          <strong>Family Status</strong>

                          <small>
                            Active families are included in regular management.
                          </small>
                        </div>

                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="familyActive"
                            name="active"
                            checked={form.active}
                            onChange={handleChange}
                          />

                          <label
                            className="form-check-label"
                            htmlFor="familyActive"
                          >
                            {form.active ? "Active" : "Inactive"}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Family Members Section */}
                <div className="form-section members-section">
                  <div className="members-section-header">
                    <div className="form-section-title mb-0">
                      <i className="bi bi-people"></i>

                      <div>
                        <strong>Family Members</strong>

                        <span>Add members belonging to this family</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary add-member-btn"
                      onClick={addMember}
                    >
                      <i className="bi bi-plus-lg me-2"></i>
                      Add Member
                    </button>
                  </div>

                  <div className="members-list">
                    {form.members.length === 0 ? (
                      <div className="empty-members">
                        <div className="empty-members-icon">
                          <i className="bi bi-person-plus"></i>
                        </div>

                        <strong>No family members added</strong>

                        <span>Click "Add Member" to add family members.</span>
                      </div>
                    ) : (
                      form.members.map((member, index) => (
                        <div className="family-member-card" key={index}>
                          <div className="family-member-card-header">
                            <div className="member-number">
                              <span>{index + 1}</span>

                              <strong>Member {index + 1}</strong>
                            </div>

                            <button
                              type="button"
                              className="btn btn-outline-danger remove-member-btn"
                              onClick={() => removeMember(index)}
                            >
                              <i className="bi bi-trash me-1"></i>
                              Remove
                            </button>
                          </div>

                          <div className="row g-3">
                            <div className="col-md-5">
                              <label className="form-label">
                                Member Name
                                <span className="required-star">*</span>
                              </label>

                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter member name"
                                value={member.name}
                                onChange={(event) =>
                                  updateMember(
                                    index,
                                    "name",
                                    event.target.value,
                                  )
                                }
                                required
                              />
                            </div>

                            <div className="col-md-4">
                              <label className="form-label">
                                Relation
                                <span className="required-star">*</span>
                              </label>

                              <select
                                className="form-select"
                                value={member.relation}
                                onChange={(event) =>
                                  updateMember(
                                    index,
                                    "relation",
                                    event.target.value,
                                  )
                                }
                                required
                              >
                                <option value="">Select Relation</option>

                                {RELATIONS.map((relation) => (
                                  <option key={relation} value={relation}>
                                    {relation}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="col-md-3">
                              <label className="form-label">
                                Gender
                                <span className="required-star">*</span>
                              </label>

                              <select
                                className="form-select"
                                value={member.gender}
                                onChange={(event) =>
                                  updateMember(
                                    index,
                                    "gender",
                                    event.target.value,
                                  )
                                }
                                required
                              >
                                <option value="">Select Gender</option>

                                {GENDERS.map((gender) => (
                                  <option key={gender} value={gender}>
                                    {gender}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* =========================
                                MODAL FOOTER
                                NEVER SCROLLS
                            ========================== */}

              <div className="card-footer modal-footer-custom">
                <button
                  type="button"
                  className="btn btn-light modal-cancel-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  <i className="bi bi-x-lg me-2"></i>
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-primary modal-save-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      Save Family
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
