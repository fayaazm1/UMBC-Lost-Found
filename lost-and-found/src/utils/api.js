// Import our API configuration
import api from './apiConfig';
import { getAuth } from 'firebase/auth';

// Inline mock data instead of importing from a separate file
// This ensures the app will build even if mockData.js is missing
const mockPosts = [
  {
    id: 1,
    title: "Lost Laptop",
    description: "I lost my MacBook Pro in the library. It has a UMBC sticker on it.",
    report_type: "lost",
    location: "Library",
    date_reported: "2023-04-15T14:30:00Z",
    status: "open",
    user: {
      id: 1,
      username: "student123",
      display_name: "John Student"
    }
  },
  {
    id: 2,
    title: "Found Water Bottle",
    description: "Found a blue Hydro Flask water bottle in ITE building.",
    report_type: "found",
    location: "ITE Building",
    date_reported: "2023-04-16T10:15:00Z",
    status: "open",
    user: {
      id: 2,
      username: "helper456",
      display_name: "Jane Helper"
    }
  }
];

const mockNotifications = [
  {
    id: 1,
    user_id: 1,
    message: 'Your lost item has a potential match!',
    read: false,
    created_at: '2025-05-07T11:00:00Z',
    related_post_id: 1
  },
  {
    id: 2,
    user_id: 1,
    message: 'Someone commented on your post',
    read: true,
    created_at: '2025-05-06T16:30:00Z',
    related_post_id: 3
  }
];

const mockUsers = [
  {
    id: 1,
    email: 'fayaazm1@umbc.edu',
    username: 'fayaazm1',
    firebase_uid: '5PbKTaVLnmgGNl6Lxb92MhWsMOn1',
    is_admin: false
  }
];

// Flag to determine if we should use fallback data when backend fails
const useFallbackWhenBackendFails = true;

export async function getUserByEmail(email) {
  try {
    const response = await api.get(`/api/users/email/${email}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    
    // Use mock data as fallback when backend fails
    if (useFallbackWhenBackendFails) {
      console.log('Using mock user data as fallback');
      const mockUser = mockUsers.find(user => user.email === email) || mockUsers[0];
      return mockUser;
    }
    
    if (error.response && error.response.status === 404) {
      return null;
    }
    return null;
  }
}

export async function createDbUser(userData) {
  try{
    console.log('Creating database user:', userData);
    const response = await api.post('/api/users', userData);
    console.log('Successfully created user:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

// Post API functions
export async function createPost(postData) {
  try {
    const response = await api.post('/api/posts', postData);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function getPosts(filter) {
  try {
    let url = '/api/posts';
    if (filter === 'lost') {
      url = '/api/posts/lost';
    } else if (filter === 'found') {
      url = '/api/posts/found';
    } else if (filter === 'user') {
      // Get current user's posts
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return [];
      url = `/api/posts/user/${currentUser.uid}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    
    // Use mock data as fallback when backend fails
    if (useFallbackWhenBackendFails) {
      console.log('Using mock posts data as fallback');
      if (filter === 'lost') {
        return mockPosts.filter(post => post.report_type === 'lost');
      } else if (filter === 'found') {
        return mockPosts.filter(post => post.report_type === 'found');
      } else if (filter === 'user') {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) return [];
        return mockPosts.filter(post => post.user && post.user.id.toString() === currentUser.uid);
      }
      return mockPosts;
    }
    
    return [];
  }
}

export async function getPost(postId) {
  try {
    const response = await api.get(`/api/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching post ${postId}:`, error);
    
    // Use mock data as fallback when backend fails
    if (useFallbackWhenBackendFails) {
      console.log('Using mock post data as fallback');
      const mockPost = mockPosts.find(post => post.id.toString() === postId.toString());
      if (mockPost) return mockPost;
    }
    
    throw error;
  }
}

// Notification API functions
export async function getNotifications(userId) {
  try {
    const response = await api.get(`/api/notifications/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    
    // Use mock data as fallback when backend fails
    if (useFallbackWhenBackendFails) {
      console.log('Using mock notifications data as fallback');
      return mockNotifications;
    }
    
    return [];
  }
}

// Claim API functions
export async function createClaim(claimData) {
  try {
    const response = await api.post('/api/claims', claimData);
    return response.data;
  } catch (error) {
    console.error('Error creating claim:', error);
    throw error;
  }
}

export async function getClaims(filter) {
  try {
    let url = '/api/claims';
    if (filter === 'user') {
      // Get current user's claims
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) return [];
      url = `/api/claims/user/${currentUser.uid}`;
    } else if (filter && filter.postId) {
      url = `/api/claims/post/${filter.postId}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching claims:', error);
    return [];
  }
}

export async function getClaim(claimId) {
  try {
    const response = await api.get(`/api/claims/${claimId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching claim ${claimId}:`, error);
    throw error;
  }
}
