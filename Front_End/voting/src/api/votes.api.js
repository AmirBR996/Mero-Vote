import api from ".";

export const castVote = async (data) => {
  try {
    const response = await api.post("/votes", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMyVotes = async () => {
  try {
    const response = await api.get("/votes/my");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getElectionResults = async (electionId) => {
  try {
    const response = await api.get(`/votes/results/${electionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
