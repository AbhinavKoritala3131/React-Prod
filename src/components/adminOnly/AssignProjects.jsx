import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import styles from "../../styles/adminOnly/AssignProjects.module.css";

const AssignProjects = () => {
  // ======= State =======
  const [projects, setProjects] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [selectedType, setSelectedType] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [newType, setNewType] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [showDeleteGroup, setShowDeleteGroup] = useState(false); // Toggle for delete group section
  const [showExistingProjects, setShowExistingProjects] = useState(false);

  const [showUserChecklist, setShowUserChecklist] = useState(false); // toggle checklist
  const [activeTab, setActiveTab] = useState("projects"); // "projects" or "user-management"

  // Project form state
  const [projectData, setProjectData] = useState({
    projectName: "",
    projectDescription: "",
    projectStatus: "UPCOMING",
    deadline: "",
    projectType: "",
    isNewType: false,
  });

  // Helper to show message temporarily
const showMessage = (msg, duration = 3000) => {
  setMessage(msg);
  setTimeout(() => {
    setMessage("");
  }, duration);
};


  // ======= Fetch initial data =======
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, employeesRes, typesRes] = await Promise.all([
        api.get("/projects/listAll"),
        api.get("/projects/employees"),
        api.get("/projects/types")
      ]);

      setProjects(projectsRes.data);
      setEmployees(employeesRes.data);
      setProjectTypes(typesRes.data);
    } catch (err) {
      console.error("Error loading data", err);
    }
  };

  // ======= Handlers =======
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmpSelection = (empId) => {
    setSelectedEmpIds((prev) =>
      prev.includes(empId)
        ? prev.filter((id) => id !== empId)
        : [...prev, empId]
    );
  };

  // ======= ADD or UPDATE PROJECT =======
  const handleSaveProject = async (e) => {
  e.preventDefault();
  setLoading(true);
  showMessage("");

  try {
    const finalType =
      projectData.projectType === "new" ? newType.trim() : projectData.projectType;

    if (!finalType) {
      showMessage("❌ Project type is required.");
      setLoading(false);
      return;
    }

    const projectNameTrimmed = projectData.projectName.trim();

    // Prevent duplicate project names
    if (
      !isEditing &&
      projects.some(
        (p) => p.projectName.trim().toLowerCase() === projectNameTrimmed.toLowerCase()
      )
    ) {
      showMessage("❌ Project name already exists.");
        resetForm();  // ✅ Reset form

      setLoading(false);
      return;
    }

    if (
      isEditing &&
      projectNameTrimmed.toLowerCase() !== editingProjectName.toLowerCase() &&
      projects.some(
        (p) => p.projectName.trim().toLowerCase() === projectNameTrimmed.toLowerCase()
      )
    ) {
      showMessage("❌ Another project with this name already exists.");
        resetForm();  // ✅ Reset form

      setLoading(false);
      return;
    }

    const payload = {
      projectName: projectNameTrimmed,
      projectDescription: projectData.projectDescription,
      projectStatus: projectData.projectStatus,
      deadline: projectData.deadline,
      projectType: finalType,
    };

    if (isEditing) {
      // UPDATE
      await api.put(`/projects/name/${editingProjectName}`, payload);
      showMessage("✅ Project updated successfully!");
    } else {
      // CREATE
      await api.post("/projects", payload);

      // Assign employees (avoid duplicates)
      if (selectedEmpIds.length > 0) {
        const existingAssignments = await api.get(`/api/project-groups/type/${finalType}`);
        const existingEmpIds = existingAssignments.data.map((u) => u.empId);
        const uniqueEmpIds = selectedEmpIds.filter(
          (empId) => !existingEmpIds.includes(empId)
        );

        await Promise.all(
          uniqueEmpIds.map((empId) =>
            api.post("/api/project-groups", { empId, projectType: finalType })
          )
        );
      }

      showMessage("✅ Project created successfully!");
    }

    await fetchData();

    // Reset form
    setProjectData({
      projectName: "",
      projectDescription: "",
      projectStatus: "UPCOMING",
      deadline: "",
      projectType: "",
      isNewType: false,
    });
    setSelectedEmpIds([]);
    setNewType("");
    setIsEditing(false);
    setEditingProjectName("");
    setShowUserChecklist(false);

  } catch (err) {
    console.error(err);
    showMessage("❌ Error saving project.");
  } finally {
    setLoading(false);
  }
};


  // ======= DELETE PROJECT =======
  const handleDeleteProject = async (projectName) => {
    if (!window.confirm(`Delete project '${projectName}'?`)) return;
    try {
      await api.delete(`/projects/name/${projectName}`);
      showMessage(`🗑️ Project '${projectName}' deleted.`);
      fetchData();
    } catch (err) {
      console.error(err);
      showMessage("❌ Error deleting project.");
    }
  };

  // ======= FILTER USERS BY TYPE =======
  const handleFilterUsers = async (type) => {
    setSelectedType(type);
    try {
      const { data } = await api.get(`/api/project-groups/type/${type}`);
      setFilteredUsers(data);
    } catch (err) {
      console.error("Error fetching users for type", err);
    }
  };



// ✅ Delete whole project group by project type
// ✅ Delete whole project group by project type
const handleDeleteProjectGroup = async (type) => {
  if (!type) {
    showMessage("❌ Please select a project type to delete.");
    return;
  }
  if (!window.confirm(`Are you sure you want to delete all projects and users under '${type}' group?`))
    return;

  try {
    await api.delete(`/projects/type/${type}`);
    showMessage(`🗑️ Project group '${type}' deleted successfully.`);
    
    // After deletion, refresh project types and any related data
    await fetchData();

    // Reset filtered users or other states as necessary
    setFilteredUsers([]);
    setSelectedType("");

  } catch (err) {
    console.error(err);
    showMessage("❌ Error deleting project group.");
  }
};




  // ======= ADD / REMOVE USERS (User Management Tab) =======
  const handleAddUserToType = async (empId, type) => {
    try {
      await api.post("/api/project-groups", { empId, projectType: type });
      handleFilterUsers(type);
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
  setProjectData({
    projectName: "",
    projectDescription: "",
    projectStatus: "UPCOMING",
    deadline: "",
    projectType: "",
    isNewType: false,
  });
  setSelectedEmpIds([]);
  setNewType("");
  setIsEditing(false);
  setEditingProjectName("");
  setShowUserChecklist(false);
};


//   POPULATE FORM FOR EDITING

const handleEditClick = (project) => {
  setProjectData({
    projectName: project.projectName,
    projectDescription: project.projectDescription,
    projectStatus: project.projectStatus,
    deadline: project.deadline,
    projectType: project.projectType,
    isNewType: false,
  });
  setEditingProjectName(project.projectName);
  setIsEditing(true);
};


  const handleDeleteUserFromType = async (empId, type) => {
    try {
      await api.delete(`/api/project-groups/${type}/${empId}`);
      handleFilterUsers(type);
    } catch (err) {
      console.error(err);
    }
  };

  // ======= UI =======
  return (
    <div className={styles["proj-container"]}>
      <h2 className={styles["proj-title"]}>Admin Project Management</h2>

      {/* ======= Tabs ======= */}
      <div className={styles["proj-tabs"]}>
        <button
          className={activeTab === "projects" ? styles["active-tab"] : ""}
          onClick={() => setActiveTab("projects")}
        >
          Project Management
        </button>
        <button
          className={activeTab === "user-management" ? styles["active-tab"] : ""}
          onClick={() => setActiveTab("user-management")}
        >
          User Management
        </button>
      </div>

      {/* ======= Project Management Tab ======= */}
      {activeTab === "projects" && (
        <form className={styles["proj-form"]} onSubmit={handleSaveProject}>
          <h3 className={styles["proj-section-title"]}>
            {isEditing ? "Edit Project" : "Add Project"}
          </h3>

          <div className={styles["proj-row"]}>
            <label className={styles["proj-label"]}>
              Project Name:
              <input
                type="text"
                name="projectName"
                value={projectData.projectName}
                onChange={handleChange}
                placeholder="Enter UNIQUE name of the project"
                required
                className={styles["proj-input"]}
              />
            </label>

            <label className={styles["proj-label"]}>
              Description:
              <textarea
                name="projectDescription"
                value={projectData.projectDescription}
                onChange={handleChange}
                required
                placeholder="250 characters MAX"

                className={styles["proj-textarea"]}
              />
            </label>

            <label className={styles["proj-label"]}>
              Status:
              <select
                name="projectStatus"
                value={projectData.projectStatus}
                onChange={handleChange}

                className={styles["proj-select"]}
              >
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="DUE">DUE</option>
                <option value="UPCOMING">UPCOMING</option>
              </select>
              
            </label>

            <label className={styles["proj-label"]}>
              Deadline:
              <input
                type="date"
                name="deadline"
                value={projectData.deadline}
                onChange={handleChange}
                required
                className={styles["proj-input"]}
              />
            </label>

            <label className={styles["proj-label"]}>
              Project Type:
              <select
                name="projectType"
                value={projectData.projectType}
                onChange={(e) => {
                  handleChange(e);
                  if (e.target.value !== "new") setNewType("");
                }}
                className={styles["proj-select"]}
              >
                <option value="">Select Type</option>
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
                <option value="new">+ Add New Type</option>
              </select>
            </label>

            {projectData.projectType === "new" && (
              <input
                type="text"
                placeholder="Enter new type"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className={styles["proj-input"]}
              />
            )}
          </div>

          {/* Assign Employees */}
          <div className={styles["proj-section"]}>
            <h4
              className={styles["proj-section-subtitle"]}
              style={{ cursor: "pointer" }}
              onClick={() => setShowUserChecklist((prev) => !prev)}
            >
              {showUserChecklist ? "▲ Hide Employees" : " ▼ Show Employees to Assign"}
            </h4>
            {showUserChecklist && (
              <div className={styles["proj-emp-list"]}>
                {employees.map((emp) => (
                  <label
                    key={emp.id}
                    className={`${styles["proj-emp-item"]} ${
                      selectedEmpIds.includes(emp.id)
                        ? styles["proj-emp-selected"]
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedEmpIds.includes(emp.id)}
                      onChange={() => handleEmpSelection(emp.id)}
                    />
                    {emp.name} (ID: {emp.id})
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className={styles["proj-submit-btn"]}
            disabled={loading}
          >
            {loading ? "Saving..." : isEditing ? "Update Project" : "Add Project"}
          </button>

          {/* Existing Projects List */}
          <div className={styles["proj-section"]}>
      <h3
        className={styles["proj-section-title"]}
        onClick={() => setShowExistingProjects(!showExistingProjects)}
        style={{ cursor: "pointer" }}
      >
        {showExistingProjects ? "▲ Hide Existing Projects" : "▼ Show Existing Projects"}
      </h3>

      {showExistingProjects && (
        <ul className={styles["proj-list"]}>
          {projects.map((p) => (
            <li key={p.id} className={styles["proj-list-item"]}>
              <span>
                <strong>{p.projectName}</strong> — {p.projectType}
              </span>
              <button
                type="button"
                onClick={() => handleEditClick(p)} // Trigger project edit
                className={styles["proj-edit-btn"]}
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteProject(p.projectName)} // Trigger project delete
                className={styles["proj-delete-btn"]}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
{/* ======= Delete Entire Project Group Section ======= */}
<div className={styles["proj-section"]}>
  <h3
    className={styles["proj-section-title"]}
    onClick={() => setShowDeleteGroup(!showDeleteGroup)}
    style={{ cursor: "pointer" }}
  >
    {showDeleteGroup ? "▲ Hide Delete Group" : "▼ Delete Entire Project Group"}
  </h3>

  {showDeleteGroup && (
    <div className={styles["proj-row"]}>
      <select
  value={selectedType}
  onChange={(e) => setSelectedType(e.target.value)}
  className={styles["proj-select"]}
>
  <option value="">Select Project Type</option>
  {projectTypes.map((type) => (
    <option key={type} value={type}>
      {type}
    </option>
  ))}
</select>

<button
  type="button"
  onClick={() => handleDeleteProjectGroup(selectedType)}
  className={styles["proj-delete-btn"]}
  disabled={!selectedType}
  style={{ marginLeft: "10px" }}
>
  Delete Group
</button>

    </div>
  )}
</div>


        </form>
      )}

      {/* ======= User Management Tab ======= */}
      {activeTab === "user-management" && (
        <div className={styles["proj-section"]}>
          <h3 className={styles["proj-section-title"]}>Manage Users in Project Types</h3>

          <select
            onChange={(e) => handleFilterUsers(e.target.value)}
            value={selectedType}
            className={styles["proj-select"]}
          >
            <option value="">Select Project Type</option>
            {projectTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {selectedType && projectTypes.includes(selectedType) && (
            <>
              <h4 className={styles["proj-section-subtitle"]}>
                Users in {selectedType}
              </h4>
              <ul className={styles["proj-user-list"]}>
                {filteredUsers.map((u) => (
                  <li key={u.empId}>
                    {u.empId}
                    <button
                      onClick={() =>
                        handleDeleteUserFromType(u.empId, selectedType)
                      }
                      className={styles["proj-small-delete"]}
                    >
                      Remove User
                    </button>
                  </li>
                ))}
              </ul>

              {/* Add user to type */}
              <div className={styles["proj-add-user"]}>
                <h5>Add User to {selectedType}</h5>
                <select
                  onChange={(e) =>
                    handleAddUserToType(Number(e.target.value), selectedType)
                  }
                  className={styles["proj-select"]}
                >
                  <option value="">Select User</option>
                  {employees
                    .filter(
                      (e) => !filteredUsers.some((u) => u.empId === e.id)
                    )
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} (ID: {e.id})
                      </option>
                    ))}
                </select>
              </div>
            </>
          )}
        </div>
      )}

      {message && <p className={styles["proj-message"]}>{message}</p>}
    </div>
  );
};

export default AssignProjects;
