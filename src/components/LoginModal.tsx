'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit number');
      setLoading(false);
      return;
    }

    try {
      // 🔴 FIX: useEffect hata kar yahan button click par verifier banaya hai
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
        });
      }

      const phoneNumber = `+91${phone}`;
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      
      setConfirmationResult(confirmation);
      setStep('OTP');
    } catch (err: any) {
      console.error("Send OTP Error:", err);
      
      // 🔴 FIX: Agar error aaye toh verifier ko clear kar dein taaki page refresh na karna pade
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      if (err.code === 'auth/invalid-app-credential') {
        setError('Firebase security block. Please whitelist "localhost" in Firebase Console.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (confirmationResult) {
        await confirmationResult.confirm(otp);
        alert("Login Successful! Welcome to Shivi's Elegance.");
        
        onClose();
        setStep('PHONE');
        setPhone('');
        setOtp('');
        
        router.push('/account'); 
      }
    } catch (err: any) {
      console.error(err);
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div id="recaptcha-container"></div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            />

            <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto relative"
              >
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-rose-900 transition p-1">
                  <X className="w-5 h-5" />
                </button>

                <div className="p-8 pb-6 text-center border-b border-gray-50 bg-rose-50/30">
                  <h2 className="text-2xl font-serif text-rose-900 mb-2">
                    Welcome to Shivi's Elegance
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {step === 'PHONE' ? 'Login or Signup to continue' : 'Enter the verification code'}
                  </p>
                </div>

                <div className="p-8">
                  {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                  {step === 'PHONE' ? (
                    <form onSubmit={handleSendOTP} className="flex flex-col space-y-4">
                      <div className="flex border border-gray-200 rounded-md overflow-hidden focus-within:border-rose-800 transition">
                        <span className="bg-gray-50 px-4 py-3 text-gray-500 border-r border-gray-200 font-medium">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter mobile number"
                          className="w-full px-4 py-3 outline-none text-gray-800"
                          autoFocus
                        />
                      </div>
                      <button 
                        type="submit" 
                        disabled={loading || phone.length !== 10}
                        className="w-full bg-rose-900 text-white py-3 rounded-md font-medium tracking-wide hover:bg-rose-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'SENDING...' : 'REQUEST OTP'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOTP} className="flex flex-col space-y-4">
                      <div className="text-center mb-2">
                        <span className="text-sm text-gray-500">Sent to +91 {phone}</span>
                        <button type="button" onClick={() => setStep('PHONE')} className="text-xs text-rose-800 font-medium ml-2 underline">Edit</button>
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="6-Digit OTP"
                        className="w-full px-4 py-3 border border-gray-200 rounded-md outline-none focus:border-rose-800 transition text-center tracking-[0.5em] text-lg font-medium"
                        autoFocus
                      />
                      <button 
                        type="submit" 
                        disabled={loading || otp.length !== 6}
                        className="w-full bg-rose-900 text-white py-3 rounded-md font-medium tracking-wide hover:bg-rose-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'VERIFYING...' : 'VERIFY & LOGIN'}
                      </button>
                    </form>
                  )}
                  
                  <p className="text-[10px] text-gray-400 text-center mt-6">
                    By continuing, I agree to the <span className="underline cursor-pointer hover:text-rose-800">Terms of Use</span> & <span className="underline cursor-pointer hover:text-rose-800">Privacy Policy</span>.
                  </p>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}