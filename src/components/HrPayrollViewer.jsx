import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import styles from '../styles/HrPayrollViewer.module.css';

const HrPayrollViewer = () => {
  const [weeks, setWeeks] = useState([]);
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noData, setNoData] = useState(false);

  // Generate weeks from last 2 months (8 weeks)
  useEffect(() => {
    const generatedWeeks = [];
    const today = new Date();

    for (let i = 0; i < 8; i++) {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay() - i * 7); // Sunday
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // Saturday
      const formatDate = (d) => d.toLocaleDateString();
      generatedWeeks.push(`${formatDate(start)} - ${formatDate(end)}`);
    }

    generatedWeeks.reverse(); // chronological order
    setWeeks(generatedWeeks);
    setSelectedWeekIndex(generatedWeeks.length - 1);
  }, []);

  // Fetch data when week changes
  useEffect(() => {
    if (weeks.length === 0) return;
    const selectedWeek = weeks[selectedWeekIndex];

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/hr/getByWeek`, {
          params: { week: selectedWeek }
        });
        if (res.status === 204 || res.data.length === 0) {
          setNoData(true);
          setRecords([]);
        } else {
          setRecords(res.data);
          setNoData(false);
        }
      } catch (err) {
        console.error('Error fetching HR data:', err);
        setNoData(true);
      }
      setLoading(false);
    };

    fetchData();
  }, [selectedWeekIndex, weeks]);

  return (
    <div className={styles.container}>
      <h2 className={styles.h2}>🧾 Payroll Review</h2>

      <div className={styles.weekSelector}>
        <button
          disabled={selectedWeekIndex === 0}
          onClick={() => setSelectedWeekIndex((i) => i - 1)}
        >
          ◀ Previous
        </button>
        <span>{weeks[selectedWeekIndex]}</span>
        <button
          disabled={selectedWeekIndex === weeks.length - 1}
          onClick={() => setSelectedWeekIndex((i) => i + 1)}
        >
          Next ▶
        </button>
      </div>
    <div className={styles.contentWrapper}>
      {loading ? (
        <div className={styles.loading}>Loading records...</div>
      ) : noData ? (
        <div className={styles.noData}>
          <p>🎉 No payroll records for this week!</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Emp ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>SSN</th>
                <th>Hours</th>
                <th className={styles.fixedWidthColumn}>Worked On</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.employee_id}>
                  <td>{r.employee_id}</td>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.ssn}</td>
                  <td>{Math.floor(r.hours / 60)}h {r.hours % 60}m</td>
                  <td className={styles.fixedWidthColumn} title={r.worked}>
  {r.worked.length > 300
    ? r.worked.slice(0, 300) + "..."
    : r.worked}
</td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    </div>
  );
};

export default HrPayrollViewer;
