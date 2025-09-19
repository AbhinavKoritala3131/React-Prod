// Admin/WeeklyStatusTab.jsx
import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import styles from '../../styles/adminOnly/ManageTS.module.css';


const WeeklyStatusTab = ({ selectedWeek }) => {
  const [statusEntries, setStatusEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState({});

  useEffect(() => {
    const fetchStatuses = async () => {
      if (!selectedWeek) return;
      setLoading(true);
      try {
        const res = await api.get('/admins/status-by-week', {
          params: { week: selectedWeek }
        });
        setStatusEntries(res.data || []);
      } catch (err) {
        console.error('Error fetching statuses:', err);
        alert('❌ Failed to fetch weekly status data');
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
  }, [selectedWeek]);
  const formatTotalFromMinutes = (totalMinutes) => {
  if (typeof totalMinutes !== 'number' || totalMinutes <= 0) return '0.00';
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}.${m.toString().padStart(2, '0')}`;
};


  const handleAction = async (statusId, newStatus) => {
  const statusEntry = statusEntries.find(e => e.id === statusId);
  if (!statusEntry) return;

  const remarkText = remarks[statusId] || (newStatus === 'APPROVED' ? 'Approved' : '');
  if (newStatus === 'REJECTED' && !remarkText) {
    alert('❗ Please provide a reason for rejection.');
    return;
  }

  try {
    await api.put('/admins/update-status', {
      empId: statusEntry.empId,   // ✅ using the found entry
      week: statusEntry.week,
      rem: newStatus
    });

    setStatusEntries(prev =>
      prev.map(e =>
        e.id === statusId
          ? { ...e, remarks: newStatus } // ✅ your backend maps 'remarks' to status
          : e
      )
    );

    alert(`✅ Timesheet ${newStatus.toLowerCase()} successfully`);
  } catch (err) {
    console.error('Error updating status:', err);
    alert('❌ Failed to update status');
  }
};


  return (
    <div>
      <h3 className={styles.heading}>📅 Weekly Status for: <em>{selectedWeek}</em></h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr className="bg-gray-200">
              <th>User ID</th>
              <th>Total Hours</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {statusEntries.length === 0 ? (
              <tr><td colSpan="5">No status records found.</td></tr>
            ) : statusEntries.map(entry => (
              <tr key={entry.id}>
                <td>{entry.empId}</td>
<td>{formatTotalFromMinutes(entry.total)} hrs</td>
                <td>
                  <span className={
                entry.status === 'APPROVED' ? styles['status-approved'] :
                entry.status === 'REJECTED' ? styles['status-rejected'] :
                styles['status-submitted']
              }>
                    {entry.status}
                  </span>
                </td>
                <td>
                  {entry.status === 'REJECTED' || entry.status === 'SUBMITTED' ? (
                    <input
                      type="text"
                      className={styles.inputText}
                      value={remarks[entry.id] ?? entry.remarks ?? ''}
                      onChange={(e) =>
                        setRemarks(prev => ({ ...prev, [entry.id]: e.target.value }))
                      }
                      placeholder="message..."
                    />
                  ) : (
                    entry.remarks
                  )}
                </td>
                <td>
                  {entry.status === 'SUBMITTED' && (
                    <>
                      <button
                        onClick={() => handleAction(entry.id, 'APPROVED')}
                        className={`${styles.btn} ${styles['btn-approve']}`}

                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(entry.id, 'REJECTED')}
                        className={`${styles.btn} ${styles['btn-reject']}`}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {(entry.status === 'APPROVED' || entry.status === 'REJECTED') && (
                    <span>✅ Processed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WeeklyStatusTab;
