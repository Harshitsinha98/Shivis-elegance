'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { CheckCircle2, MapPin } from 'lucide-react';
// 🔴 Naya NPM Package Import kiya
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

  // 🔴 Dynamic States aur Cities ke liye setup
  const indianStates = State.getStatesOfCountry('IN');
  const [selectedStateCode, setSelectedStateCode] = useState('');
  const availableCities = selectedStateCode ? City.getCitiesOfState('IN', selectedStateCode) : [];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔴 State Change Handler
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const stateName = indianStates.find(s => s.isoCode === code)?.name || '';
    
    setSelectedStateCode(code);
    setFormData((prev) => ({ ...prev, state: stateName, city: '' })); // Reset city
  };

  // 🔴 City Change Handler
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

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) return alert('Please verify your phone number first!');
    
    console.log("Order Ready:", formData, cart);
    alert('Moving to Payment Gateway...');
  };

  if (cart.length === 0) {
    return <div className="text-center py-20 text-xl font-serif">Your cart is empty. Please add items to checkout.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12 bg-white">
      
      <div id="checkout-recaptcha"></div>

      <div className="lg:w-2/3">
        <h1 className="text-3xl font-serif text-gray-900 mb-8">Secure Checkout</h1>
        
        <form onSubmit={handlePlaceOrder} className="space-y-8">
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" name="name" placeholder="Full Name" onChange={handleChange} className="w-full p-3 border rounded-md outline-none focus:border-rose-800" />
              <input required type="email" name="email" placeholder="Email Address" onChange={handleChange} className="w-full p-3 border rounded-md outline-none focus:border-rose-800" />
              
              <div className="md:col-span-2 border border-rose-100 bg-white p-4 rounded-md flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full">
                  <label className="text-xs text-gray-500 mb-1 block">Phone Number (Required for delivery)</label>
                  <div className="flex border rounded-md overflow-hidden focus-within:border-rose-800">
                    <span className="bg-gray-50 px-4 py-3 text-gray-500 border-r">+91</span>
                    <input disabled={otpVerified || otpSent} required type="tel" maxLength={10} name="phone" onChange={handleChange} className="w-full px-4 py-3 outline-none" />
                  </div>
                </div>
                
                {!otpSent && !otpVerified && (
                  <button type="button" onClick={handleSendOTP} className="bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-800 whitespace-nowrap">
                    Send OTP
                  </button>
                )}

                {otpSent && !otpVerified && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input type="text" maxLength={6} placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-3 border rounded-md text-center tracking-widest outline-none focus:border-rose-800" />
                    <button type="button" onClick={handleVerifyOTP} className="bg-rose-900 text-white px-6 py-3 rounded-md hover:bg-rose-800">
                      Verify
                    </button>
                  </div>
                )}

                {otpVerified && (
                  <div className="flex items-center text-green-600 font-medium px-4 py-3 bg-green-50 rounded-md border border-green-200 w-full sm:w-auto">
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Verified
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="md:col-span-2 relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input required type="text" name="landmark" placeholder="Search Landmark (or enter manually)" onChange={handleChange} className="w-full pl-10 p-3 border rounded-md outline-none focus:border-rose-800" />
              </div>

              <input required type="text" name="address" placeholder="Flat, House no., Building, Company, Apartment" onChange={handleChange} className="md:col-span-2 w-full p-3 border rounded-md outline-none focus:border-rose-800" />
              
              {/* 🔴 Dynamic States Dropdown */}
              <select required name="state" value={selectedStateCode} onChange={handleStateChange} className="w-full p-3 border rounded-md outline-none focus:border-rose-800 bg-white">
                <option value="">Select State</option>
                {indianStates.map((state) => (
                  <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                ))}
              </select>

              {/* 🔴 Dynamic Cities Dropdown */}
              <select required name="city" value={formData.city} onChange={handleCityChange} disabled={!selectedStateCode} className="w-full p-3 border rounded-md outline-none focus:border-rose-800 bg-white disabled:bg-gray-100">
                <option value="">Select City</option>
                {availableCities.map((city) => (
                  <option key={city.name} value={city.name}>{city.name}</option>
                ))}
              </select>

              <input required type="text" name="district" placeholder="District" onChange={handleChange} className="w-full p-3 border rounded-md outline-none focus:border-rose-800" />
              <input required type="text" maxLength={6} name="pincode" placeholder="Pincode" onChange={handleChange} className="w-full p-3 border rounded-md outline-none focus:border-rose-800" />
            </div>
          </div>

          <button type="submit" className="w-full bg-rose-900 text-white py-4 rounded-md font-medium tracking-wide hover:bg-rose-800 transition shadow-lg">
            PROCEED TO PAYMENT (₹{cartTotal.toLocaleString('en-IN')})
          </button>
        </form>
      </div>

      <div className="lg:w-1/3">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 sticky top-28">
          <h2 className="text-lg font-serif text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
            <span className="font-medium text-gray-900">Total</span>
            <span className="text-2xl font-serif text-rose-900">₹{cartTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}