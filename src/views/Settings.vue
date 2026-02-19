<script setup>
import { reactive, onMounted } from 'vue';
import { useMarketStore } from '../stores/market';
import { useAuthStore } from '../stores/auth';

const marketStore = useMarketStore();
const authStore = useAuthStore();

const settings = reactive({
    soundEnabled: true,
    notifications: true,
    compactMode: false
});

function saveSettings() {
    // In a real app, save settings to Pinia or LocalStorage
    marketStore.showToast('Settings Saved', 'Your preferences have been updated.', 'success');
}
</script>

<template>
    <div class="p-4 md:p-8 max-w-2xl mx-auto w-full">
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 text-yellow-500">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            Settings
        </h2>

        <div class="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6">
            
            <!-- Audio Settings -->
             <div>
                <h3 class="font-bold text-lg mb-3 pb-2 border-b border-gray-800 text-gray-300">Audio & Notifications</h3>
                <div class="space-y-3">
                    <div class="flex items-center justify-between p-3 bg-gray-800/30 rounded">
                        <div>
                            <p class="font-medium text-white">Sound Effects</p>
                            <p class="text-xs text-gray-500">Play sounds for trade execution and results</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" v-model="settings.soundEnabled" class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                        </label>
                    </div>

                    <div class="flex items-center justify-between p-3 bg-gray-800/30 rounded">
                        <div>
                            <p class="font-medium text-white">Toast Notifications</p>
                            <p class="text-xs text-gray-500">Show popup notifications for events</p>
                        </div>
                         <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" v-model="settings.notifications" class="sr-only peer">
                            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Display Settings -->
            <div>
                <h3 class="font-bold text-lg mb-3 pb-2 border-b border-gray-800 text-gray-300">Display</h3>
                <div class="space-y-3">
                     <div class="flex items-center justify-between p-3 bg-gray-800/30 rounded">
                        <div>
                            <p class="font-medium text-white">Compact Mode</p>
                            <p class="text-xs text-gray-500">Reduce padding and font sizes (Coming Soon)</p>
                        </div>
                         <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" v-model="settings.compactMode" disabled class="sr-only peer">
                             <div class="w-11 h-6 bg-gray-700/50 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-500 after:rounded-full after:h-5 after:w-5 cursor-not-allowed"></div>
                        </label>
                    </div>
                </div>
            </div>


            <div class="pt-4">
                <button 
                    @click="saveSettings"
                    class="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded transition-colors shadow-lg shadow-yellow-500/10"
                >
                    Save Changes
                </button>
            </div>

        </div>
    </div>
</template>
