
import { db, ROOT_ADMIN_EMAILS, ROOT_ADMIN_PHONES } from './firebaseConfig';
import { Store } from '../types';

// Check if user is Root Admin
export const isRootAdmin = (email?: string | null, phone?: string | null): boolean => {
    if (email && ROOT_ADMIN_EMAILS.includes(email)) return true;
    if (phone && ROOT_ADMIN_PHONES.includes(phone)) return true;
    return false;
};

// Check if user owns one or more stores
export const getManagedStores = async (email?: string | null, phone?: string | null): Promise<Store[]> => {
    try {
        const storesRef = db.collection('stores');
        let emailStores: Store[] = [];
        let phoneStores: Store[] = [];

        if (email) {
            const snapshot = await storesRef.where('ownerEmail', '==', email).get();
            emailStores = snapshot.docs.map(doc => ({ ...doc.data(), storeId: doc.id } as Store));
        }

        if (phone) {
            const snapshot = await storesRef.where('ownerPhone', '==', phone).get();
            phoneStores = snapshot.docs.map(doc => ({ ...doc.data(), storeId: doc.id } as Store));
        }

        // Combine and Deduplicate by storeId
        const allStores = [...emailStores, ...phoneStores];
        const uniqueStores = Array.from(new Map(allStores.map(s => [s.storeId, s])).values());
        
        return uniqueStores;
    } catch (error) {
        console.error("Error checking store ownership:", error);
        return [];
    }
};

export const createStore = async (storeData: Store) => {
    // We use the storeId (slug) as the document ID for easy lookup
    await db.collection('stores').doc(storeData.storeId).set(storeData);
};

export const getAllStores = async (): Promise<Store[]> => {
    try {
        const snapshot = await db.collection('stores').get();
        const stores = snapshot.docs.map(doc => ({ ...doc.data(), storeId: doc.id } as Store));
        // Sort by creation date descending (newest first)
        return stores.sort((a, b) => {
             const timeA = a.createdAt?.seconds || 0;
             const timeB = b.createdAt?.seconds || 0;
             return timeB - timeA;
        });
    } catch (e) {
        console.error("Error fetching stores:", e);
        return [];
    }
};

export const deleteStore = async (storeId: string) => {
    await db.collection('stores').doc(storeId).delete();
};
