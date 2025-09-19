export const loginUser = async (data) => {
  try {
    const res = await fetch('http://localhost:8081/users/login', data);
    const result =  res.data;
    return res.ok ? { success: true, ...result } : { success: false, ...result };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const registerUser = async (data) => {
  try {
    const res = await fetch('http://localhost:8081/users/register', data);
    const result = res.data;
    return res.ok ? { success: true, ...result } : { success: false, ...result };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
