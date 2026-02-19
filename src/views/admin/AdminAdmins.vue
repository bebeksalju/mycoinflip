<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const showModal = ref(false);
const isEditing = ref(false);

const form = reactive({
    id: null,
    name: '',
    email: '',
    password: '',
    role: 'administrator' // 'superuser' | 'administrator'
});

const openAddModal = () => {
    isEditing.value = false;
    form.id = null;
    form.name = '';
    form.email = '';
    form.password = '';
    form.role = 'administrator';
    showModal.value = true;
};

// No edit implementation for now, just Add/Delete based on requirement CRUD
// But let's add basic delete

const deleteAdmin = (id) => {
    if (confirm('Are you sure you want to remove this admin?')) {
        authStore.removeAdmin(id);
    }
};

const submitForm = () => {
    if (!form.name || !form.email || !form.password) return;
    
    authStore.addAdmin({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
    });
    
    showModal.value = false;
};
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-bold">Admin Management</h1>
            <button v-if="authStore.user.role === 'superuser'" @click="openAddModal" class="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded shadow transition-colors">
                + Add Admin
            </button>
        </div>

        <div v-if="authStore.user.role !== 'superuser'" class="bg-red-900/20 border border-red-900/50 p-4 rounded text-red-200 text-center">
            You do not have permission to manage administrators.
        </div>

        <div v-else class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-gray-400">
                    <thead class="bg-gray-900/50 text-xs uppercase font-bold text-gray-500">
                        <tr>
                            <th class="px-6 py-4">Name</th>
                            <th class="px-6 py-4">Email</th>
                            <th class="px-6 py-4">Role</th>
                            <th class="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-700/50">
                        <tr v-for="admin in authStore.adminUsers" :key="admin.id" class="hover:bg-gray-700/20 transition-colors">
                            <td class="px-6 py-4 font-bold text-white">{{ admin.name }}</td>
                            <td class="px-6 py-4">{{ admin.email }}</td>
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 rounded text-xs font-bold uppercase"
                                    :class="admin.role === 'superuser' ? 'bg-purple-900/30 text-purple-400' : 'bg-blue-900/30 text-blue-400'"
                                >
                                    {{ admin.role }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <button 
                                    v-if="admin.email !== authStore.user.email"
                                    @click="deleteAdmin(admin.id)" 
                                    class="text-red-400 hover:text-red-300 font-bold text-xs"
                                >
                                    Remove
                                </button>
                                <span v-else class="text-gray-600 text-xs italic">Current Session</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Add Modal -->
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div class="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md p-6 shadow-2xl">
                <h3 class="text-xl font-bold text-white mb-4">Add New Administrator</h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                        <input v-model="form.name" type="text" class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-yellow-500 outline-none" placeholder="Admin Name" />
                    </div>
                     <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                        <input v-model="form.email" type="email" class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-yellow-500 outline-none" placeholder="admin@example.com" />
                    </div>
                     <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                        <input v-model="form.password" type="password" class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-yellow-500 outline-none" placeholder="••••••" />
                    </div>
                     <div>
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                        <select v-model="form.role" class="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-yellow-500 outline-none">
                            <option value="administrator">Administrator</option>
                            <option value="superuser">Superuser</option>
                        </select>
                    </div>
                </div>

                <div class="flex gap-3 mt-6">
                    <button @click="showModal = false" class="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-bold">Cancel</button>
                    <button @click="submitForm" class="flex-1 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded font-bold shadow-lg">Create Admin</button>
                </div>
            </div>
        </div>
    </div>
</template>
