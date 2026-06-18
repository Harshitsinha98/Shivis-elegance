'use client';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Barcode, CheckCircle2, Camera, RefreshCw } from 'lucide-react';

export default function BarcodeAddProduct() {
  const [barcodeNumber, setBarcodeNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  // Product Form State
  const [product, setProduct] = useState({
    name: '', price: '', category: '', image: '', description: '', stock: '10', sku: ''
  });

  // 🔴 1. Initialize Camera Scanner on Page Load
  useEffect(() => {
    if (!isScanning) return;

    const scanner = new Html5QrcodeScanner(
      "reader", 
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    function onScanSuccess(decodedText: string) {
      setBarcodeNumber(decodedText);
      setIsScanning(false);
      scanner.clear(); // Scan hote hi camera band karein
      fetchMasterProductDetails(decodedText); // Database se details fetch karein
    }

    function onScanFailure(error: any) {
      // Camera continuous scan karta hai, errors ko ignore kar sakte hain
    }

    return () => {
      scanner.clear().catch(err => console.error("Scanner clear error", err));
    };
  }, [isScanning]);

  // 🔴 2. Master Database se Barcode match karke Autofill karna
  const fetchMasterProductDetails = async (barcode: string) => {
    setLoading(true);
    try {
      // Maan lijiye aapne ek 'master_inventory' banaya hai jahan saare supplier barcodes save hain
      const docRef = doc(db, 'master_inventory', barcode);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProduct({
          name: data.name || '',
          price: data.price ? String(data.price) : '',
          category: data.category || '',
          image: data.image || '',
          description: data.description || '',
          stock: '10',
          sku: data.sku || barcode
        });
        alert('Product details autofilled successfully! 🎉');
      } else {
        // Agar naya barcode hai toh admin khud fill karega
        alert('New Barcode detected! Please fill details manually.');
        setProduct(prev => ({ ...prev, sku: barcode }));
      }
    } catch (err) {
      console.error("Error fetching master details:", err);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  // 🔴 3. Final Confirm and Upload to live products collection
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        name: product.name,
        price: Number(product.price),
        category: product.category,
        image: product.image,
        description: product.description,
        stock: Number(product.stock),
        sku: product.sku.toUpperCase(),
        barcode: barcodeNumber,
        createdAt: serverTimestamp()
      });

      alert('Product Successfully Published to Store! 🚀');
      // Reset page state
      setProduct({ name: '', price: '', category: '', image: '', description: '', stock: '10', sku: '' });
      setBarcodeNumber('');
      setIsScanning(true); // Wapas camera open karein agle product ke liye
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
          <h1 className="text-2xl font-serif text-gray-900">Barcode Smart Onboarding</h1>
          <p className="text-sm text-gray-500 mt-1">Scan a barcode to automatically pull data and fill the schema.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Sub-Column: Scanner Box */}
        <div className="md:col-span-1 space-y-4">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-1"><Camera className="w-4 h-4"/> Scanner View</label>
          
          {isScanning ? (
            <div id="reader" className="w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-inner"></div>
          ) : (
            <div className="p-4 border border-green-200 bg-green-50 rounded-xl text-center space-y-3">
              <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
              <p className="text-xs font-mono font-bold text-gray-700 bg-white border py-1 rounded px-2 break-all">Scanned: {barcodeNumber}</p>
              <button type="button" onClick={() => setIsScanning(true)} className="text-xs font-medium text-rose-900 flex items-center gap-1 mx-auto hover:underline mt-2">
                <RefreshCw className="w-3 h-3"/> Rescan Barcode
              </button>
            </div>
          )}
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
              <input required type="text" name="sku" value={product.sku} onChange={handleChange} className="w-full p-2.5 text-sm border rounded-lg focus:border-rose-900 outline-none uppercase bg-gray-50" readOnly />
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
            <button type="submit" disabled={loading || isScanning} className="w-full sm:w-auto bg-rose-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-rose-800 disabled:opacity-50 transition-all shadow-sm">
              {loading ? 'UPLOADING TO STORE...' : 'CONFIRM & PUBLISH PRODUCT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}