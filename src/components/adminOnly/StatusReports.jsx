import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import styles from '../../styles/adminOnly/StatusReports.module.css';

const AdminReports = () => {
  const [weeks, setWeeks] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [statusData, setStatusData] = useState([]);
  const [userStatusData, setUserStatusData] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Generate last 4 weeks dropdown
  useEffect(() => {
    const today = new Date();
    const weeksArr = [];
    for (let i = 0; i < 4; i++) {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay() - i * 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const label = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
      weeksArr.push(label);
    }
    setWeeks(weeksArr.reverse());
  }, []);

  // Fetch Timesheet Status for selected week
  const fetchStatusData = async (week) => {
    setLoadingStatus(true);
    try {
      const res = await api.get(`/admins/trackStatus`, { params: { week } });
      setStatusData(res.data || []);
    } catch (err) {
      console.error('Error fetching status data:', err);
      setStatusData([]);
    }
    setLoadingStatus(false);
  };
//   Automatically fetch when week changes
  useEffect(() => {
    if (selectedWeek) {
      fetchStatusData(selectedWeek);
    }
  }, [selectedWeek]);

  // Fetch Online/Offline user data
 // Fetch Online/Offline user data
const fetchUserStatus = async (filterValue) => {
  setLoadingUsers(true);
  try {
    // 🔹 Send filter as a query parameter to backend
    const params = filterValue === 'ALL' ? {} : { filterStatus: filterValue };
    const res = await api.get(`/admins/userStatus`, { params });
    setUserStatusData(res.data || []);
  } catch (err) {
    console.error('Error fetching user statuses:', err);
    setUserStatusData([]);
  }
  setLoadingUsers(false);
};

  // Fetch automatically once
useEffect(() => {
  fetchUserStatus(filter);
}, [filter]);

  const filteredUsers =
    userStatusData;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>📊 Admin Reports Dashboard</h2>

      <div className={styles.selectors}>
        {/* Dropdown 1: Week Selection */}
        <div className={styles.dropdownSection}>
          <h3>🗓️ Track Timesheet Status</h3>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)} // ✅ simplified
          >
            <option value="">Select Week</option>
            {weeks.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>

          {loadingStatus ? (
            <p>Loading timesheet data...</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {statusData.length === 0 ? (
                    <tr><td colSpan="3" className={styles.noData}>No records found</td></tr>
                  ) : (
                    statusData.map((item) => (
                      <tr key={item.empId}>
                        <td>{item.empId}</td>
                        <td>{item.name}</td>
                        <td>
                          <span
                            className={`${styles.status} ${
                              styles[item.status.toLowerCase()]
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Dropdown 2: User Status */}
        <div className={styles.dropdownSection}>
          <h3>👥 Track User</h3>
          <div className={styles.filters}>
            <label>Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)} // ✅ triggers auto-fetch
            >
              <option value="ALL">All</option>
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>

          {loadingUsers ? (
            <p>Loading user data...</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Emp ID</th>
                    <th>Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan="3" className={styles.noData}>No users found</td></tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.empId}>
                        <td>{u.empId}</td>
                        <td>{u.name}</td>
                        <td>
                          <span
                            className={`${styles.dot} ${
                              u.status === 'ONLINE' ? styles.online : styles.offline
                            }`}
                          ></span>
                          {u.status}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
