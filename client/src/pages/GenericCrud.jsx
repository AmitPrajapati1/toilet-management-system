import { useEffect, useMemo, useState } from "react";
import PageTitle from "../components/PageTitle";
import { list, create, update, remove } from "../services/api";

export default function GenericCrud({ title, path, fields }) {
  const makeBlank = () => Object.fromEntries(fields.map((f) => [f.key, f.default ?? ""]));
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(makeBlank());
  const [editing, setEditing] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sort, setSort] = useState({ key: fields[0]?.key || "", dir: 1 });

  const load = async () => {
    setLoading(true);
    try {
      const data = await list(path);
      setRows(Array.isArray(data) ? data : []);
      setError("");
    } catch (e) {
      setError(e.response?.data?.message || `Unable to load ${title}. Make sure the backend is running on port 5000.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [path]);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = a[sort.key] ?? "";
      const bv = b[sort.key] ?? "";
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * sort.dir;
      return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" }) * sort.dir;
    });
  }, [rows, sort]);

  const toggleSort = (key) => setSort((s) => ({ key, dir: s.key === key ? -s.dir : 1 }));

  const openAdd = () => {
    setForm(makeBlank());
    setEditing(null);
    setError("");
    setShow(true);
  };

  const openEdit = (row) => {
    const next = {};
    fields.forEach((f) => {
      let value = row[f.key] ?? "";
      if (f.type === "date" && value) value = String(value).slice(0, 10);
      next[f.key] = value;
    });
    setForm(next);
    setEditing(row._id);
    setError("");
    setShow(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      fields.forEach((f) => {
        if (f.type === "number" && payload[f.key] !== "") payload[f.key] = Number(payload[f.key]);
      });
      if (editing) await update(path, editing, payload);
      else await create(path, payload);
      setShow(false);
      setEditing(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || `Unable to save ${title}.`);
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (id) => {
    if (!window.confirm(`Delete this ${title.toLowerCase()} record?`)) return;
    try {
      await remove(path, id);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Unable to delete record.");
    }
  };

  return (
    <>
      <PageTitle title={title}>
        <button className="btn btn-primary" onClick={openAdd}>+ Add {title}</button>
      </PageTitle>

      {error && <div className="alert alert-danger d-flex justify-content-between align-items-center"><span>{error}</span><button className="btn btn-sm btn-outline-danger" onClick={load}>Retry</button></div>}

      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>{title} Records</strong>
          <button className="btn btn-sm btn-outline-secondary" onClick={load}>Refresh</button>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                {fields.map((f) => <th key={f.key} className="sortable" onClick={() => toggleSort(f.key)}>{f.label} ↕</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={fields.length + 1} className="text-center py-5">Loading...</td></tr> :
               sortedRows.length === 0 ? <tr><td colSpan={fields.length + 1} className="text-center py-5 text-muted">No records found. Click “Add {title}” to create one.</td></tr> :
               sortedRows.map((row) => <tr key={row._id}>
                 {fields.map((f) => <td key={f.key}>{f.format ? f.format(row[f.key], row) : (row[f.key] === "" || row[f.key] == null ? "-" : String(row[f.key]))}</td>)}
                 <td className="text-nowrap">
                   <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEdit(row)}>Edit</button>
                   <button className="btn btn-sm btn-outline-danger" onClick={() => deleteRow(row._id)}>Delete</button>
                 </td>
               </tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {show && <div className="modal-backdrop-custom">
        <div className="card modal-card shadow-lg">
          <div className="card-header d-flex justify-content-between align-items-center"><strong>{editing ? "Edit" : "Add"} {title}</strong><button className="btn-close" onClick={() => setShow(false)} /></div>
          <form onSubmit={save}>
            <div className="card-body">
              <div className="row g-3">
                {fields.map((f) => <div className={f.col || "col-12"} key={f.key}>
                  <label className="form-label">{f.label}{f.required && " *"}</label>
                  {f.type === "select" ? <select className="form-select" value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} required={f.required}>
                    <option value="">Select {f.label}</option>{(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
                  </select> : <input type={f.type || "text"} className="form-control" value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} required={f.required} min={f.min} />}
                </div>)}
              </div>
            </div>
            <div className="card-footer text-end"><button type="button" className="btn btn-secondary me-2" onClick={() => setShow(false)}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save"}</button></div>
          </form>
        </div>
      </div>}
    </>
  );
}
