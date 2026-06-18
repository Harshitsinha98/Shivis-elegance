'use client';
import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
// 🔴 Yahan humne Scanner ki jagah raw Engine import kiya hai custom UI ke liye
import { Html5Qrcode } from 'html5-qrcode';
import { Barcode, CheckCircle2, Camera, RefreshCw, XCircle } from 'lucide-react';

export default function BarcodeAddProduct() {
  const [barcodeNumber, setBarcodeNumber] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Camera States
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Product Form State
  const [product, setProduct] = useState({
    name: '', price: '', category: '', image: '', description: '', stock: '10', sku: ''
  });

  // 🔴 Clean Stop Camera Function
  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current?.clear();
        scannerRef.current = null;
      }).catch(err => console.error("Error stopping scanner:", err));
    }
    setIsScanning(false);
  };

  // 🔴 Start Custom Camera Function
  const startScanner = async () => {
    setCameraError('');
    setIsScanning(true);
    setBarcodeNumber('');

    // Wait for a tiny moment to ensure the <div id="reader"> is mounted in DOM
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        
        const config = { fps: 10, qrbox: { width: 250, height: 100 } };

        try {
          // Attempt 1: Force BACK Camera (For Mobile)
          await html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, undefined);
        } catch (err) {
          console.warn("Back camera failed, trying front/webcam...", err);
          // Attempt 2: Fallback to ANY Camera (For MacBook/Desktop)
          await html5QrCode.start({ facingMode: "user" }, config, onScanSuccess, undefined);
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setCameraError("Camera permission denied. Please allow camera access in browser settings.");
        setIsScanning(false);
      }
    }, 100);
  };

  const onScanSuccess = (decodedText: string) => {
    setBarcodeNumber(decodedText);
    stopScanner(); // Scan hote hi camera band
    fetchMasterProductDetails(decodedText);
  };

  // Component unmount hone par camera jarur band ho
  useEffect(() => {
    return () => stopScanner();
  }, []);

  // Database Autofill Logic
  const fetchMasterProductDetails = async (barcode: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'master_inventory', barcode);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProduct({
          name: data.name || '', price: data.price ? String(data.price) : '',
          category: data.category || '', image: data.image || '',
          description: data.description || '', stock: '10', sku: data.sku || barcode
        });
        alert('Product details autofilled successfully! 🎉');
      } else {
        setProduct(prev => ({ ...prev, sku: barcode }));
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        ...product,
        price: Number(product.price),
        stock: Number(product.stock),
        sku: product.sku.toUpperCase(),
        barcode: barcodeNumber,
        createdAt: serverTimestamp()
      });

      alert('Product Successfully Published to Store! 🚀');
      setProduct({ name: '', price: '', category: '', image: '', description: '', stock: '10', sku: '' });
      setBarcodeNumber('');
    } catch (error) {
      alert('Upload failed.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
        <div className="bg-rose-100 p-2.5 rounded-lg text-rose-900"><Barcode className="w-6 h-6" /></div>
        <div>
          <h1 className="text-2xl font-serif text-gray-900">Smart Barcode Scanner</h1>
          <p className="text-sm text-gray-500 mt-1">Scan physical tags to autofill product details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Sub-Column: Custom Scanner UI */}
        <div className="md:col-span-1 space-y-4">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Camera className="w-4 h-4"/> Scanner Window
          </label>
          
          {/* Default State / Scan Result State */}
          {!isScanning && (
            <div className={`p-6 border rounded-xl text-center space-y-4 ${barcodeNumber ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              {barcodeNumber ? (
                <>
                  <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
                  <p className="text-sm font-mono font-bold text-gray-800 bg-white border py-1.5 rounded break-all">{barcodeNumber}</p>
                </>
              ) : (
                <div className="py-6">
                  <Barcode className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Ready to scan product tag</p>
                </div>
              )}
              
              <button type="button" onClick={startScanner} className="w-full bg-rose-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-rose-800 transition shadow-sm flex items-center justify-center gap-2">
                {barcodeNumber ? <><RefreshCw className="w-4 h-4"/> Rescan Barcode</> : <><Camera className="w-4 h-4"/> Start Camera</>}
              </button>
            </div>
          )}

          {/* Active Camera State with Custom UI */}
          {isScanning && (
            <div className="relative overflow-hidden rounded-xl border border-rose-200 bg-black shadow-inner">
              <div id="reader" className="w-full bg-black"></div>
              {/* Overlay styling for modern look */}
              <div className="absolute inset-0 border-[3px] border-rose-900/50 rounded-xl pointer-events-none"></div>
              
              <button type="button" onClick={stopScanner} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          )}

          {cameraError && <p className="text-xs text-red-600 text-center">{cameraError}</p>}
        </div>

        {/* Right Sub-Column: Form Details */}
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Product Name</label>
              <input required type="text" name="name" value={product.name} onChange={handleChange} className="w-full p-2.5 text-sm border rounded-lg focus:border-rose-900 outline-none" placeholder="Autofilled after scan..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">SKU / Code</label>
              <input required type="text" name="sku" value={product.sku} onChange={handleChange} className="w-full p-2.5 text-sm border rounded-lg focus:border-rose-900 outline-none uppercase bg-gray-50" readOnly placeholder="Scanned SKU" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Price (₹)</label>
              <input required type="number" name="price" value={product.price} onChange={handleChange} className="w-full p-2.5 text-sm border rounded-lg focus:border-rose-900 outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select required name="category" value={product.category} onChange={handleChange} className="w-full p-2.5 text-sm border rounded-lg focus:border-rose-900 outline-none bg-white">
                <option value="">Select Category</option>
                <option value="Rings">Rings</option>
                <option value="Earrings">Earrings</option>
                <option value="Necklaces">Necklaces</option>
                <option value="Bracelets">Bracelets</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Stock Quantity</label>
              <input required type="number" name="stock" value={product.stock} onChange={handleChange} className="w-full p-2.5 text-sm border rounded-lg focus:border-rose-900 outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Image URL</label>
              <input required type="url" name="image" value={product.image} onChange={handleChange} className="w-full p-2.5 text-sm border rounded-lg focus:border-rose-900 outline-none" placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea required name="description" value={product.description} onChange={handleChange} rows={3} className="w-full p-2.5 text-sm border rounded-lg focus:border-rose-900 outline-none" placeholder="Material descriptions..."></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button type="submit" disabled={loading} className="w-full sm:w-auto bg-rose-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-rose-800 disabled:opacity-50 transition-all shadow-sm">
              {loading ? 'UPLOADING TO STORE...' : 'CONFIRM & PUBLISH PRODUCT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}