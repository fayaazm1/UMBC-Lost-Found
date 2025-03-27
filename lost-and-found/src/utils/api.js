const API_BASE_URL = 'http://localhost:8000/api';

export async function getUserByEmail(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/users/email/${email}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch user');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function createDbUser(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || 'Failed to create user');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
