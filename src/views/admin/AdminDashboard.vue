<script setup>
import { onMounted } from 'vue';
import { useAdminStore } from '../../stores/admin';

const adminStore = useAdminStore();

onMounted(() => {
    adminStore.fetchPlatformStats();
});

function formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
}

function typeLabel(type) {
    const labels = {
        'DEPOSIT': 'Deposit',
        'WITHDRAWAL': 'Withdrawal',
        'TRADE_BUY': 'Buy Trade',
        'TRADE_SELL': 'Sell Trade',
        'TRADE_WIN': 'Trade Won',
        'TRADE_LOSS': 'Trade Lost'
    };
    return labels[type] || type;
}

function typeColor(type) {
    if (type === 'DEPOSIT' || type === 'TRADE_WIN' || type === 'TRADE_BUY') return 'text-green-400';
    if (type === 'WITHDRAWAL' || type === 'TRADE_LOSS' || type === 'TRADE_SELL') return 'text-red-400';
    return 'text-gray-400';
}
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        <!-- Loading State -->
        <div v-if="adminStore.isLoading" class="text-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500 mx-auto"></div>
            <p class="text-gray-400 mt-3 text-sm">Loading platform data...</p>
        </div>

        <template v-else>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Total Users -->
                <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <p class="text-gray-400 text-sm font-bold uppercase mb-1">Total Users</p>
                    <h3 class="text-3xl font-bold text-white">{{ adminStore.platformStats.totalUsers.toLocaleString() }}</h3>
                </div>

                <!-- Total Deposits -->
                <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <p class="text-gray-400 text-sm font-bold uppercase mb-1">Total Deposits</p>
                    <h3 class="text-3xl font-bold text-white">${{ adminStore.platformStats.totalDeposits.toLocaleString() }}</h3>
                </div>

                <!-- Pending KYC -->
                <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <p class="text-gray-400 text-sm font-bold uppercase mb-1">Pending KYC</p>
                    <h3 class="text-3xl font-bold" :class="adminStore.platformStats.pendingKyc > 0 ? 'text-yellow-500' : 'text-white'">
                        {{ adminStore.platformStats.pendingKyc }}
                    </h3>
                    <span v-if="adminStore.platformStats.pendingKyc > 0" class="text-gray-500 text-xs">Action required</span>
                </div>

                <!-- Pending Withdrawals -->
                <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                    <p class="text-gray-400 text-sm font-bold uppercase mb-1">Pending Withdrawals</p>
                    <h3 class="text-3xl font-bold" :class="adminStore.platformStats.pendingWithdrawals > 0 ? 'text-red-500' : 'text-white'">
                        {{ adminStore.platformStats.pendingWithdrawals }}
                    </h3>
                    <span v-if="adminStore.platformStats.pendingWithdrawals > 0" class="text-gray-500 text-xs">Action required</span>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Recent Activity -->
                <div class="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <h3 class="font-bold text-lg mb-4">Recent Activity</h3>
                    <div v-if="adminStore.platformStats.recentActivity.length === 0" class="text-gray-500 text-sm text-center py-6">
                        No recent activity
                    </div>
                    <div v-else class="space-y-4">
                        <div v-for="activity in adminStore.platformStats.recentActivity" :key="activity.id"
                            class="flex items-center justify-between text-sm pb-3 border-b border-gray-700/50 last:border-0">
                            <div class="flex-1">
                                <span :class="typeColor(activity.type)" class="font-bold text-xs uppercase mr-2">{{ typeLabel(activity.type) }}</span>
                                <span class="text-gray-300">
                                    <strong>${{ activity.amount.toLocaleString() }}</strong>
                                    by <strong>{{ activity.userEmail }}</strong>
                                </span>
                            </div>
                            <span class="text-gray-500 text-xs ml-2 shrink-0">{{ formatTime(activity.createdAt) }}</span>
                        </div>
                    </div>
                </div>
                
                <!-- System Status -->
                <div class="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <h3 class="font-bold text-lg mb-4">System Status</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400 text-sm">WebSocket Feed</span>
                            <span class="px-2 py-1 bg-green-900/30 text-green-400 text-xs font-bold rounded">OPERATIONAL</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400 text-sm">Trading Engine</span>
                            <span class="px-2 py-1 bg-green-900/30 text-green-400 text-xs font-bold rounded">OPERATIONAL</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-gray-400 text-sm">Database</span>
                            <span class="px-2 py-1 bg-green-900/30 text-green-400 text-xs font-bold rounded">OPERATIONAL</span>
                        </div>
                    </div>

                    <!-- Platform Summary -->
                    <div class="mt-6 pt-4 border-t border-gray-700">
                        <h4 class="font-bold text-sm text-gray-400 mb-3">Platform Summary</h4>
                        <div class="grid grid-cols-2 gap-3">
                            <div class="bg-gray-900/50 p-3 rounded-lg">
                                <p class="text-xs text-gray-500 uppercase font-bold">Total Trades</p>
                                <p class="text-lg font-bold text-white">{{ adminStore.platformStats.totalTrades.toLocaleString() }}</p>
                            </div>
                            <div class="bg-gray-900/50 p-3 rounded-lg">
                                <p class="text-xs text-gray-500 uppercase font-bold">Active Users</p>
                                <p class="text-lg font-bold text-white">{{ adminStore.platformStats.totalUsers }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>
