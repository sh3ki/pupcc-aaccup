import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, signInAnonymously, updateProfile, type Auth } from 'firebase/auth';
import { getDatabase, type Database } from 'firebase/database';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Database | null = null;

export function getFirebaseApp() {
    if (!app) {
        app = initializeApp({
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID,
        });
    }
    return app;
}

export async function getFirebaseAuth(currentUser?: { id: number; name?: string; avatar?: string }) {
    if (!auth) {
        auth = getAuth(getFirebaseApp());
        // Sign in anonymously – keeps RTDB secured while mapping to Laravel user id in data
        if (!auth.currentUser) {
            await signInAnonymously(auth).catch(() => {
                // ignore
            });
        }
        // Try setting display info for debugging/UX
        if (currentUser && auth.currentUser) {
            try {
                await updateProfile(auth.currentUser, {
                    displayName: currentUser.name || `User ${currentUser.id}`,
                    photoURL: currentUser.avatar || undefined,
                });
            } catch {
                // ignore
            }
        }
    }
    return auth;
}

export function getFirebaseDb() {
    if (!db) db = getDatabase(getFirebaseApp());
    return db;
}

export function initFirebase(currentUser?: { id: number; name?: string; avatar?: string }) {
    // Fire and forget sign-in
    void getFirebaseAuth(currentUser);
    return { app: getFirebaseApp(), auth: auth ?? getAuth(getFirebaseApp()), db: getFirebaseDb() };
}
