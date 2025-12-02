import { db, ROOT_ADMIN_EMAILS, ROOT_ADMIN_PHONES } from './firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, query, where, doc } from 'firebase/firestore';

// Checks if a user is an admin (either Root or in Database)
export const isUserAdmin = async (email?: string | null, phone?: string | null): Promise<boolean> => {
    // 1. Check Root Admins (Hardcoded in config) - Instant Access
    if (email && ROOT_ADMIN_EMAILS.includes(email)) return true;
    if (phone && ROOT_ADMIN_PHONES.includes(phone)) return true;

    // 2. Check Database Admins
    try {
        const adminsRef = collection(db, 'admins');
        let q;
        
        if (email) {
            q = query(adminsRef, where('email', '==', email));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) return true;
        }

        if (phone) {
            q = query(adminsRef, where('phone', '==', phone));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) return true;
        }
        
        return false;
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
};

export const getAdmins = async () => {
    const querySnapshot = await getDocs(collection(db, 'admins'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addAdmin = async (email: string, phone: string, name: string) => {
    await addDoc(collection(db, 'admins'), { email, phone, name, createdAt: new Date() });
};

export const removeAdmin = async (adminId: string) => {
    await deleteDoc(doc(db, 'admins', adminId));
};
