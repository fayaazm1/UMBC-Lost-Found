// Use environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://umbc-lost-found-2-backend.onrender.com';

export async function getUserByEmail(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/email/${email}`);
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
  try{
    console.log('Creating database user:', userData);
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();

    if (!response.ok) {
      console.error('Failed to create user:', data);
      throw new Error(data.detail || 'Failed to create user');
    }

    console.log('Successfully created user:', data);
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
