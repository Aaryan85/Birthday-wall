// Direct API configuration for live Render backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://birthday-wall-x123.onrender.com/api';

export async function fetchBirthdays() {
  try {
    const res = await fetch(`${API_BASE_URL}/birthdays`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.data;
  } catch (err) {
    console.warn(`[Birthday Wall API] Could not fetch birthdays from ${API_BASE_URL}:`, err.message);
    return null;
  }
}

export async function fetchBirthdaysCount() {
  try {
    const res = await fetch(`${API_BASE_URL}/birthdays/count`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.count;
  } catch (err) {
    console.warn(`[Birthday Wall API] Could not fetch count:`, err.message);
    return null;
  }
}

export async function registerBirthday({ name, dob, email }) {
  const targetUrl = `${API_BASE_URL}/birthdays`;
  console.log(`[Birthday Wall] Submitting birthday to: ${targetUrl}`);

  try {
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, dob, email }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Failed to submit birthday (${res.status})`);
    }

    return data;
  } catch (err) {
    console.error('[Birthday Wall] Register error:', err);
    throw new Error(err.message || 'Failed to connect to backend server');
  }
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
