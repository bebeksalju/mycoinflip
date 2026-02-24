<script setup>
import { ref, nextTick, onMounted, onUnmounted, watch } from 'vue';
import { io } from 'socket.io-client';
import { useAuthStore } from '../../stores/auth';
import api from '../../api/axios';

const authStore = useAuthStore();
const conversations = ref([]);
const activeUserId = ref(null);
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
    });

    socket.on('chat:receive', (msg) => {
        // If we're viewing this user's conversation, add message (with dedup)
        if (msg.userId === activeUserId.value) {
            if (!messages.value.some(m => m.id === msg.id)) {
                messages.value.push(msg);
                nextTick(scrollToBottom);
            }
            // Mark as read since we're viewing
            if (msg.sender === 'user') {
                socket.emit('chat:read', { userId: msg.userId });
            }
        }
        // Update conversation list
        updateConversationFromMessage(msg);
    });

    socket.on('chat:new-message', () => {
        loadConversations();
    });

    socket.on('chat:typing', (data) => {
        if (data.userId === activeUserId.value) {
            isTyping.value = true;
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => { isTyping.value = false; }, 2000);
        }
    });

    socket.on('chat:messages-read', (data) => {
        if (data?.userId === activeUserId.value) {
            messages.value.forEach(m => { if (m.sender === 'admin') m.read = true; });
        }
    });

    socket.on('disconnect', () => {
        isConnected.value = false;
    });
}

function updateConversationFromMessage(msg) {
    const idx = conversations.value.findIndex(c => c.userId === msg.userId);
    if (idx !== -1) {
        conversations.value[idx].lastMessage = msg.message;
        conversations.value[idx].lastMessageAt = msg.createdAt;
        if (msg.sender === 'user' && msg.userId !== activeUserId.value) {
            conversations.value[idx].unreadCount = (conversations.value[idx].unreadCount || 0) + 1;
        }
        // Move to top
        const conv = conversations.value.splice(idx, 1)[0];
        conversations.value.unshift(conv);
    } else {
        // New conversation
        loadConversations();
    }
}

async function loadConversations() {
    try {
        const res = await api.get('/chat/conversations');
        conversations.value = res.data;
    } catch (err) {
        console.error('Failed to load conversations:', err);
    }
}

async function selectUser(userId) {
    activeUserId.value = userId;
    isTyping.value = false;
    try {
        const res = await api.get(`/chat/messages/${userId}`);
        messages.value = res.data;
        nextTick(scrollToBottom);
        // Mark as read
        if (socket) socket.emit('chat:read', { userId });
        // Update unread count in list
        const conv = conversations.value.find(c => c.userId === userId);
        if (conv) conv.unreadCount = 0;
    } catch (err) {
        console.error('Failed to load messages:', err);
    }
}

function sendMessage() {
    if (!newMessage.value.trim() || !socket || !activeUserId.value) return;
    socket.emit('chat:admin:send', {
        userId: activeUserId.value,
        message: newMessage.value.trim()
    });
    newMessage.value = '';
}

function handleTyping() {
    if (socket && activeUserId.value) {
        socket.emit('chat:typing', { userId: activeUserId.value });
    }
}

function scrollToBottom() {
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
}

function formatTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getInitial(name) {
    return (name || '?')[0].toUpperCase();
}

const totalUnread = () => conversations.value.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

onMounted(() => {
    connect();
    loadConversations();
});

onUnmounted(() => {
    if (socket) socket.disconnect();
});
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold mb-6">Live Chat</h1>

        <div class="flex bg-gray-800 rounded-xl border border-gray-700 overflow-hidden" style="height: calc(100vh - 180px);">
            <!-- Left: Conversation List -->
            <div class="w-80 border-r border-gray-700 flex flex-col flex-none">
                <div class="p-4 border-b border-gray-700 bg-gray-900/50">
                    <h3 class="font-bold text-gray-300 text-sm">
                        Conversations
                        <span v-if="totalUnread() > 0" class="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {{ totalUnread() }}
                        </span>
                    </h3>
                </div>

                <div class="flex-1 overflow-y-auto">
                    <div v-if="conversations.length === 0" class="p-8 text-center text-gray-500 text-sm">
                        No conversations yet
                    </div>
                    <div v-for="conv in conversations" :key="conv.userId"
                        @click="selectUser(conv.userId)"
                        class="px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors border-b border-gray-700/30"
                        :class="activeUserId === conv.userId ? 'bg-gray-700/50 border-l-2 border-l-yellow-500' : 'hover:bg-gray-700/20'">
                        
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center font-bold text-white text-sm flex-none">
                            {{ getInitial(conv.name) }}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-center">
                                <span class="font-bold text-white text-sm truncate">{{ conv.name || conv.email }}</span>
                                <span class="text-[10px] text-gray-500 flex-none">{{ formatTime(conv.lastMessageAt) }}</span>
                            </div>
                            <p class="text-xs text-gray-400 truncate mt-0.5">{{ conv.lastMessage }}</p>
                        </div>
                        <span v-if="conv.unreadCount > 0"
                            class="w-5 h-5 bg-yellow-500 text-gray-900 text-[10px] font-bold rounded-full flex items-center justify-center flex-none">
                            {{ conv.unreadCount }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Right: Chat View -->
            <div class="flex-1 flex flex-col min-w-0">
                <!-- No user selected -->
                <div v-if="!activeUserId" class="flex-1 flex items-center justify-center text-gray-500">
                    <div class="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" class="w-16 h-16 mx-auto mb-4 text-gray-700">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                        </svg>
                        <p class="font-bold text-gray-400">Select a conversation</p>
                        <p class="text-sm text-gray-600 mt-1">Choose a user from the list to start chatting</p>
                    </div>
                </div>

                <!-- Chat active -->
                <template v-else>
                    <!-- Chat header -->
                    <div class="px-4 py-3 border-b border-gray-700 bg-gray-900/50 flex items-center gap-3 flex-none">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center font-bold text-white text-xs">
                            {{ getInitial(conversations.find(c => c.userId === activeUserId)?.name) }}
                        </div>
                        <div>
                            <p class="font-bold text-white text-sm">
                                {{ conversations.find(c => c.userId === activeUserId)?.name || 'User' }}
                            </p>
                            <p class="text-[10px] text-gray-500">
                                {{ conversations.find(c => c.userId === activeUserId)?.email }}
                            </p>
                        </div>
                    </div>

                    <!-- Messages -->
                    <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-950">
                        <div v-for="msg in messages" :key="msg.id"
                            class="flex" :class="msg.sender === 'admin' ? 'justify-end' : 'justify-start'">
                            <div class="max-w-[65%] rounded-2xl px-3 py-2 text-sm"
                                :class="msg.sender === 'admin' 
                                    ? 'bg-yellow-500 text-gray-900 rounded-br-md' 
                                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-md'">
                                <p class="break-words">{{ msg.message }}</p>
                                <p class="text-[10px] mt-1 text-right"
                                    :class="msg.sender === 'admin' ? 'text-yellow-800' : 'text-gray-500'">
                                    {{ formatTime(msg.createdAt) }}
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
                                type="text" placeholder="Type your reply..."
                                class="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-colors" />
                            <button type="submit" :disabled="!newMessage.trim()"
                                class="bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 text-gray-900 px-4 py-2.5 rounded-xl transition-colors font-bold flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                                Send
                            </button>
                        </form>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>
