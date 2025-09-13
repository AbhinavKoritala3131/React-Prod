// src/components/PersonalInfo.jsx
import React from 'react';
import '../styles/PersonalInfo.module.css';

const PersonalInfo = ({ user }) => {
  return (
    <div className="personal-info-card">
      <h2>👤 Personal Information</h2>
      <ul>
        <li><strong>Full Name:</strong> {user.fName} {user.lName}</li>
        <li><strong>Email:</strong> {user.email}</li>
        <li><strong>Mobile:</strong> {user.mobile}</li>
        <li><strong>Country:</strong> {user.country}</li>
        <li><strong>DOB:</strong> {user.DOB}</li>
        <li><strong>User Name:</strong> {user.userName}</li>
      </ul>
    </div>
  );
};

export default PersonalInfo;
