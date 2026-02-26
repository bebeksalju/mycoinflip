<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import { useAuthStore } from '../stores/auth';
import api from '../api/axios';

const authStore = useAuthStore();
const messages = ref([]);
const newMessage = ref('');
const isTyping = ref(false);
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
        markAsRead(); // Always mark as read when on the dedicated chat page
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
        markAsRead(); // Mark existing as read when loading
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
}

function handleTyping() {
    if (socket) socket.emit('chat:typing', {});
}

function scrollToBottom() {
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
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
    <div class="h-full flex flex-col bg-gray-950 max-w-4xl mx-auto w-full border-x border-gray-800">
        <!-- Header -->
        <div class="bg-gradient-to-r from-yellow-500 to-amber-600 px-6 py-4 flex items-center justify-between flex-none">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 text-white">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                </div>
                <div>
                    <h1 class="text-lg font-bold text-white leading-tight">Live Support</h1>
                    <p class="text-xs text-white/80 mt-0.5">
                        <span v-if="isConnected" class="flex items-center gap-1">
                            <span class="w-2 h-2 bg-green-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span> Online
                        </span>
                        <span v-else>Connecting...</span>
                    </p>
                </div>
            </div>
        </div>

        <!-- Messages Area -->
        <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-900/50">
            <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mb-4 text-gray-700">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
                <p class="text-lg font-medium">How can we help you today?</p>
                <p class="text-sm mt-2 text-gray-600">Send a message to start chatting with support.</p>
            </div>

            <div v-for="msg in messages" :key="msg.id"
                class="flex" :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'">
                <div class="max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm"
                    :class="msg.sender === 'user' 
                        ? 'bg-yellow-500 text-gray-900 rounded-br-md' 
                        : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-md'">
                    <p class="whitespace-pre-wrap break-words leading-relaxed">{{ msg.message }}</p>
                    <div class="flex items-center gap-1 mt-1 justify-end"
                        :class="msg.sender === 'user' ? 'text-yellow-800' : 'text-gray-500'">
                        <span class="text-[10px]">{{ formatTime(msg.createdAt) }}</span>
                        <svg v-if="msg.sender === 'user'" 
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                            class="w-3.5 h-3.5" :class="msg.read ? 'text-blue-600' : 'text-yellow-700/50'">
                            <path fill-rule="evenodd" d="M12.528 5.472a.75.75 0 00-1.056 0l-5.467 5.467a.75.75 0 001.056 1.056l4.94-4.94 10.472 10.472a.75.75 0 001.056-1.056l-11-11a.75.75 0 00-1.056 0z" />
                            <path fill-rule="evenodd" d="M2.472 10.472a.75.75 0 00-1.056 1.056l5.467 5.467a.75.75 0 001.056-1.056l-5.467-5.467z" />
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Typing indicator -->
            <div v-if="isTyping" class="flex justify-start">
                <div class="bg-gray-800 border border-gray-700 rounded-2xl rounded-bl-md px-5 py-3 shadow-sm">
                    <div class="flex gap-1.5 h-3 items-center">
                        <span class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                        <span class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                        <span class="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 md:p-6 bg-gray-900 border-t border-gray-800 flex-none pb-[80px] md:pb-6">
            <form @submit.prevent="sendMessage" class="flex gap-3">
                <input v-model="newMessage" @input="handleTyping"
                    type="text" placeholder="Type your message..."
                    class="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-3.5 text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all shadow-inner" />
                <button type="submit" :disabled="!newMessage.trim()"
                    class="bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-800 disabled:text-gray-600 text-gray-900 px-6 py-3.5 rounded-xl transition-colors font-bold flex items-center gap-2 shadow-lg disabled:shadow-none">
                    <span class="hidden md:inline">Send</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5 -rotate-45 md:rotate-0">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                </button>
            </form>
        </div>
    </div>
</template>
