<script setup>
import { useWalletStore } from '../../stores/wallet';
import { useAuthStore } from '../../stores/auth';

const walletStore = useWalletStore();
const authStore = useAuthStore();
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Stats Cards -->
            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <p class="text-gray-400 text-sm font-bold uppercase mb-1">Total Users</p>
                <h3 class="text-3xl font-bold text-white">1,248</h3>
                <span class="text-green-400 text-xs font-bold">+12% this week</span>
            </div>

            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <p class="text-gray-400 text-sm font-bold uppercase mb-1">Total Deposits</p>
                <h3 class="text-3xl font-bold text-white">$452,000</h3>
                <span class="text-green-400 text-xs font-bold">+5% this week</span>
            </div>

            <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <p class="text-gray-400 text-sm font-bold uppercase mb-1">Pending KYC</p>
                <h3 class="text-3xl font-bold text-yellow-500">15</h3>
                <span class="text-gray-500 text-xs">Action required</span>
            </div>

             <div class="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <p class="text-gray-400 text-sm font-bold uppercase mb-1">Pending Withdrawals</p>
                <h3 class="text-3xl font-bold text-red-500">3</h3>
                <span class="text-gray-500 text-xs">Action required</span>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Recent Activity Placeholder -->
            <div class="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <h3 class="font-bold text-lg mb-4">Recent Activity</h3>
                <div class="space-y-4">
                    <div class="flex items-center justify-between text-sm pb-3 border-b border-gray-700/50 last:border-0">
                        <span class="text-gray-300">User <strong>john@doe.com</strong> registered</span>
                        <span class="text-gray-500 text-xs">2 mins ago</span>
                    </div>
                     <div class="flex items-center justify-between text-sm pb-3 border-b border-gray-700/50 last:border-0">
                        <span class="text-gray-300">Deposit of <strong>$500</strong> by <strong>jane@doe.com</strong></span>
                        <span class="text-gray-500 text-xs">15 mins ago</span>
                    </div>
                     <div class="flex items-center justify-between text-sm pb-3 border-b border-gray-700/50 last:border-0">
                        <span class="text-gray-300">New KYC submission from <strong>alex@smith.com</strong></span>
                        <span class="text-gray-500 text-xs">1 hour ago</span>
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
                        <span class="text-gray-400 text-sm">Payment Gateway</span>
                         <span class="px-2 py-1 bg-yellow-900/30 text-yellow-500 text-xs font-bold rounded">DEGRADED</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
