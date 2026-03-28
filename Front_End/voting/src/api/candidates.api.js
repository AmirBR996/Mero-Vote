import api from ".";

export const getCandidates = async () => {
  try {
    const response = await api.get("/candidates");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCandidatesByElection = async (electionId) => {
  try {
    const response = await api.get(`/candidates/election/${electionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createCandidate = async (data) => {
  try {
    const response = await api.post("/candidates", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateCandidate = async (id, data) => {
  try {
    const response = await api.put(`/candidates/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteCandidate = async (id) => {
  try {
    const response = await api.delete(`/candidates/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
