const BASE_URL = "/api";

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("hiresync_token");
  const res = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

export const api = {
  auth: { 
    register: (data: any) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: any) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => apiFetch('/auth/logout', { method: 'POST' }),
    me: () => apiFetch('/auth/me') 
  },
  profile: { 
    get: () => apiFetch('/profile'),
    update: (data: any) => apiFetch('/profile', { method: 'PUT', body: JSON.stringify(data) })
  },
  resume: { 
    list: () => apiFetch('/resume'),
    upload: (data: any) => apiFetch('/resume/upload', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch(`/resume/${id}`, { method: 'DELETE' })
  },
  jobs: { 
    search: (params?: any) => {
      const query = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`/jobs/search${query}`);
    },
    recommended: () => apiFetch('/jobs/recommended'),
    trending: () => apiFetch('/jobs/trending'),
    getById: (id: string) => apiFetch(`/jobs/${id}`)
  },
  applications: { 
    list: () => apiFetch('/applications'),
    create: (data: any) => apiFetch('/applications', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiFetch(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch(`/applications/${id}`, { method: 'DELETE' })
  },
  savedJobs: { 
    list: () => apiFetch('/saved-jobs'),
    save: (data: any) => apiFetch('/saved-jobs', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id: string) => apiFetch(`/saved-jobs/${id}`, { method: 'DELETE' })
  },
  alerts: { 
    list: () => apiFetch('/alerts'),
    create: (data: any) => apiFetch('/alerts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiFetch(`/alerts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => apiFetch(`/alerts/${id}`, { method: 'DELETE' })
  },
  notifications: { 
    list: () => apiFetch('/notifications'),
    markRead: (id: string) => apiFetch(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => apiFetch('/notifications/read-all', { method: 'PUT' })
  },
  dashboard: { 
    stats: () => apiFetch('/dashboard/stats')
  },
  admin: { 
    stats: () => apiFetch('/admin/stats'),
    users: () => apiFetch('/admin/users')
  },
};
