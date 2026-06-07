'use client';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // <-- Database functions

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('female');
  const [dob, setDob] = useState('');

  // User auth check aur data fetch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Agar user logged in hai, toh uska purana data database se laao
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setEmail(data.email || '');
          setGender(data.gender || 'female');
          setDob(data.dob || '');
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Save karne ka function
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    try {
      // User ke UID se ek document banega "users" collection mein
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        firstName,
        lastName,
        email,
        gender,
        dob,
        phoneNumber: user.phoneNumber,
        updatedAt: new Date()
      }, { merge: true }); // merge: true se purana data delete nahi hota, bas update hota hai
      
      alert('Profile details saved successfully!');
    } catch (error) {
      console.error("Error saving document: ", error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 shadow-sm p-8 flex justify-center items-center h-[400px]">
        <div className="w-8 h-8 border-4 border-rose-200 border-t-rose-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 shadow-sm p-6 md:p-8">
      <div className="border-b border-gray-100 pb-5 mb-8">
        <h3 className="text-xl font-serif text-gray-900">Personal Information</h3>
        <p className="text-gray-500 text-sm mt-1">Manage your personal details and contact information.</p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">First Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. Harshit" className="px-4 py-3 border border-gray-200 rounded-md outline-none focus:border-rose-800 focus:ring-1 focus:ring-rose-800 transition" />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Last Name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g. Sinha" className="px-4 py-3 border border-gray-200 rounded-md outline-none focus:border-rose-800 focus:ring-1 focus:ring-rose-800 transition" />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="px-4 py-3 border border-gray-200 rounded-md outline-none focus:border-rose-800 focus:ring-1 focus:ring-rose-800 transition" />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Mobile Number <span className="text-xs text-rose-800 ml-2">(Verified)</span></label>
            <input type="text" value={user?.phoneNumber || ''} disabled className="px-4 py-3 border border-gray-200 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed" />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Date of Birth</label>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-md outline-none focus:border-rose-800 focus:ring-1 focus:ring-rose-800 transition" />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Gender</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="px-4 py-3 border border-gray-200 rounded-md outline-none focus:border-rose-800 focus:ring-1 focus:ring-rose-800 transition bg-white">
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="mt-8">
          <button type="submit" disabled={saving} className="px-8 py-3 bg-rose-900 text-white rounded-md font-medium tracking-wide hover:bg-rose-800 transition w-full md:w-auto disabled:opacity-70 disabled:cursor-not-allowed">
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </form>
    </div>
  );
}