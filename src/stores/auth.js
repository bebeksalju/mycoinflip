import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
    const isAuthenticated = ref(false);
    const user = reactive({
        email: '',
        name: '',
        kycStatus: 'unverified', // unverified, pending, verified, rejected
        profitMode: 'random', // 'random', 'win', 'loss'
        isAdmin: false
    });

    const mockUsers = reactive([
        { 
            id: 1, 
            firstName: 'John',
            lastName: 'Doe',
            name: 'John Doe', 
            email: 'john@doe.com', 
            password: 'password',
            balance: 15400, 
            profitMode: 'random', 
            status: 'active', 
            kyc: 'verified',
            dob: '1990-01-01',
            pob: 'New York, USA',
            phone: '+1 555-0101',
            address: '123 Wall Street, NY'
        },
        { 
            id: 2, 
            firstName: 'Jane',
            lastName: 'Smith',
            name: 'Jane Smith', 
            email: 'jane@smith.com', 
            password: 'password',
            balance: 2450, 
            profitMode: 'win', 
            status: 'active', 
            kyc: 'pending',
            dob: '1995-05-15',
            pob: 'London, UK',
            phone: '+44 20 7946 0958',
            address: '456 Queen St, London'
        },
        { 
            id: 3, 
            firstName: 'Alex',
            lastName: 'Johnson',
            name: 'Alex Johnson', 
            email: 'alex@crypto.com', 
            password: 'password',
            balance: 0, 
            profitMode: 'loss', 
            status: 'banned', 
            kyc: 'unverified',
            dob: '1988-11-20',
            pob: 'Toronto, Canada',
            phone: '+1 416-555-0199',
            address: '789 Maple Ave, Toronto'
        }
    ]);

    function setProfitMode(mode) {
        if (['random', 'win', 'loss'].includes(mode)) {
            user.profitMode = mode;
        }
    }

    function updateUserProfitMode(userId, mode) {
         const target = mockUsers.find(u => u.id === userId);
         if (target) {
             target.profitMode = mode;
         }
         // If updating self
         if (user.email === target?.email) {
             user.profitMode = mode;
         }
    }
    
    function toggleUserBan(userId) {
        const target = mockUsers.find(u => u.id === userId);
        if (target) {
            target.status = target.status === 'active' ? 'banned' : 'active';
        }
    }

    // Mock Admins
    const adminUsers = reactive([
        { id: 1, email: 'admin@crypto.com', password: 'admin', name: 'Super Admin', role: 'superuser' }, // Can manage other admins
        { id: 2, email: 'manager@crypto.com', password: 'admin', name: 'Manager', role: 'administrator' } // Can only manage users/finance
    ]);

    function loginAdmin(email, password) {
        const adminAccount = adminUsers.find(a => a.email === email && a.password === password);
        if (adminAccount) {
            isAuthenticated.value = true;
            user.email = adminAccount.email;
            user.name = adminAccount.name;
            user.isAdmin = true;
            user.role = adminAccount.role; 
            return true;
        }
        return false;
    }

    function register(userData) {
        const existing = mockUsers.find(u => u.email === userData.email);
        if (existing) return false;

        const newUser = {
            id: mockUsers.length + 1,
            ...userData,
            name: `${userData.firstName} ${userData.lastName}`,
            balance: 0,
            profitMode: 'random',
            status: 'active',
            kyc: 'unverified'
        };
        
        mockUsers.push(newUser);
        
        // Auto login after register
        isAuthenticated.value = true;
        Object.assign(user, {
            email: newUser.email,
            name: newUser.name,
            isAdmin: false,
            role: 'user',
            profitMode: 'random',
            kycStatus: 'unverified'
        });
        
        return true;
    }

    function login(email, password) {
        // User Login - Only check Mock Users
        if (email && password) {
            // Prevent Admin login here if intended
            if (adminUsers.find(a => a.email === email)) {
                return false; 
            }

            isAuthenticated.value = true;
            user.email = email;
            user.isAdmin = false;
            user.role = 'user';
            user.name = email.split('@')[0];
            
            // Sync with mock user if exists
            const existing = mockUsers.find(u => u.email === email);
            if (existing) {
                if (existing.status === 'banned') {
                    alert("Your account has been banned.");
                    isAuthenticated.value = false;
                    return false;
                }
                user.profitMode = existing.profitMode;
                user.kycStatus = existing.kyc;
            }
            return true;
        }
        return false;
    }

    // Admin Management Actions
    function addAdmin(newAdmin) {
        const id = adminUsers.length + 1;
        adminUsers.push({ ...newAdmin, id });
    }

    function removeAdmin(id) {
        const index = adminUsers.findIndex(a => a.id === id);
        if (index !== -1) {
            adminUsers.splice(index, 1);
        }
    }

    function updateUserBalance(userId, newBalance) {
        const target = mockUsers.find(u => u.id === userId);
        if (target) {
            target.balance = newBalance;
        }
    }

    function logout() {
        isAuthenticated.value = false;
        user.email = '';
        user.name = '';
        user.kycStatus = 'unverified';
        user.isAdmin = false;
    }

    function submitKYC(data) {
        // Mock KYC Submission
        user.kycStatus = 'pending';
        return true;
    }

    return {
        isAuthenticated,
        user,
        login,
        loginAdmin,
        register,
        logout,
        submitKYC,
        setProfitMode,
        mockUsers,
        adminUsers,
        addAdmin,
        removeAdmin,
        updateUserBalance,
        updateUserProfitMode,
        toggleUserBan
    };
}, {
    persist: true
});
