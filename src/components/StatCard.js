export default function StatCard({ icon, color, label, value }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>
        <i className={`bx ${icon}`}></i>
      </div>
      <div className="stat-info">
        <p>{label}</p>
        <h3>{value}</h3>
      </div>
    </div>
  );
}
