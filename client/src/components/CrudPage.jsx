import { useEffect, useState } from "react";
import PageTitle from "./PageTitle";
import { list, create, update, remove } from "../services/api";

export default function CrudPage({ title, resource, fields, columns, renderCell, transformPayload, emptyText = "No records found." }) {
  const blank = Object.fromEntries(fields.map(f => [f.name, f.default ?? ""]));
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try { setRows(await list(resource)); setError(""); }
    catch (e) { setError(e.response?.data?.message || "Cannot connect to server."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [resource]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = transformPayload ? transformPayload(form) : form;
      if (editingId) await update(resource, editingId, payload);
      else await create(resource, payload);
      setForm(blank); setEditingId(null); await load();
    } catch (e) { setError(e.response?.data?.message || "Save failed."); }
  };

  const edit = row => {
    setEditingId(row._id);
    setForm(Object.fromEntries(fields.map(f => [f.name, row[f.name] ?? ""])));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const del = async id => {
    if (!window.confirm("Delete this record?")) return;
    try { await remove(resource, id); await load(); }
    catch (e) { setError(e.response?.data?.message || "Delete failed."); }
  };
  const cancel = () => { setEditingId(null); setForm(blank); };

  return (
    <>
      <PageTitle title={title} subtitle="Create, view, update and delete records." />
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card p-3 mb-4">
        <h5>{editingId ? "Edit Record" : "Add Record"}</h5>
        <form onSubmit={submit} className="row g-3">
          {fields.map(f => (
            <div className={f.col || "col-md-6"} key={f.name}>
              <label>{f.label}</label>
              {f.type === "select" ? (
                <select className="form-select" value={form[f.name]} onChange={e => setForm({...form, [f.name]: e.target.value})} required={f.required}>
                  <option value="">Select</option>
                  {f.options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
                </select>
              ) : (
                <input className="form-control" type={f.type || "text"} value={form[f.name]} onChange={e => setForm({...form, [f.name]: e.target.value})} placeholder={f.placeholder} required={f.required} min={f.min} />
              )}
            </div>
          ))}
          <div className="col-12">
            <button className="btn btn-primary me-2">{editingId ? "Update" : "Save"}</button>
            {editingId && <button type="button" className="btn btn-secondary" onClick={cancel}>Cancel</button>}
          </div>
        </form>
      </div>
      <div className="card p-3">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}<th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={columns.length+1}>Loading...</td></tr> :
               rows.length === 0 ? <tr><td colSpan={columns.length+1}>{emptyText}</td></tr> :
               rows.map(row => <tr key={row._id}>{columns.map(c => <td key={c.key}>{renderCell ? renderCell(row, c.key) : (row[c.key] ?? "-")}</td>)}<td className="text-nowrap"><button className="btn btn-sm btn-outline-primary me-1" onClick={() => edit(row)}><i className="bi bi-pencil"></i></button><button className="btn btn-sm btn-outline-danger" onClick={() => del(row._id)}><i className="bi bi-trash"></i></button></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
