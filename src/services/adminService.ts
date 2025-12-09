
import { db, ROOT_ADMIN_EMAILS, ROOT_ADMIN_PHONES } from './firebaseConfig';

// Checks if a user is an admin (either Root or in Database)
export const isUserAdmin = async (email?: string | null, phone?: string | null): Promise<boolean> => {
    // 1. Check Root Admins (Hardcoded in config) - Instant Access
    if (email && ROOT_ADMIN_EMAILS.includes(email)) return true;
    if (phone && ROOT_ADMIN_PHONES.includes(phone)) return true;

    // 2. Check Database Admins
    try {
        const adminsRef = db.collection('admins');
        
        if (email) {
            const snapshot = await adminsRef.where('email', '==', email).get();
            if (!snapshot.empty) return true;
        }

        if (phone) {
            const snapshot = await adminsRef.where('phone', '==', phone).get();
            if (!snapshot.empty) return true;
        }
        
        return false;
    } catch (error) {
        console.error("Error checking admin status:", error);
        return false;
    }
};

export const getAdmins = async () => {
    const querySnapshot = await db.collection('admins').get();
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addAdmin = async (email: string, phone: string, name: string) => {
    await db.collection('admins').add({ email, phone, name, createdAt: new Date() });
};

export const removeAdmin = async (adminId: string) => {
    await db.collection('admins').doc(adminId).delete();
};
