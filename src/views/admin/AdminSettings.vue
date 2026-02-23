<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';

const durations = ref([]);
const newSeconds = ref('');
const newPercentage = ref(80);

onMounted(async () => {
    await fetchDurations();
});

const fetchDurations = async () => {
    try {
        const res = await api.get('/admin/durations');
        durations.value = res.data;
    } catch (error) {
        console.error('Failed to fetch durations:', error);
    }
};

const add = async () => {
    const sec = parseInt(newSeconds.value);
    const pct = parseFloat(newPercentage.value);

    if (durations.value.length >= 6) {
        alert('Maximum 6 duration options allowed.');
        return;
    }

    if (!sec || sec <= 0) return;

    try {
        const res = await api.post('/admin/durations', { seconds: sec, percentage: pct || 80 });
        if (res.data.success) {
            durations.value.push(res.data.duration);
            durations.value.sort((a, b) => a.seconds - b.seconds);
            newSeconds.value = '';
            newPercentage.value = 80;
        }
    } catch (error) {
        alert(error.response?.data?.error || 'Failed to add duration');
    }
};

const remove = async (id) => {
    if (!confirm('Remove this duration option?')) return;
    try {
        await api.delete(`/admin/durations/${id}`);
        durations.value = durations.value.filter(d => d.id !== id);
    } catch (error) {
        alert(error.response?.data?.error || 'Failed to remove duration');
    }
};
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold mb-6">Trading Settings</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Durations -->
            <div class="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 class="font-bold text-lg mb-4 text-white">Trading Durations</h3>
                <p class="text-sm text-gray-500 mb-4">Manage duration slots for timed trading. Max 6 slots.</p>

                <div class="flex gap-2 mb-6">
                    <input v-model="newSeconds" type="number" placeholder="Seconds"
                        class="flex-1 bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white focus:border-yellow-500 outline-none"
                        @keyup.enter="add" />
                    <input v-model="newPercentage" type="number" placeholder="%" step="1" min="1" max="200"
                        class="w-24 bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white focus:border-yellow-500 outline-none text-center" />
                    <button @click="add" class="bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-4 py-2 rounded transition-colors">
                        Add
                    </button>
                </div>

                <div class="space-y-2">
                    <div v-for="d in durations" :key="d.id"
                        class="flex items-center justify-between bg-gray-900 px-4 py-3 rounded border border-gray-700/50">
                        <div class="flex items-center gap-3">
                            <span class="font-mono font-bold text-white">{{ d.seconds }}s</span>
                            <span class="text-xs font-bold px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">{{ d.percentage }}%</span>
                        </div>
                        <button @click="remove(d.id)" class="text-red-400 hover:text-red-300 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </button>
                    </div>

                    <p v-if="durations.length === 0" class="text-gray-500 text-sm text-center py-4">No durations configured</p>
                </div>

                <p class="text-xs text-gray-500 mt-4">
                    <strong>Percentage</strong> = how much a user wins/loses relative to their trade amount.
                    E.g. 80% on a $100 trade → Win = +$80, Loss = -$100.
                </p>
            </div>

            <!-- Info Panel -->
            <div class="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 class="font-bold text-lg mb-4 text-white">How It Works</h3>
                <div class="space-y-3 text-sm text-gray-400">
                    <div class="flex gap-3 items-start">
                        <span class="text-yellow-500 font-bold">1.</span>
                        <p>Each duration slot has a <strong class="text-white">percentage</strong> that controls the payout.</p>
                    </div>
                    <div class="flex gap-3 items-start">
                        <span class="text-yellow-500 font-bold">2.</span>
                        <p>If a user <strong class="text-green-400">wins</strong> a trade, they earn <strong class="text-white">amount × percentage%</strong>.</p>
                    </div>
                    <div class="flex gap-3 items-start">
                        <span class="text-yellow-500 font-bold">3.</span>
                        <p>If a user <strong class="text-red-400">loses</strong> a trade, they lose the <strong class="text-white">full trade amount</strong>.</p>
                    </div>
                    <div class="flex gap-3 items-start">
                        <span class="text-yellow-500 font-bold">4.</span>
                        <p>Users will see the percentage next to each duration button so they know the payout ratio.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
