'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { auth, db } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle2, MapPin, CreditCard } from 'lucide-react';
import { State, City } from 'country-state-city';

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  
  // 1. Form States
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', state: '', city: '', district: '', pincode: '', landmark: ''
  });

  // 2. OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  // 3. UI & Location States
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const indianStates = State.getStatesOfCountry('IN');
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const availableCities = selectedStateCode ? City.getCitiesOfState('IN', selectedStateCode) : [];

  // Handlers for Form Data
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

  // OTP Handlers
  const handleSendOTP = async () => {
    if (formData.phone.length !== 10) return alert('Enter valid 10-digit phone number');
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'checkout-recaptcha', { size: 'invisible' });
      }
      const confirmation = await signInWithPhoneNumber(auth, `+91${formData.phone}`, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);
    } catch (err) {
      console.error("OTP Error:", err);
      alert('Failed to send OTP. Please check your network or try again.');
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
      alert('Invalid OTP. Please try again.');
    }
  };

  // Razorpay Script Loader
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Mega Payment & Database Handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) return alert('Please verify your phone number using OTP first!');
    
    setIsProcessingPayment(true);

    // Step A: Load Razorpay Script
    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setIsProcessingPayment(false);
      return;
    }

    try {
      // Step B: Create Order ID from Backend API
      const orderResponse = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: cartTotal }),
      });
      
      const orderData = await orderResponse.json();
      if (!orderData.orderId) throw new Error('Failed to generate Order ID from server');

      // Step C: Initialize Razorpay Popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: orderData.amount,
        currency: 'INR',
        name: "Shivi's Elegance",
        description: "Payment for Handcrafted Jewellery",
        order_id: orderData.orderId, 
        handler: async function (response: any) {
          try {
            const currentUser = auth.currentUser;
            
            if (currentUser) {
              // 1. Save/Update User Profile in Firestore
              await setDoc(doc(db, 'users', currentUser.uid), {
                firstName: formData.name.split(' ')[0] || formData.name,
                lastName: formData.name.split(' ')[1] || '',
                email: formData.email,
                phone: formData.phone,
                updatedAt: serverTimestamp()
              }, { merge: true });

              // 2. Save Full Order Details in Firestore
              await addDoc(collection(db, 'orders'), {
                userId: currentUser.uid,
                items: cart,
                totalAmount: cartTotal,
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                shippingDetails: formData,
                status: 'Paid',
                createdAt: serverTimestamp()
              });
            }

            alert('Payment Successful! Your order has been placed.');
            // 3. Clear the Cart and Redirect
            localStorage.removeItem('shivis_cart');
            window.location.href = '/account';

          } catch (dbError) {
            console.error("Database Save Error:", dbError);
            alert("Payment successful, but saving order failed. Contact Support.");
            window.location.href = '/account';
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: `+91${formData.phone}`
        },
        notes: {
          address: `${formData.address}, ${formData.landmark}, ${formData.city}, ${formData.state} - ${formData.pincode}`
        },
        theme: { color: "#881337" } // Rose-900 color theme
      };

      const paymentObject = new (window as any).Razorpay(options);
      
      paymentObject.on('payment.failed', function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
        setIsProcessingPayment(false);
      });
      
      paymentObject.open();

    } catch (error) {
      console.error("Order Creation Error:", error);
      alert('Something went wrong during payment initialization.');
      setIsProcessingPayment(false);
    }
  };

  // If cart is empty, don't show the form
  if (cart.length === 0) {
    return <div className="text-center py-20 text-xl font-serif text-gray-900">Your cart is empty. Please add items to checkout.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col lg:flex-row gap-8 lg:gap-12 bg-white">
      
      {/* Invisible Recaptcha required by Firebase */}
      <div id="checkout-recaptcha"></div>

      {/* LEFT COLUMN: Main Form */}
      <div className="w-full lg:w-2/3 order-2 lg:order-1">
        <h1 className="text-2xl md:text-3xl font-serif text-gray-900 mb-6 md:mb-8 text-center lg:text-left">Secure Checkout</h1>
        
        <form onSubmit={handlePlaceOrder} className="space-y-6 md:space-y-8">
          
          {/* Section 1: Contact Information */}
          <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-base md:text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" name="name" placeholder="Full Name" onChange={handleChange} className="w-full p-3 text-sm md:text-base border rounded-md outline-none focus:border-rose-800 bg-white" />
              <input required type="email" name="email" placeholder="Email Address" onChange={handleChange} className="w-full p-3 text-sm md:text-base border rounded-md outline-none focus:border-rose-800 bg-white" />
              
              {/* OTP Input Block */}
              <div className="md:col-span-2 border border-rose-100 bg-white p-3 md:p-4 rounded-md flex flex-col sm:flex-row gap-4 items-end shadow-sm">
                <div className="w-full">
                  <label className="text-xs text-gray-500 mb-1 block">Phone Number (Required for OTP & Delivery)</label>
                  <div className="flex border rounded-md overflow-hidden focus-within:border-rose-800 transition-colors">
                    <span className="bg-gray-50 px-3 py-3 text-sm md:text-base text-gray-500 border-r">+91</span>
                    <input disabled={otpVerified || otpSent} required type="tel" maxLength={10} name="phone" onChange={handleChange} className="w-full px-3 py-3 text-sm md:text-base outline-none disabled:bg-gray-50" />
                  </div>
                </div>
                
                {!otpSent && !otpVerified && (
                  <button type="button" onClick={handleSendOTP} className="w-full sm:w-auto bg-gray-900 text-white px-5 py-3 text-sm rounded-md hover:bg-gray-800 whitespace-nowrap transition">
                    Send OTP
                  </button>
                )}

                {otpSent && !otpVerified && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input type="text" maxLength={6} placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-3 border rounded-md text-center tracking-widest text-sm outline-none focus:border-rose-800" />
                    <button type="button" onClick={handleVerifyOTP} className="bg-rose-900 text-white px-5 py-3 text-sm rounded-md hover:bg-rose-800 transition">
                      Verify
                    </button>
                  </div>
                )}

                {otpVerified && (
                  <div className="flex items-center justify-center text-green-700 font-medium px-4 py-3 bg-green-50 rounded-md border border-green-200 w-full sm:w-auto text-sm">
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Verified
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Shipping Address */}
          <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-base md:text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="md:col-span-2 relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input required type="text" name="landmark" placeholder="Search Landmark (or enter manually)" onChange={handleChange} className="w-full pl-10 p-3 text-sm md:text-base border rounded-md outline-none focus:border-rose-800 bg-white" />
              </div>

              <input required type="text" name="address" placeholder="Flat, House no., Apartment, Building" onChange={handleChange} className="md:col-span-2 w-full p-3 text-sm md:text-base border rounded-md outline-none focus:border-rose-800 bg-white" />
              
              <select required name="state" value={selectedStateCode} onChange={handleStateChange} className="w-full p-3 text-sm md:text-base border rounded-md outline-none focus:border-rose-800 bg-white">
                <option value="">Select State</option>
                {indianStates.map((state) => (
                  <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                ))}
              </select>

              <select required name="city" onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))} disabled={!selectedStateCode} className="w-full p-3 text-sm md:text-base border rounded-md outline-none focus:border-rose-800 bg-white disabled:bg-gray-100">
                <option value="">Select City</option>
                {availableCities.map((city) => (
                  <option key={city.name} value={city.name}>{city.name}</option>
                ))}
              </select>

              <input required type="text" name="district" placeholder="District" onChange={handleChange} className="w-full p-3 text-sm md:text-base border rounded-md outline-none focus:border-rose-800 bg-white" />
              <input required type="text" maxLength={6} name="pincode" placeholder="Pincode" onChange={handleChange} className="w-full p-3 text-sm md:text-base border rounded-md outline-none focus:border-rose-800 bg-white" />
            </div>
          </div>

          <button disabled={isProcessingPayment} type="submit" className="w-full bg-rose-900 text-white py-4 md:py-5 rounded-xl font-medium tracking-wide hover:bg-rose-800 transition shadow-lg flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-60 disabled:cursor-not-allowed">
            <CreditCard className="w-5 h-5" />
            {isProcessingPayment ? "PROCESSING SECURE PAYMENT..." : `PAY NOW (₹${cartTotal.toLocaleString('en-IN')})`}
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: Mini Cart Summary */}
      <div className="w-full lg:w-1/3 order-1 lg:order-2">
        <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-100 sticky top-24 shadow-sm">
          <h2 className="text-lg font-serif text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-4 mb-6 max-h-[250px] lg:max-h-[400px] overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <img src={item.image} alt={item.name} className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-md border border-gray-200" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs md:text-sm font-medium text-gray-900 truncate">{item.name}</h3>
                  <p className="text-[11px] md:text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-xs md:text-sm font-medium text-gray-900 whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
            <span className="font-medium text-gray-900 text-sm md:text-base">Total</span>
            <span className="text-xl md:text-2xl font-serif text-rose-900">₹{cartTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}