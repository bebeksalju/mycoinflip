import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios';

export const useAuthStore = defineStore('auth', () => {
    const isAuthenticated = ref(false);
    const user = reactive({
        id: null,
        email: '',
        name: '',
        role: 'user',
        kycStatus: 'unverified',
        profitMode: 'random',
        isAdmin: false,
        token: null
    });

    // Users list (for admin panel)
    const users = ref([]);
    const adminUsers = ref([]);

    // Initialize state from local storage
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
        isAuthenticated.value = true;
        user.token = savedToken;
    }

    async function register(userData) {
        try {
            await api.post('/auth/register', {
                email: userData.email,
                password: userData.password,
                name: `${userData.firstName} ${userData.lastName}`
            });
            return true;
        } catch (error) {
            console.error('Registration failed:', error.response?.data?.error || error.message);
            return false;
        }
    }

    async function login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user: loggedInUser, token } = response.data;

            isAuthenticated.value = true;
            user.id = loggedInUser.id;
            user.email = loggedInUser.email;
            user.name = loggedInUser.name;
            user.role = loggedInUser.role;
            user.token = token;
            user.isAdmin = loggedInUser.role === 'ADMIN' || loggedInUser.role === 'SUPERUSER';
            user.kycStatus = loggedInUser.kyc?.status?.toLowerCase() || 'unverified';
            user.profitMode = loggedInUser.profitMode || 'random';
            
            localStorage.setItem('token', token);
            return { success: true };
        } catch (error) {
            console.error('Login failed:', error.response?.data?.error || error.message);
            if (error.response?.data?.banned) {
                return { success: false, banned: true };
            }
            return { success: false, banned: false };
        }
    }

    function logout() {
        isAuthenticated.value = false;
        user.id = null;
        user.email = '';
        user.name = '';
        user.token = null;
        user.isAdmin = false;
        users.value = [];
        adminUsers.value = [];
        localStorage.removeItem('token');
    }

    function setProfitMode(mode) {
        if (['random', 'win', 'loss'].includes(mode)) {
            user.profitMode = mode;
        }
    }

    async function submitKYC(formData) {
        try {
            await api.post('/auth/kyc', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            user.kycStatus = 'pending';
            return true;
        } catch (error) {
            console.error('KYC submit failed:', error);
            return false;
        }
    }

    // ==================== ADMIN: USER MANAGEMENT ====================

    async function fetchUsers() {
        try {
            const response = await api.get('/admin/users');
            users.value = response.data;
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    }

    async function updateUserBalance(userId, balance) {
        try {
            await api.put(`/admin/users/${userId}/balance`, { balance });
            const u = users.value.find(u => u.id === userId);
            if (u) u.balance = parseFloat(balance);
        } catch (error) {
            console.error('Failed to update balance:', error);
        }
    }

    async function updateUserProfitMode(userId, mode) {
        try {
            await api.put(`/admin/users/${userId}/profit-mode`, { mode });
            const u = users.value.find(u => u.id === userId);
            if (u) u.profitMode = mode;
        } catch (error) {
            console.error('Failed to update profit mode:', error);
        }
    }

    async function toggleUserBan(userId) {
        try {
            const response = await api.put(`/admin/users/${userId}/ban`);
            const u = users.value.find(u => u.id === userId);
            if (u) u.status = response.data.status;
        } catch (error) {
            console.error('Failed to toggle ban:', error);
        }
    }

    // ==================== ADMIN: ADMIN MANAGEMENT ====================

    async function fetchAdminUsers() {
        try {
            const response = await api.get('/admin/admins');
            adminUsers.value = response.data;
        } catch (error) {
            console.error('Failed to fetch admin users:', error);
        }
    }

    async function addAdmin(data) {
        try {
            const response = await api.post('/admin/admins', data);
            if (response.data.success) {
                adminUsers.value.push(response.data.admin);
            }
        } catch (error) {
            console.error('Failed to add admin:', error);
        }
    }

    async function removeAdmin(id) {
        try {
            await api.delete(`/admin/admins/${id}`);
            adminUsers.value = adminUsers.value.filter(a => a.id !== id);
        } catch (error) {
            console.error('Failed to remove admin:', error);
        }
    }

    // ==================== ADMIN: PROFILE ====================

    async function changePassword(currentPassword, newPassword) {
        try {
            const response = await api.put('/admin/password', { currentPassword, newPassword });
            return response.data;
        } catch (error) {
            console.error('Failed to change password:', error);
            throw error;
        }
    }

    return {
        isAuthenticated,
        user,
        users,
        adminUsers,
        login,
        register,
        logout,
        submitKYC,
        setProfitMode,
        fetchUsers,
        updateUserBalance,
        updateUserProfitMode,
        toggleUserBan,
        fetchAdminUsers,
        addAdmin,
        removeAdmin,
        changePassword
    };
}, {
    persist: true
});
