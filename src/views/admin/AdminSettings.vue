<script setup>
import { ref } from 'vue';
import { useMarketStore } from '../../stores/market';

const marketStore = useMarketStore();
const newDuration = ref('');

const add = () => {
    const val = parseInt(newDuration.value);
    
    if (marketStore.durations.length >= 6) {
        alert("Maximum 6 duration options allowed.");
        return;
    }

    if (val && val > 0) {
        marketStore.addDuration(val);
        newDuration.value = '';
    }
};

const remove = (val) => {
    if (confirm(`Remove ${val}s duration option?`)) {
        marketStore.removeDuration(val);
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
                <p class="text-sm text-gray-500 mb-4">Manage the available time options for "Timed" trading mode.</p>

                <div class="flex gap-2 mb-6">
                    <input 
                        v-model="newDuration" 
                        type="number" 
                        placeholder="Seconds (e.g. 120)" 
                        class="flex-1 bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white focus:border-yellow-500 outline-none"
                        @keyup.enter="add"
                    />
                    <button @click="add" class="bg-yellow-600 hover:bg-yellow-500 text-white font-bold px-4 py-2 rounded transition-colors">
                        Add
                    </button>
                </div>

                <div class="space-y-2">
                    <div v-for="sec in marketStore.durations" :key="sec" class="flex items-center justify-between bg-gray-900 px-4 py-3 rounded border border-gray-700/50">
                        <span class="font-mono font-bold text-white">{{ sec }} seconds</span>
                        <button @click="remove(sec)" class="text-red-400 hover:text-red-300 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Other Settings (Placeholder) -->
            <div class="bg-gray-800 rounded-xl border border-gray-700 p-6 opacity-50">
                <h3 class="font-bold text-lg mb-4 text-white">System Limits</h3>
                <p class="text-sm text-gray-500 mb-4">Coming soon...</p>
            </div>
        </div>
    </div>
</template>
