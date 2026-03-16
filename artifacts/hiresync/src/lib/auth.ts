export const getToken = () => localStorage.getItem("hiresync_token");

export const setToken = (token: string) => localStorage.setItem("hiresync_token", token);

export const removeToken = () => localStorage.removeItem("hiresync_token");

export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAuthRequestOptions = (): any => ({
  headers: getAuthHeaders()
});
