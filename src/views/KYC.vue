<script setup>
import { reactive, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useMarketStore } from '../stores/market';

const authStore = useAuthStore();
const marketStore = useMarketStore();

const kycForm = reactive({
    fullName: '',
    idNumber: ''
});

const frontImage = ref(null);
const backImage = ref(null);
const frontFile = ref(null);
const backFile = ref(null);

const handleFileUpload = (event, side) => {
    const file = event.target.files[0];
    if (file) {
        if (side === 'front') {
            frontImage.value = file.name;
            frontFile.value = file;
        }
        if (side === 'back') {
            backImage.value = file.name;
            backFile.value = file;
        }
    }
};

const submitKYC = async () => {
    if (!kycForm.fullName || !kycForm.idNumber || !frontFile.value || !backFile.value) {
        marketStore.showToast('Error', 'Please complete all fields and uploads', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('fullName', kycForm.fullName);
    formData.append('idNumber', kycForm.idNumber);
    formData.append('front', frontFile.value);
    formData.append('back', backFile.value);

    const success = await authStore.submitKYC(formData);
    if (success) {
        marketStore.showToast('Submitted', 'KYC documents submitted for review', 'success');
    } else {
        marketStore.showToast('Error', 'KYC submission failed or already submitted', 'error');
    }
};
</script>

<template>
    <div class="h-full overflow-y-auto p-4 md:p-8 w-full">
        <div class="max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                    stroke="currentColor" class="w-8 h-8 text-yellow-500">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                </svg>
                Identity Verification (KYC)
            </h2>

            <!-- Status Banner -->
            <div v-if="authStore.user.kycStatus === 'pending'"
                class="bg-blue-500/10 border border-blue-500/20 p-6 rounded-lg text-center mb-6">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-8 h-8 text-blue-400">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">Under Review</h3>
                <p class="text-gray-400">Your documents have been submitted and are currently being reviewed by our
                    compliance team. This process typically takes 24-48 hours.</p>
            </div>

            <div v-else class="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8">

                <!-- Steps Indicator -->
                <div class="flex items-center justify-between mb-8 px-2 md:px-12">
                    <div class="flex flex-col items-center gap-2">
                        <div
                            class="w-8 h-8 rounded-full bg-yellow-500 text-gray-900 font-bold flex items-center justify-center">
                            1</div>
                        <span class="text-xs font-bold text-yellow-500">Details</span>
                    </div>
                    <div class="flex-1 h-0.5 bg-gray-800 mx-2 relative">
                        <div class="absolute inset-0 bg-yellow-500 w-1/2"></div>
                    </div>
                    <div class="flex flex-col items-center gap-2">
                        <div
                            class="w-8 h-8 rounded-full bg-yellow-500 text-gray-900 font-bold flex items-center justify-center">
                            2</div>
                        <span class="text-xs font-bold text-yellow-500">Documents</span>
                    </div>
                    <div class="flex-1 h-0.5 bg-gray-800 mx-2"></div>
                    <div class="flex flex-col items-center gap-2">
                        <div
                            class="w-8 h-8 rounded-full bg-gray-800 text-gray-500 font-bold flex items-center justify-center border border-gray-700">
                            3</div>
                        <span class="text-xs font-bold text-gray-500">Review</span>
                    </div>
                </div>

                <div class="space-y-6">
                    <!-- Personal Info Section -->
                    <div class="bg-gray-800/20 p-4 rounded-lg border border-gray-800">
                        <h3 class="font-bold text-gray-300 mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                class="w-4 h-4 text-yellow-500">
                                <path fill-rule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A9.916 9.916 0 0010 18c2.716 0 5.175-1.094 6.793-2.91A5.99 5.99 0 0010 12z"
                                    clip-rule="evenodd" />
                            </svg>
                            Personal Information
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs uppercase font-bold text-gray-500 mb-2">Full Legal
                                    Name</label>
                                <input type="text" v-model="kycForm.fullName" placeholder="As shown on ID"
                                    class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all">
                            </div>
                            <div>
                                <label class="block text-xs uppercase font-bold text-gray-500 mb-2">ID Number</label>
                                <input type="text" v-model="kycForm.idNumber" placeholder="Enter ID Number"
                                    class="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all">
                            </div>
                        </div>
                    </div>

                    <!-- Document Upload Section -->
                    <div>
                        <h3 class="font-bold text-gray-300 mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                class="w-4 h-4 text-yellow-500">
                                <path fill-rule="evenodd"
                                    d="M10.362 1.093a.75.75 0 00-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925zM18 6.443l-7.25 4v8.25l6.832-3.771a.75.75 0 00.418-.658V6.443zm-8.75 4v8.25L2.118 14.271a.75.75 0 01-.418-.658V6.443l7.55 4.167z"
                                    clip-rule="evenodd" />
                            </svg>
                            Document Upload
                        </h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Front UI -->
                            <div>
                                <label class="block text-xs uppercase font-bold text-gray-500 mb-2">Front of ID</label>
                                <div class="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-yellow-500/50 hover:bg-gray-800/50 transition-all cursor-pointer group h-40 flex flex-col items-center justify-center"
                                    @click="$refs.frontInput.click()"
                                    :class="{ 'border-green-500/50 bg-green-500/10': frontImage }">
                                    <input type="file" ref="frontInput" class="hidden"
                                        @change="(e) => handleFileUpload(e, 'front')" accept="image/*">
                                    <div v-if="!frontImage">
                                        <div
                                            class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                stroke-width="1.5" stroke="currentColor"
                                                class="w-5 h-5 text-gray-400 group-hover:text-yellow-500">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                            </svg>
                                        </div>
                                        <p class="text-xs text-gray-400">Upload Front</p>
                                    </div>
                                    <div v-else class="text-green-400 flex flex-col items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                            class="w-8 h-8">
                                            <path fill-rule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                                clip-rule="evenodd" />
                                        </svg>
                                        <p class="text-xs font-bold truncate max-w-[150px]">{{ frontImage }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Back UI -->
                            <div>
                                <label class="block text-xs uppercase font-bold text-gray-500 mb-2">Back of ID</label>
                                <div class="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-yellow-500/50 hover:bg-gray-800/50 transition-all cursor-pointer group h-40 flex flex-col items-center justify-center"
                                    @click="$refs.backInput.click()"
                                    :class="{ 'border-green-500/50 bg-green-500/10': backImage }">
                                    <input type="file" ref="backInput" class="hidden"
                                        @change="(e) => handleFileUpload(e, 'back')" accept="image/*">
                                    <div v-if="!backImage">
                                        <div
                                            class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                stroke-width="1.5" stroke="currentColor"
                                                class="w-5 h-5 text-gray-400 group-hover:text-yellow-500">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                            </svg>
                                        </div>
                                        <p class="text-xs text-gray-400">Upload Back</p>
                                    </div>
                                    <div v-else class="text-green-400 flex flex-col items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                                            class="w-8 h-8">
                                            <path fill-rule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                                clip-rule="evenodd" />
                                        </svg>
                                        <p class="text-xs font-bold truncate max-w-[150px]">{{ backImage }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pt-4">
                    <button @click="submitKYC"
                        class="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded transition-colors shadow-lg shadow-yellow-500/10">
                        Submit Documents
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
