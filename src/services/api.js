export const loginUser = async (data) => {
  try {
    const res = await fetch('http://localhost:8081/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return res.ok ? { success: true, ...result } : { success: false, ...result };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const registerUser = async (data) => {
  try {
    const res = await fetch('http://localhost:8081/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return res.ok ? { success: true, ...result } : { success: false, ...result };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
