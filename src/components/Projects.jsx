import React, { useEffect, useState } from 'react';
import styles from '../styles/Projects.module.css';
import api from '../api/axios';

const Projects = ({ userId }) => {
  const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true); 


  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get(`/projects/employee/${userId}`);
        setProjects(res.data);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
      finally {
        setLoading(false); // ✅ end loading whether success or fail
      }
    };
    if (userId) fetchProjects();
  }, [userId]);

  // Helper to map status to class
  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return styles.completed;
      case 'ONGOING': return styles.ongoing;
      case 'DUE': return styles.due;
      case 'UPCOMING': return styles.upcoming;
      default: return '';
    }
  };
   if (loading) {
    return <div className={styles.projectsContainer}><p>Loading your projects...</p></div>;
  }

  return (
    <div className={styles.projectsContainer}>
      <h2>📁 Your Projects</h2>
 {/* ✅ When there are no projects */}
      {projects.length === 0 ? (
        <div className={styles.noProjects}>
          <p>🚧 No projects currently assigned to you.</p>
        </div>
      ) : (
        <div className={styles.projectsGrid}>
          {projects.map(project => (
            <div key={project.id} className={styles.projectCard}>
              <h3>{project.projectName}</h3>
              {project.projectStatus && (
                <span className={`${styles.status} ${getStatusClass(project.projectStatus)}`}>
                  {project.projectStatus}
                </span>
              )}
              {project.projectDescription && <p>{project.projectDescription}</p>}
              {project.deadline && <p className={styles.deadline}>Deadline: {project.deadline}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
