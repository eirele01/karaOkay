import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig();

    const firebaseConfig = {
        apiKey: config.public.firebaseApiKey,
        authDomain: config.public.firebaseAuthDomain,
        databaseURL: config.public.firebaseDatabaseURL,
        projectId: config.public.firebaseProjectId,
        storageBucket: config.public.firebaseStorageBucket,
        messagingSenderId: config.public.firebaseMessagingSenderId,
        appId: config.public.firebaseAppId,
    };

    // Prevent initialization if keys are missing (or allow if you want to handle it seamlessly)
    // For this demo, we'll try to init, but if empty, it might fail. 
    // We'll wrap in try-catch or just proceed.

    if (!firebaseConfig.apiKey) {
        console.warn("Firebase API keys are missing. Check nuxt.config.ts or .env");
    }

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    return {
        provide: {
            db,
        },
    };
});
