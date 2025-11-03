import React, { useState } from "react";
import api from "../../api/axios";
import styles from "../../styles/adminOnly/AdminUserForm.module.css";

const AdminUserForm = () => {
  const [empID, setEmpID] = useState("");
  const [empMail, setEmpMail] = useState("");
  const [role, setRole] = useState("USER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("authorize"); // "authorize" or "remove"

  // --- Authorize user ---
  const handleAuthorize = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage("");

    const userData = { id: empID, username: empMail, role };

    try {
      const response = await api.post("/users/authuser", userData);
      if (response.status === 201) {
        setSuccessMessage("✅ User authorized successfully!");
        setEmpID("");
        setEmpMail("");
        setRole("USER");
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(`❌ ${err.response.data.message}`);
      } else {
        setError("⚠️ An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        setError(null);
        setSuccessMessage("");
      }, 4000);
    }
  };

  // --- Remove access ---
  const handleRemove = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setSuccessMessage("");

  if (!empID && !empMail) {
    setError("⚠️ Please enter either Employee ID or Email to remove access.");
    setLoading(false);
    return;
  }

  try {
    const response = await api.delete("/users/delete", {
      params: {
        id: empID || undefined,
        username: empMail || undefined,
      },
    });
    if (response.status === 200) {
      setSuccessMessage("🗑️ User removed successfully!");
      setEmpID("");
      setEmpMail("");
    }
  } catch (err) {
    setError(
      err.response?.data || "⚠️ Failed to remove user. Please try again."
    );
  } finally {
    setLoading(false);
    setTimeout(() => {
      setError(null);
      setSuccessMessage("");
    }, 4000);
  }
};


  return (
    <div className={styles["proj-container"]}>
      {/* Tabs */}
      <div className={styles["proj-tabs"]}>
        <button
          className={`${activeTab === "authorize" ? styles["active-tab"] : ""}`}
          onClick={() => {
            setActiveTab("authorize");
            setError(null);
            setSuccessMessage("");
          }}
        >
          🛡️ Authorize User
        </button>
        <button
          className={`${activeTab === "remove" ? styles["active-tab"] : ""}`}
          onClick={() => {
            setActiveTab("remove");
            setError(null);
            setSuccessMessage("");
          }}
        >
          🗑️ Remove Access
        </button>
      </div>

      {/* Authorize User Form */}
      {activeTab === "authorize" && (
        <form onSubmit={handleAuthorize}>
          <h3 className={styles["proj-section-title"]}>Authorize User</h3>

          <div className={styles["proj-section"]}>
            <label className={styles["proj-label"]}>Employee ID:</label>
            <input
              type="text"
              value={empID}
              onChange={(e) => setEmpID(e.target.value)}
              required
              maxLength="5"
              pattern="[0-9]{1,5}"
              placeholder="Enter Employee ID (max 5 digits)"
              className={styles["proj-input"]}
            />
          </div>

          <div className={styles["proj-section"]}>
            <label className={styles["proj-label"]}>Employee Email:</label>
            <input
              type="email"
              value={empMail}
              onChange={(e) => setEmpMail(e.target.value)}
              required
              placeholder="Enter Employee Email"
              className={styles["proj-input"]}
            />
          </div>

          <div className={styles["proj-section"]}>
            <label className={styles["proj-label"]}>Role:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className={styles["proj-select"]}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="HR">HR</option>
            </select>
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {successMessage && <p className={styles.success}>{successMessage}</p>}

          <button
            type="submit"
            className={styles["proj-submit-btn"]}
            disabled={loading}
          >
            {loading ? "Processing..." : "Authorize ✅"}
          </button>
        </form>
      )}

      {/* Remove Access Form */}
      {activeTab === "remove" && (
        <form onSubmit={handleRemove}>
          <h3 className={styles["proj-section-title"]}>Remove User Access</h3>

          <div className={styles["proj-section"]}>
            <label className={styles["proj-label"]}>
              Employee ID or Email:
            </label>
            <input
              type="text"
              value={empID}
              onChange={(e) => setEmpID(e.target.value)}
              placeholder="Enter Employee ID (optional)"
              className={styles["proj-input"]}
            />
            <input
              type="email"
              value={empMail}
              onChange={(e) => setEmpMail(e.target.value)}
              placeholder="Enter Employee Email (optional)"
              className={styles["proj-input"]}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {successMessage && <p className={styles.success}>{successMessage}</p>}

          <button
            type="submit"
            className={`${styles["proj-submit-btn"]} ${styles["proj-delete-btn"]}`}
            disabled={loading}
          >
            {loading ? "Processing..." : "Remove Access 🗑️"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminUserForm;