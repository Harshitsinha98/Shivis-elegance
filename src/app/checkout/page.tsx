'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { CheckCircle2, MapPin, CreditCard } from 'lucide-react';
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

  // 🔴 Razorpay Script Loader Function
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 🔴 Main Order & Razorpay Payment Handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpVerified) return alert('Please verify your phone number first!');
    
    setIsProcessingPayment(true);

    // 1. Script load karein
    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setIsProcessingPayment(false);
      return;
    }

    // 2. Razorpay Options Config
    // Note: 'key' mein aap apni real Razorpay Dashboard se mili Test/Live Key daalenge
    const options = {
      key: 'rzp_test_YOUR_KEY_HERE', 
      amount: cartTotal * 100, // Razorpay paise mein amount leta hai (₹100 = 10000 paise)
      currency: 'INR',
      name: "Shivi's Elegance",
      description: "Order Payment for Handcrafted Jewellery",
      image: "https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?q=80&w=200", 
      handler: function (response: any) {
        // Yeh function tab chalega jab payment successful ho jayega
        alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
        console.log("Razorpay Response:", response);
        
        // Iske baad hum database mein order save karne ka logic daalenge aur cart empty karenge
        localStorage.removeItem('shivis_cart');
        window.location.href = '/account/orders'; // Payment ke baad order success ya account page par redirect
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: `+91${formData.phone}`
      },
      notes: {
        address: `${formData.address}, ${formData.landmark}, ${formData.city}, ${formData.state} - ${formData.pincode}`
      },
      theme: {
        color: "#881337" // Shivi's Elegance ka custom Rose-900 theme color 
      }
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
    setIsProcessingPayment(false);
  };

  if (cart.length === 0) {
    return <div className="text-center py-20 text-xl font-serif">Your cart is empty. Please add items to checkout.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-12 flex flex-col lg:flex-row gap-8 lg:gap-12 bg-white">
      
      <div id="checkout-recaptcha"></div>

      {/* Form Section */}
      <div className="w-full lg:w-2/3 order-2 lg:order-1">
        <h1 className="text-2xl md:text-3xl font-serif text-gray-900 mb-6 md:mb-8 text-center lg:text-left">Secure Checkout</h1>
        
        <form onSubmit={handlePlaceOrder} className="space-y-6 md:space-y-8">
          
          {/* Contact Info Card */}
          <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-base md:text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" name="name" placeholder="Full Name" onChange={handleChange} className="w-full p-3 text-sm md:text-base border rounded-md outline-none focus:border-rose-800 bg-white" />
              <input required type="email" name="email" placeholder="Email Address" onChange={handleChange} className="w-full p-3 text-sm md:text-base border rounded-md outline-none focus:border-rose-800 bg-white" />
              
              {/* OTP Number input wrap */}
              <div className="md:col-span-2 border border-rose-100 bg-white p-3 md:p-4 rounded-md flex flex-col sm:flex-row gap-4 items-end">
                <div className="w-full">
                  <label className="text-xs text-gray-500 mb-1 block">Phone Number (For Delivery & OTP)</label>
                  <div className="flex border rounded-md overflow-hidden focus-within:border-rose-800">
                    <span className="bg-gray-50 px-3 py-3 text-sm md:text-base text-gray-500 border-r">+91</span>
                    <input disabled={otpVerified || otpSent} required type="tel" maxLength={10} name="phone" onChange={handleChange} className="w-full px-3 py-3 text-sm md:text-base outline-none" />
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
                  <div className="flex items-center justify-center text-green-600 font-medium px-4 py-3 bg-green-50 rounded-md border border-green-200 w-full sm:w-auto text-sm">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Verified
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-base md:text-lg font-medium text-gray-900 mb-4">Shipping Address</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="md:col-span-2 relative">
                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input required type="text" name="landmark" placeholder="Search Landmark (or enter manually)" onChange={handleChange} className="w-full pl-9 p-3 text-sm md:text-base border rounded-md outline-none focus:border-rose-800 bg-white" />
              </div>

              <input required type="text" name="address" placeholder="Flat, House no., Apartment, Building" onChange={handleChange} className="md:col-span-2 w-full p-3 text-sm md:text-base border rounded-md outline-none focus:border-rose-800 bg-white" />
              
              <select required name="state" value={selectedStateCode} onChange={handleStateChange} className="w-full p-3 text-sm md:text-base border rounded-md outline-none focus:border-rose-800 bg-white">
                <option value="">Select State</option>
                {indianStates.map((state) => (
                  <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                ))}
              </select>

              <select required name="city" value={formData.city} onChange={handleCityChange} disabled={!selectedStateCode} className="w-full p-3 text-sm md:text-base border rounded-md outline-none focus:border-rose-800 bg-white disabled:bg-gray-100">
                <option value="">Select City</option>
                {availableCities.map((city) => (
                  <option key={city.name} value={city.name}>{city.name}</option>
                ))}
              </select>

              <input required type="text" name="district" placeholder="District" onChange={handleChange} className="w-full p-3 text-sm md:text-base border rounded-md outline-none focus:border-rose-800 bg-white" />
              <input required type="text" maxLength={6} name="pincode" placeholder="Pincode" onChange={handleChange} className="w-full p-3 text-sm md:text-base border rounded-md outline-none focus:border-rose-800 bg-white" />
            </div>
          </div>

          <button disabled={isProcessingPayment} type="submit" className="w-full bg-rose-900 text-white py-4 rounded-xl font-medium tracking-wide hover:bg-rose-800 transition shadow-md flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50">
            <CreditCard className="w-5 h-5" />
            {isProcessingPayment ? "PROCESSING..." : `PAY NOW (₹${cartTotal.toLocaleString('en-IN')})`}
          </button>
        </form>
      </div>

      {/* Mini Cart Summary Card */}
      <div className="w-full lg:w-1/3 order-1 lg:order-2">
        <div className="bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-100 sticky top-24 shadow-sm">
          <h2 className="text-lg font-serif text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-4 mb-6 max-h-[250px] lg:max-h-[400px] overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <img src={item.image} alt={item.name} className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-md" />
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