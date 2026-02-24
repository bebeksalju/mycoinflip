<script setup>
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/auth';
import api from '../api/axios';

const authStore = useAuthStore();
const isOpen = ref(false);
const messages = ref([]);
const newMessage = ref('');
const isTyping = ref(false);
const unreadCount = ref(0);
const chatContainer = ref(null);
const isConnected = ref(false);
let socket = null;
let typingTimeout = null;

function connect() {
    if (socket) socket.disconnect();

    socket = io('/chat', {
        auth: { token: authStore.user.token }
    });

    socket.on('connect', () => {
        isConnected.value = true;
        console.log('Chat connected');
    });

    socket.on('chat:receive', (msg) => {
        // Deduplicate: skip if we already have this message
        if (messages.value.some(m => m.id === msg.id)) return;
        messages.value.push(msg);
        if (!isOpen.value && msg.sender === 'admin') {
            unreadCount.value++;
        }
        nextTick(scrollToBottom);
    });

    socket.on('chat:typing', () => {
        isTyping.value = true;
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => { isTyping.value = false; }, 2000);
    });

    socket.on('chat:messages-read', () => {
        messages.value.forEach(m => { if (m.sender === 'user') m.read = true; });
    });

    socket.on('disconnect', () => {
        isConnected.value = false;
    });

    socket.on('connect_error', (err) => {
        console.error('Chat connection error:', err.message);
        isConnected.value = false;
    });
}

async function loadHistory() {
    try {
        const res = await api.get('/chat/messages');
        messages.value = res.data;
        nextTick(scrollToBottom);
    } catch (err) {
        console.error('Failed to load chat history:', err);
    }
}

function sendMessage() {
    if (!newMessage.value.trim() || !socket) return;
    socket.emit('chat:send', { message: newMessage.value.trim() });
    newMessage.value = '';
}

function markAsRead() {
    if (socket) socket.emit('chat:read', {});
    unreadCount.value = 0;
}

function handleTyping() {
    if (socket) socket.emit('chat:typing', {});
}

function scrollToBottom() {
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
}

function toggleChat() {
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        markAsRead();
        nextTick(scrollToBottom);
    }
}

function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

onMounted(() => {
    connect();
    loadHistory();
});

onUnmounted(() => {
    if (socket) socket.disconnect();
});
</script>

<template>
    <!-- Floating Chat Button -->
    <div class="fixed bottom-6 right-6 z-50">
        <!-- Chat Panel -->
        <transition name="chat-panel">
            <div v-if="isOpen"
                class="absolute bottom-16 right-0 w-80 sm:w-96 h-[28rem] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                
                <!-- Header -->
                <div class="bg-gradient-to-r from-yellow-500 to-amber-600 px-4 py-3 flex items-center justify-between flex-none">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-white">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm font-bold text-white">Live Support</p>
                            <p class="text-[10px] text-white/70">
                                <span v-if="isConnected" class="flex items-center gap-1">
                                    <span class="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span> Online
                                </span>
                                <span v-else>Connecting...</span>
                            </p>
                        </div>
                    </div>
                    <button @click="isOpen = false" class="text-white/80 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </button>
                </div>

                <!-- Messages -->
                <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-950">
                    <div v-if="messages.length === 0" class="text-center text-gray-500 text-sm mt-8">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10 mx-auto mb-2 text-gray-700">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                        </svg>
                        <p>No messages yet</p>
                        <p class="text-xs text-gray-600 mt-1">Send a message to start chatting!</p>
                    </div>

                    <div v-for="msg in messages" :key="msg.id"
                        class="flex" :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'">
                        <div class="max-w-[75%] rounded-2xl px-3 py-2 text-sm"
                            :class="msg.sender === 'user' 
                                ? 'bg-yellow-500 text-gray-900 rounded-br-md' 
                                : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-md'">
                            <p class="break-words">{{ msg.message }}</p>
                            <p class="text-[10px] mt-1 text-right"
                                :class="msg.sender === 'user' ? 'text-yellow-800' : 'text-gray-500'">
                                {{ formatTime(msg.createdAt) }}
                                <span v-if="msg.sender === 'user' && msg.read" class="ml-1">✓✓</span>
                            </p>
                        </div>
                    </div>

                    <!-- Typing indicator -->
                    <div v-if="isTyping" class="flex justify-start">
                        <div class="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-md px-4 py-2">
                            <div class="flex gap-1">
                                <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                                <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                                <span class="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Input -->
                <div class="border-t border-gray-700 p-3 bg-gray-900 flex-none">
                    <form @submit.prevent="sendMessage" class="flex gap-2">
                        <input v-model="newMessage" @input="handleTyping"
                            type="text" placeholder="Type a message..."
                            class="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors" />
                        <button type="submit" :disabled="!newMessage.trim()"
                            class="bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 text-gray-900 px-3 py-2 rounded-xl transition-colors font-bold">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </transition>

        <!-- Floating Bubble -->
        <button @click="toggleChat"
            class="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 shadow-lg shadow-yellow-500/25 flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            :class="isOpen ? 'rotate-0' : 'animate-bounce-subtle'">
            <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-7 h-7 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-7 h-7 text-white">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>

            <!-- Unread badge -->
            <span v-if="unreadCount > 0 && !isOpen"
                class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
        </button>
    </div>
</template>

<style scoped>
.chat-panel-enter-active {
    animation: chat-in 0.3s ease-out;
}
.chat-panel-leave-active {
    animation: chat-in 0.2s ease-in reverse;
}
@keyframes chat-in {
    from { opacity: 0; transform: translateY(20px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes bounce-subtle {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
}
.animate-bounce-subtle {
    animation: bounce-subtle 3s ease-in-out infinite;
}
</style>
