import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin");
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Dashboard</h2>
          <button onClick={handleSignOut} style={styles.signOutBtn}>
            Sign Out
          </button>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Your Profile</h3>

          <div style={styles.row}>
            <span style={styles.label}>Name</span>
            <span style={styles.value}>{user?.name || "—"}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Email</span>
            <span style={styles.value}>{user?.email}</span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>Role</span>
            <span style={{
              ...styles.badge,
              background: user?.role === "admin" ? "#fef3c7" : "#ede9fe",
              color: user?.role === "admin" ? "#92400e" : "#5b21b6",
            }}>
              {user?.role}
            </span>
          </div>
          <div style={styles.row}>
            <span style={styles.label}>ID</span>
            <span style={{ ...styles.value, fontSize: 12, color: "#999" }}>{user?.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f5",
    padding: "40px 16px",
  },
  container: {
    maxWidth: 600,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    color: "#111",
  },
  signOutBtn: {
    background: "#ef4444",
    color: "#fff",
    padding: "8px 18px",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: "28px 32px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: "#111",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: "1px solid #eee",
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 0",
    borderBottom: "1px solid #f5f5f5",
  },
  label: {
    fontSize: 14,
    color: "#888",
  },
  value: {
    fontSize: 15,
    color: "#111",
    fontWeight: 500,
  },
  badge: {
    padding: "3px 12px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
  },
};
