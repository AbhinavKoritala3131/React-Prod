// src/components/Dashboard.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import PersonalInfo from './personalInfo';
import Projects from './Projects';
import Timesheets from './Timesheets';



const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [showTimesheets, setShowTimesheets] = useState(false);
  const [activeComponent, setActiveComponent] = useState('welcome'); 


  const navigate = useNavigate();

  const userId = Number(localStorage.getItem('userId'));

    const sidebarRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!userId) {
      navigate('/');
      return;
    }

    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8081/users/fetch/${userId}`);
        const data = await response.json();
        if (response.ok) {
          setUser(data);
          setActiveComponent('home');
        } else {
          console.error('Failed to fetch user details');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, navigate]);
  // close outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (profileOpen && profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    if (menuOpen || profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen, profileOpen]); 
  //  Clickoutside closed

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/');
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (!user) {
    return <div className="dashboard-error">User not found.</div>;
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>
        <h1 className="company-name">🌐 MyCompany</h1>
<div ref={profileRef} className="profile-icon" onClick={() => setProfileOpen(!profileOpen)}>
          👤
          {profileOpen && (
            <div className="profile-dropdown">
              {/* <button onClick={() => { setShowPersonalInfo(true); setShowProjects(false); setProfileOpen(false); }}>Personal Info</button>
              <button onClick={handleLogout}>Logout</button>
              <button onClick={() => alert("Redirect to bug report page")}>Report a Bug</button> */}
<button onClick={() => { setActiveComponent('personalInfo'); setProfileOpen(false); }}>Personal Info</button>
        <button onClick={handleLogout}>Logout</button>
        <button onClick={() => alert("Redirect to bug report page")}>Report a Bug</button>                

            </div>
          )}
        </div>
      </header>

      {/* Sidebar Menu */}
      {menuOpen && (
        // <div className={`sidebar ${menuOpen ? 'open' : ''}`}>
<div ref={sidebarRef} className={`sidebar ${menuOpen ? 'open' : ''}`}>
          <button
  onClick={() => {
    setActiveComponent('home');
    setMenuOpen(false);
  }}
>
  🏠 Home
</button>

<button
  onClick={() => {
    setActiveComponent('timesheets');
    setMenuOpen(false);
  }}
>
  📅 Timesheets
</button>

<button
  onClick={() => {
    setActiveComponent('projects');
    setMenuOpen(false);
  }}
>
  📁 Projects
</button>

        </div>
      )}

      {/* Floating Welcome Block */}
      {activeComponent === 'home' && (
  <div className="floating-welcome">
    <h2>👋 Welcome, {user.fName}!</h2>
    <p>Keep Up-to-date with your Projects!</p>
    <button className="primary-btn" onClick={() => setActiveComponent('projects')}>Go to Projects</button>
  </div>
)}

      {/* Conditional Rendering */}
      {activeComponent === 'personalInfo' && <PersonalInfo user={user} />}
  {activeComponent === 'projects' && <Projects />}
  {activeComponent === 'timesheets' && <Timesheets />}
    </div>
  );
};

export default Dashboard;