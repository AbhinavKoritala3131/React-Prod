// src/components/PersonalInfo.jsx
import React from 'react';
import styles from '../styles/PersonalInfo.module.css';

const PersonalInfo = ({ user }) => {
  return (
    <div className={styles.personalInfoCard}>
      <h2>👤 Personal Information</h2>
      <ul>
        <li><strong>Full Name:</strong> {user.fName} {user.lName}</li>
                <li><strong>EMP ID :</strong> {user.id}</li>

        <li><strong>Email:</strong> {user.email}</li>
        <li><strong>Mobile:</strong> {user.mobile}</li>
        <li><strong>Country:</strong> {user.country}</li>
        <li><strong>DOB:</strong> {user.DOB}</li>
      </ul>
    </div>
  );
};

export default PersonalInfo;
