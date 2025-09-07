import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../styles/AuthPage.css';

const AuthPage = () => {
  const [activeForm, setActiveForm] = useState('signup');
  const [submitError, setSubmitError] = useState(null);
  const [registerSubmitted, setRegisterSubmitted] = useState(false);
const [signinSubmitted, setSigninSubmitted] = useState(false);


  const navigate = useNavigate(); 
  


  // Register form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    country: '',
    mobile: '',
    ssn: '',
    dob: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [registerResponse, setRegisterResponse] = useState(null); // { success: bool, message: string }

  // Sign In form state
  const [signinData, setSigninData] = useState({
    email: '',
    password: ''
  });
  const [signinResponse, setSigninResponse] = useState(null);

  const countryCodes = {
    India: '+91',
    USA: '+1',
    UK: '+44',
    Canada: '+1',
    Australia: '+61',
    Germany: '+49',
    France: '+33',
  };

  const showForm = (formName) => {
    setActiveForm(formName);
    setFormErrors({});
    setRegisterResponse(null);
    setSigninResponse(null);
    setSubmitError(null);
    setRegisterSubmitted(false);  // ✅ Reset
  setSigninSubmitted(false);   
  };

  // Register form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
    setRegisterResponse(null);
    setSubmitError(null);
    setRegisterSubmitted(false); // stops showing error-shadow as user begins to fix errors

  };

  const validateRegisterForm = () => {
    const errors = {};

    if (!formData.firstName.trim() || formData.firstName.trim().length < 2 ||  !/^[A-Za-z]+$/.test(formData.firstName.trim())) {
      errors.firstName = 'First name must be at least 2 letters and contain only letters';
    }
    if (!formData.lastName.trim() || formData.lastName.trim().length < 2 ||  !/^[A-Za-z]+$/.test(formData.firstName.trim())) {
      errors.lastName = 'Last name must be at least 2 letters and contain only letters';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (
      formData.password.length < 8 ||
      !/[A-Z]/.test(formData.password) ||
      !/[a-z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password)
    ) {
      errors.password = 'Password must be at least 8 characters and include uppercase, lowercase, and a number';
    }
    if (!formData.country) {
      errors.country = 'Country is required';
    }
    if (!formData.mobile) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      errors.mobile = 'Mobile number must be exactly 10 digits';
    }
    if (!formData.ssn) {
      errors.ssn = 'SSN is required';
    } else if (!/^\d{9}$/.test(formData.ssn)) {
      errors.ssn = 'SSN must be exactly 9 digits';
    }
    if (!formData.dob) {
      errors.dob = 'Date of Birth is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterSubmitted(true);

    

    if (!validateRegisterForm()) {
      setSubmitError('Please fix the errors to register.');
      return;
    }
    setSubmitError(null);

    let fullMobile = formData.mobile;
    const countryCode = countryCodes[formData.country] || '';
    if (!fullMobile.startsWith('+')) {
      fullMobile = countryCode + fullMobile;
    }

    const payload = {
      fname: formData.firstName,
      lname: formData.lastName,
      email: formData.email,
      password: formData.password,
      country: formData.country,
      mobile: fullMobile,
      ssn: formData.ssn,
      dob: formData.dob
    };

    try {
      const response = await fetch('http://localhost:8081/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setRegisterResponse({ success: true, message: data.message || 'User registered successfully!' });
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          country: '',
          mobile: '',
          ssn: '',
          dob: ''
        });
        setFormErrors({});
      } else {
        setRegisterResponse({ success: false, message: data.message || 'Failed to register user.' });
      }
    } catch {
      setRegisterResponse({ success: false, message: 'Something went wrong. Please try again.' });
    }
  };

  // Sign In Handlers
  const handleSigninChange = (e) => {
    const { name, value } = e.target;
    setSigninData((prev) => ({ ...prev, [name]: value }));
    setSigninResponse(null);
  };

  const handleSigninSubmit = async (e) => {
    e.preventDefault();
      setSigninSubmitted(true); // Mark sign-in submitted


    if (!signinData.email || !signinData.password) {
      setSigninResponse({ success: false, message: 'Please enter email and password' });
      return;
    }

    try {
      const response = await fetch('http://localhost:8081/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signinData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userId', data.userId);
        setSigninResponse({ success: true, message: data.message || 'Login successful!' });
        setSigninData({ email: '', password: '' });
        setTimeout(() => {
          navigate('/Dashboard');
        }, 1000);
      } else {
        setSigninResponse({ success: false, message: data.message || 'Invalid credentials' });
      }
    } catch {
      setSigninResponse({ success: false, message: 'Network error. Please try again.' });
    }
  };

  // ======== Helpers for UI ========

  // Add floating red border if error present, also add title for hover tooltip
  const getInputProps = (field) => {
  if (activeForm === 'register') {
    return {
      className: formErrors[field] ? 'input-error' : '',
      title: formErrors[field] || '',
    };
  }

  if (activeForm === 'signup' && signinSubmitted) {
    const isError = field === 'email' && !signinData.email ||
                    field === 'password' && !signinData.password;
    return {
      className: isError ? 'input-error' : '',
      title: isError ? 'This field is required' : '',
    };
  }

  return {};
};


  // Add dark red shadow to auth-container if any error on register form or signin error
const hasRegisterErrors = registerSubmitted && Object.keys(formErrors).length > 0;
   const hasSigninError = signinResponse && !signinResponse.success;

  
  return (
    <div className="auth-page">
       <header className="auth-header"> VECTROLLA   
    <p className="tagline">From clock-in to Project win !</p>
    <h1 className="title">Welcome to User Portal</h1>
  </header>
  <div className="main-content">
  <div className="left-side">
   
  <h1>From clock-in to project win!</h1>
  <p>Manage your projects and time effortlessly with our user portal.</p>
  <ul>
    <li>Track your tasks</li>
    <li>Collaborate seamlessly</li>
    <li>Boost your productivity</li>
  </ul>
</div>
       
      <div
  className={`auth-container ${
    (hasRegisterErrors || hasSigninError)
      ? 'error-shadow'
      : (signinResponse?.success || registerResponse?.success)
      ? 'success-shadow'
      : ''
  }`}
>

       
        {/* <p className="tagline">From clock-in to Project win !</p>
        <h1 className="title">Welcome to User Portal</h1> */}

        {activeForm === 'signup' && (
          <div id="signup-form" className="form-card">
            <h2>Sign In</h2>
            <form id="form-signup" noValidate onSubmit={handleSigninSubmit}>
              <label htmlFor="signin-email">Email</label>
              <input
                id="signin-email"
                type="email"
                name="email"
                placeholder='youremail@gmail.com'
                value={signinData.email}
                onChange={handleSigninChange}
                required
                {...getInputProps('email')}
              />

              <label htmlFor="signin-password">Password</label>
              <input
                id="signin-password"
                type="password"
                name="password"
                placeholder='********'
                value={signinData.password}
                onChange={handleSigninChange}
                required
                {...getInputProps('password')}
              />

              <button type="submit"  className="submit-btn rocket-btn">
                Sign In<span className="rocket-icon">🚀</span>
              </button>
            </form>

            {signinResponse && (
              <div
                className={`response-message ${signinResponse.success ? 'success' : 'error'}`}
                style={{
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 'bold',
                  color: signinResponse.success ? 'white' : 'red'
                }}
              >
                {signinResponse.success ? (
                  <span style={{ color: 'white', fontSize: '20px' }}>✅</span>
                ) : (
                  <span style={{ color: 'red', fontSize: '20px' }}>❌</span>
                )}
                <span>{signinResponse.message}</span>
              </div>
            )}

            <p className="switch-link">
              New user?{' '}
              <button className="link-btn" onClick={() => showForm('register')}>
                Create account
              </button>
            </p>
          </div>
        )}

        {activeForm === 'register' && (
          <div id="register-form" className="form-card">
            <h2>Register</h2>
            <form id="form-register" noValidate onSubmit={handleRegisterSubmit}>
              {submitError && (
                <div className="submit-error-message" style={{ color: 'red', marginBottom: '10px' }}>
                  {submitError}
                </div>
              )}

              <label htmlFor="register-firstName">First Name</label>
              <input
                id="register-firstName"
                type="text"
                name="firstName"
                placeholder='e.g. Noah'
                pattern="^[A-Za-z\s]+$"
                value={formData.firstName}
                onChange={handleChange}
                {...getInputProps('firstName')}
              />

              <label htmlFor="register-lastName">Last Name</label>
              <input
                id="register-lastName"
                type="text"
                name="lastName"
                placeholder=' e.g. Dawson'
                pattern="^[A-Za-z\s]+$"
                value={formData.lastName}
                onChange={handleChange}
                {...getInputProps('lastName')}
              />

              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                name="email"
                placeholder='e.g. Noah.dawson@yahoo.com'
                value={formData.email}
                onChange={handleChange}
                {...getInputProps('email')}
              />

              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                name="password"
                placeholder='********'
                value={formData.password}
                onChange={handleChange}
                {...getInputProps('password')}
              />

              <label htmlFor="register-country" className="form-label">Country</label>
              <select
                id="register-country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={formErrors.country ? 'input-error' : ''}
                required
                title={formErrors.country || ''}
              >
                <option value="">Select your country</option>
                <option value="India">🇮🇳 India</option>
                <option value="USA">🇺🇸 USA</option>
                <option value="UK">🇬🇧 UK</option>
                <option value="Canada">🇨🇦 Canada</option>
                <option value="Australia">🇦🇺 Australia</option>
                <option value="Germany">🇩🇪 Germany</option>
                <option value="France">🇫🇷 France</option>
              </select>

              <label htmlFor="register-mobile">Mobile Number</label>
              <input
                id="register-mobile"
                type="tel"
                name="mobile"
                placeholder="e.g. 9876543210"
                maxLength="10"
                value={formData.mobile}
                onChange={handleChange}
                {...getInputProps('mobile')}
              />

              <label htmlFor="register-ssn">SSN</label>
              <input
                id="register-ssn"
                type="password"
                name="ssn"
                maxLength="9"

                minLength="9"
                value={formData.ssn}
                onChange={handleChange}
                {...getInputProps('ssn')}
                placeholder="***-**-****"
              />

              <label htmlFor="register-dob">Date Of Birth</label>
              <input
                id="register-dob"
                type="date"
                name="dob"
                min="1925-01-01"
                max="2007-12-31"
                value={formData.dob}
                onChange={handleChange}
                {...getInputProps('dob')}
              />

              {registerResponse && (
                <div
                  className={`response-message ${registerResponse.success ? 'success' : 'error'}`}
                  style={{
                    marginTop: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 'bold',
                    color: registerResponse.success ? 'white' : 'red',
                  }}
                >
                  {registerResponse.success ? (
                    <span style={{ color: 'white', fontSize: '30px' }}>✅</span>
                  ) : (
                    <span style={{ color: 'red', fontSize: '30px' }}>❌</span>
                  )}
                  <span>{registerResponse.message}</span>
                </div>
              )}

              <div className="centered-btn-wrapper">
    <button type="submit" className="submit-btn rocket-btn">Register<span className="rocket-icon">🚀</span></button>
  </div>
            </form>

            <p className="switch-link">
              Already have an account?{' '}
              <button className="link-btn" onClick={() => showForm('signup')}>
                Sign in
              </button>
            </p>
          </div>
        )}

      </div></div>
              <footer className="footer">© 2025 Vectrolla. All rights reserved.</footer>

    </div>
    
  );
};

export default AuthPage;
