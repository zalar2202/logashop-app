import { api } from '@/lib/axios';

/**
 * User Service - API calls for user management
 */
export const userService = {
    /**
     * Get list of users with pagination, search, and filters
     * @param {Object} params - Query parameters
     * @param {number} params.page - Page number
     * @param {number} params.limit - Items per page
     * @param {string} params.search - Search term
     * @param {string} params.status - Filter by status
     * @param {string} params.role - Filter by role
     * @param {string} params.sortBy - Sort field
     * @param {string} params.sortOrder - Sort order (asc/desc)
     * @returns {Promise<Object>} Response with { data: [...], links: {next, prev}, meta: {current_page, last_page, total} }
     */
    getUsers: async (params = {}) => {
        return await api.get('/api/users', { params });
    },

    /**
     * Get a single user by ID
     * @param {string} id - User ID
     * @returns {Promise<Object>} Response with user data
     */
    getUserById: async (id) => {
        return await api.get(`/api/users/${id}`);
    },

    /**
     * Create a new user
     * @param {Object} data - User data
     * @param {string} data.name - User name
     * @param {string} data.email - User email
     * @param {string} data.password - User password
     * @param {string} data.role - User role (admin/manager/user)
     * @param {string} data.status - User status (active/inactive/suspended)
     * @param {string} data.phone - User phone (optional)
     * @param {File} data.avatar - Avatar file (optional)
     * @returns {Promise<Object>} Response with created user
     */
    createUser: async (data) => {
        // Convert to FormData if avatar is provided
        if (data.avatar && data.avatar instanceof File) {
            const formData = new FormData();
            Object.keys(data).forEach((key) => {
                if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
                    if (typeof data[key] === 'object' && !(data[key] instanceof File)) {
                        formData.append(key, JSON.stringify(data[key]));
                    } else {
                        formData.append(key, data[key]);
                    }
                }
            });
            return await api.post('/api/users', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        }
        
        // Otherwise send as JSON
        return await api.post('/api/users', data);
    },

    /**
     * Update an existing user
     * @param {string} id - User ID
     * @param {Object} data - User data to update
     * @param {File} data.avatar - Avatar file (optional)
     * @param {boolean} data.removeAvatar - Remove existing avatar (optional)
     * @returns {Promise<Object>} Response with updated user
     */
    updateUser: async (id, data) => {
        // Convert to FormData if avatar is provided
        if (data.avatar && data.avatar instanceof File) {
            const formData = new FormData();
            Object.keys(data).forEach((key) => {
                if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
                    if (typeof data[key] === 'object' && !(data[key] instanceof File)) {
                        formData.append(key, JSON.stringify(data[key]));
                    } else {
                        formData.append(key, data[key]);
                    }
                }
            });
            return await api.put(`/api/users/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        }
        
        // Otherwise send as JSON
        return await api.put(`/api/users/${id}`, data);
    },

    /**
     * Delete a user
     * @param {string} id - User ID
     * @returns {Promise<Object>} Response with success message
     */
    deleteUser: async (id) => {
        return await api.delete(`/api/users/${id}`);
    },
};

