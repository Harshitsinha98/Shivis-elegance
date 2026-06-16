'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { auth, db } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
// 🔴 Firestore imports database me order aur profile save karne ke liye
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle2, MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import { State, City } from 'country-state-city';

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', state: '', city: '', district: '', pincode: '', landmark: ''
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const indianStates = State.getStatesOfCountry('IN');
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const availableCities = selectedStateCode ? City.getCitiesOfState('IN', selectedStateCode) : [];
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const stateName = indianStates.find(s => s.isoCode === code)?.name || '';
    setSelectedStateCode(code);
    setFormData((prev) => ({ ...prev, state: stateName, city: '' }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, city: e.target.value }));
  };

  const handleSendOTP = async () => {
    if (formData.phone.length !== 10) return alert('Enter valid 10-digit number');
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'checkout-recaptcha', { size: 'invisible' });
      }
      const confirmation = await signInWithPhoneNumber(auth, `+91${formData.phone}`, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      alert('Failed to send OTP. Try again.');
      if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
    }
  };

  const handleVerifyOTP = async () => {
    try {
      if (confirmationResult) {
        await confirmationResult.confirm(otp);
        setOtpVerified(true);
      }
    } catch (err) {
      alert('Invalid OTP');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 🔴 Full Flow: Razorpay + Auto Account + Firestore Order Saving
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) return alert('Please verify your phone number first!');
    
    setIsProcessingPayment(true);

    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load.');
      setIsProcessingPayment(false);
      return;
    }

    const options = {
      key: 'rzp_test_YOUR_KEY_HERE', // Apni Razorpay Test Key yahan dalein
      amount: cartTotal * 100, 
      currency: 'INR',
      name: "Shivi's Elegance",
      description: "Order Payment for Handcrafted Jewellery",
      image: "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?q=80&w=200", 
      handler: async function (response: any) {
        try {
          const currentUser = auth.currentUser;
          
          if (currentUser) {
            // 1. Automatically Create/Update User Account Profile in Firestore
            await setDoc(doc(db, 'users', currentUser.uid), {
              firstName: formData.name.split(' ')[0] || formData.name,
              lastName: formData.name.split(' ')[1] || '',
              email: formData.email,
              phone: formData.phone,
              createdAt: serverTimestamp()
            }, { merge: true });

            // 2. Save Order Details under 'orders' Collection
            await addDoc(collection(db, 'orders'), {
              userId: currentUser.uid,
              items: cart,
              totalAmount: cartTotal,
              paymentId: response.razorpay_payment_id,
              shippingDetails: formData,
              status: 'Paid',
              createdAt: serverTimestamp()
            });
          }

          alert('Payment Successful & Order Placed!');
          // 3. Clear Cart from LocalStorage
          localStorage.removeItem('shivis_cart');
          // 4. Redirect User to Dashboard
          window.location.href = '/account';

        } catch (dbError) {
          console.error("Error saving order to Firestore:", dbError);
          alert("Payment success but order saving failed. Contact support.");
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: `+91${formData.phone}`
      },
      notes: {
        address: `${formData.address}, ${formData.landmark}, ${formData.city}, ${formData.state}`
      },
      theme: { color: "#881337" }
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
    setIsProcessingPayment(false);
  };

  if (cart.length === 0) {
    return <div className="text-center py-20 text-xl font-serif">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12 flex flex-col lg:flex-row gap-8 lg:gap-12 bg-white">
      <div id="checkout-recaptcha"></div>

      {/* Form Section */}
      <div className="w-full lg:w-2/3 order-2 lg:order-1">
        <h1 className="text-2xl md:text-3xl font-serif text-gray-900 mb-6 text-center lg:text-left">Secure Checkout</h1>
        <form onSubmit={handlePlaceOrder} className="space-y-6">
          {/* Contact Information */}
          <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-base md:text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" name="name" placeholder="Full Name" onChange={handleChange} className="w-full p-3 text-sm border rounded-md outline-none focus:border-rose-800 bg-white" />
              <input required type="email" name="email" placeholder="Email Address" onChange={handleChange} className="w-full p-3 text-sm border rounded-md outline-none focus:border-rose-800 bg-white" />
              
              <div className="md:col-span-2 border border-rose-100 bg-white p-3 rounded-md flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full">
                  <label className="text-xs text-gray-500 mb-1 block">Phone Number (For Delivery & OTP)</label>
                  <div className="flex border rounded-md overflow-hidden focus-within:border-rose-800">
                    <span className="bg-gray-50 px-3 py-3 text-sm text-gray-500 border-r">+91</span>
                    <input disabled={otpVerified || otpSent} required type="tel" maxLength={10} name="phone" onChange={handleChange} className="w-full px-3 py-3 text-sm outline-none" />
                  </div>
                </div>
                {!otpSent && !otpVerified && (
                  <button type="button" onClick={handleSendOTP} className="w-full sm:w-auto bg-gray-900 text-white px-5 py-3 text-sm rounded-md hover:bg-gray-800 whitespace-nowrap transition">Send OTP</button>
                )}
                {otpSent && !otpVerified && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input type="text" maxLength={6} placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-3 border rounded-md text-center tracking-widest text-sm outline-none focus:border-rose-800" />
                    <button type="button" onClick={handleVerifyOTP} className="bg-rose-900 text-white px-5 py-3 text-sm rounded-md hover:bg-rose-800 transition">Verify</button>
                  </div>
                )}
                {otpVerified && (
                  <div className="flex items-center justify-center text-green-600 font-medium px-4 py-3 bg-green-50 rounded-md border border-green-200 w-full sm:w-auto text-sm">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Verified
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-base md:text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 relative">
                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input required type="text" name="landmark" placeholder="Search Landmark (or enter manually)" onChange={handleChange} className="w-full pl-9 p-3 text-sm border rounded-md outline-none focus:border-rose-800 bg-white" />
              </div>
              <input required type="text" name="address" placeholder="Flat, House no., Apartment" onChange={handleChange} className="md:col-span-2 w-full p-3 text-sm border rounded-md outline-none focus:border-rose-800 bg-white" />
              <select required name="state" value={selectedStateCode} onChange={handleStateChange} className="w-full p-3 text-sm border rounded-md outline-none focus:border-rose-800 bg-white">
                <option value="">Select State</option>
                {indianStates.map((state) => <option key={state.isoCode} value={state.isoCode}>{state.name}</option>)}
              </select>
              <select required name="city" value={formData.city} onChange={handleCityChange} disabled={!selectedStateCode} className="w-full p-3 text-sm border rounded-md outline-none focus:border-rose-800 bg-white disabled:bg-gray-100">
                <option value="">Select City</option>
                {availableCities.map((city) => <option key={city.name} value={city.name}>{city.name}</option>)}
              </select>
              <input required type="text" name="district" placeholder="District" onChange={handleChange} className="w-full p-3 text-sm border rounded-md outline-none focus:border-rose-800 bg-white" />
              <input required type="text" maxLength={6} name="pincode" placeholder="Pincode" onChange={handleChange} className="w-full p-3 text-sm border rounded-md outline-none focus:border-rose-800 bg-white" />
            </div>
          </div>

          <button type="submit" disabled={isProcessingPayment} className="w-full bg-rose-900 text-white py-4 rounded-xl font-medium tracking-wide hover:bg-rose-800 transition shadow-md flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50">
            <CreditCard className="w-5 h-5" />
            {isProcessingPayment ? "PROCESSING..." : `PAY NOW (₹${cartTotal.toLocaleString('en-IN')})`}
          </button>
        </form>
      </div>

      {/* Mini Cart Summary */}
      <div className="w-full lg:w-1/3 order-1 lg:order-2">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 sticky top-24 shadow-sm">
          <h2 className="text-lg font-serif text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-4 mb-6 max-h-[250px] overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-medium text-gray-900 truncate">{item.name}</h3>
                  <p className="text-[11px] text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-xs font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
            <span className="font-medium text-gray-900 text-sm">Total</span>
            <span className="text-xl font-serif text-rose-900">₹{cartTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}