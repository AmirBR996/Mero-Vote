import api from ".";

export const login = async (data) => {
  try {
    const response = await api.post("/auth/login", data);
    console.log(response);

    return response.data;
  } catch (error) {
    console.log("Login error:", error);
    // Return the backend error message if available, otherwise throw
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error.response?.data || error;
  }
};

// register
export const register = async (data) => {
  try {
    const response = await api.post("/auth/register", data);
    console.log(response);

    return response.data;
  } catch (error) {
    console.log("Registration error:", error);
    // Return the backend error message if available, otherwise throw
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error.response?.data || error;
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await api.put("/auth/update-profile", data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error.response?.data || error;
  }
};

