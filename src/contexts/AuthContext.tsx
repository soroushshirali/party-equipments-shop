"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword,
  User,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface UserData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  uid: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (phone: string, password: string) => Promise<void>;
  signUp: (data: { firstName: string; lastName: string; phone: string; email?: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const data = userDoc.data();
        if (data) {
          const userData = {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            email: data.email,
            uid: user.uid
          };
          setUserData(userData);
          setIsAdmin(data.role === 'admin');
          // Store user data in localStorage
          localStorage.setItem('userData', JSON.stringify(userData));
        }
        // Redirect from login page if already logged in
        if (pathname === '/login') {
          router.push('/');
        }
        
        // Redirect from admin panel if not admin
        if (pathname === '/admin-panel' && !data?.role === 'admin') {
          router.push('/');
        }
      } else {
        // Redirect to login if not authenticated
      
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, pathname, router]);

  const signIn = async (phone: string, password: string) => {
    try {
      // Get user document by phone number
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', phone));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('کاربری با این شماره تلفن یافت نشد');
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const email = userData.email || `${phone}@example.com`;

      // Sign in with email and password
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithEmailAndPassword(auth, email, password);

      const userDataToStore = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        email: userData.email,
        uid: result.user.uid
      };

      setUserData(userDataToStore);
      setIsAdmin(userData.role === 'admin');
      
      // Store user data in localStorage
      localStorage.setItem('userData', JSON.stringify(userDataToStore));

      router.push('/');
    } catch (error: any) {
      console.error('Failed to sign in:', error);
      if (error.message === 'کاربری با این شماره تلفن یافت نشد') {
        throw error;
      }
      throw new Error('شماره تلفن یا رمز عبور نادرست است');
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Clear user data from localStorage
      localStorage.removeItem('userData');
      router.push('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw error;
    }
  };

  const signUp = async (data: { firstName: string; lastName: string; phone: string; email?: string; password: string }) => {
    try {
      // Check if phone number already exists
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', data.phone));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        throw new Error('این شماره تلفن قبلاً ثبت شده است');
      }

      // Create user with phone as email if no email provided
      const email = data.email || `${data.phone}@example.com`;
      const result = await createUserWithEmailAndPassword(auth, email, data.password);
      
      // Save additional user data
      await setDoc(doc(db, 'users', result.user.uid), {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        role: 'user'
      });

      router.push('/');
    } catch (error: any) {
      console.error('Failed to sign up:', error);
      
      // Convert Firebase errors to Persian messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('این ایمیل قبلاً ثبت شده است');
      } else if (error.message === 'این شماره تلفن قبلاً ثبت شده است') {
        throw error;
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('ایمیل وارد شده معتبر نیست');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('امکان ثبت نام در حال حاضر وجود ندارد');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('رمز عبور ضعیف است');
      }
      
      throw new Error('خطا در ثبت نام. لطفاً دوباره تلاش کنید');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Failed to send reset email:', error);
      throw error;
    }
  };

  const updateUserPassword = async (newPassword: string) => {
    try {
      if (!user) throw new Error('No user logged in');
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error('Failed to update password:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      userData,
      isAdmin, 
      loading, 
      signIn, 
      signUp,
      signOut,
      resetPassword,
      updateUserPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 