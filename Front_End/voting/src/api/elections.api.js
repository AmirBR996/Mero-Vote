import api from ".";

export const getElections = async () => {
  try {
    const response = await api.get("/elections");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getElectionById = async (id) => {
  try {
    const response = await api.get(`/elections/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getStats = async () => {
  try {
    const response = await api.get("/elections/stats");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createElection = async (data) => {
  try {
    const response = await api.post("/elections", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateElection = async (id, data) => {
  try {
    const response = await api.put(`/elections/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteElection = async (id) => {
  try {
    const response = await api.delete(`/elections/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
