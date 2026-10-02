const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchBirthdays() {
  try {
    const res = await fetch(`${API_BASE_URL}/birthdays`);
    if (!res.ok) throw new Error('Failed to fetch birthdays');
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn('Backend not reachable or error, using local fallback:', err.message);
    return null;
  }
}

export async function fetchBirthdaysCount() {
  try {
    const res = await fetch(`${API_BASE_URL}/birthdays/count`);
    if (!res.ok) throw new Error('Failed to fetch count');
    const data = await res.json();
    return data.count;
  } catch (err) {
    console.warn('Backend not reachable for count:', err.message);
    return null;
  }
}

export async function registerBirthday({ name, dob, email }) {
  const res = await fetch(`${API_BASE_URL}/birthdays`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, dob, email }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to submit birthday');
  }

  return data;
}

/* ==========================================================================
   Admin API Methods
   ========================================================================== */

export async function verifyAdminPassword(password) {
  const res = await fetch(`${API_BASE_URL}/birthdays/admin/verify-pass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Invalid admin password');
  return true;
}

export async function fetchAllAdminBirthdays(password) {
  const res = await fetch(`${API_BASE_URL}/birthdays/admin/all`, {
    headers: {
      'x-admin-password': password,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch admin birthdays');
  return data.data;
}

export async function deleteBirthdayByAdmin(id, password) {
  const res = await fetch(`${API_BASE_URL}/birthdays/admin/${id}`, {
    method: 'DELETE',
    headers: {
      'x-admin-password': password,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete birthday');
  return data;
}
