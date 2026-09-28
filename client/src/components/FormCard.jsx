export default function FormCard({ title = "Add New", children }) {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="mb-3">{title}</h5>
        {children}
      </div>
    </div>
  );
}
