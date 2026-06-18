'use client';
import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { Html5Qrcode } from 'html5-qrcode';
import QRCode from 'react-qr-code'; 
import { QrCode, Camera, CheckCircle2, RefreshCw, XCircle, Database, PackagePlus } from 'lucide-react';

export default function SmartInventoryPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'scan'>('generate');
  const [loading, setLoading] = useState(false);

  // --- UPGRADED MASTER TEMPLATE STATE ---
  const [masterProduct, setMasterProduct] = useState({
    name: '', sku: '', price: '', category: '', 
    image1: '', image2: '', // 🔴 2 Images for hover effect
    description: '', material: '', displaySection: 'Standard' // 🔴 New Fields
  });
  const [generatedQR, setGeneratedQR] = useState('');

  // --- SCAN & PUBLISH STATE ---
  const [scannedQR, setScannedQR] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  
  const [liveProduct, setLiveProduct] = useState({
    name: '', sku: '', price: '', category: '', 
    image1: '', image2: '', description: '', material: '', displaySection: 'Standard', stock: '10'
  });

  const handleMasterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setMasterProduct({ ...masterProduct, [e.target.name]: e.target.value });
  };

  const saveMasterProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const uniqueQR = `${masterProduct.sku.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Save arrays instead of single strings for images
      await setDoc(doc(db, 'master_inventory', uniqueQR), {
        name: masterProduct.name,
        sku: masterProduct.sku.toUpperCase(),
        price: Number(masterProduct.price),
        category: masterProduct.category,
        images: [masterProduct.image1, masterProduct.image2].filter(Boolean), // Array for Hover
        description: masterProduct.description,
        material: masterProduct.material,
        displaySection: masterProduct.displaySection, // Homepage Placement
        qrCode: uniqueQR,
        createdAt: serverTimestamp()
      });

      setGeneratedQR(uniqueQR);
      alert('Master Template Saved! Print this QR Code.');
    } catch (error) { alert('Failed to save.'); }
    setLoading(false);
  };

  // --- SCANNER LOGIC ---
  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current?.clear(); scannerRef.current = null;
      }).catch(err => console.error(err));
    }
    setIsScanning(false);
  };

  const startScanner = async () => {
    setIsScanning(true); setScannedQR('');
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        try { await html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, undefined); } 
        catch { await html5QrCode.start({ facingMode: "user" }, config, onScanSuccess, undefined); }
      } catch (err) { setIsScanning(false); }
    }, 100);
  };

  const onScanSuccess = (decodedText: string) => {
    setScannedQR(decodedText); stopScanner(); fetchMasterProductDetails(decodedText);
  };

  const fetchMasterProductDetails = async (qrText: string) => {
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, 'master_inventory', qrText));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setLiveProduct({
          name: data.name || '', sku: data.sku || qrText, price: data.price ? String(data.price) : '',
          category: data.category || '', 
          image1: data.images?.[0] || '', image2: data.images?.[1] || '',
          description: data.description || '', material: data.material || '', 
          displaySection: data.displaySection || 'Standard', stock: '10'
        });
      } else { alert('QR Code not found!'); }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const publishToLiveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        name: liveProduct.name,
        sku: liveProduct.sku.toUpperCase(),
        price: Number(liveProduct.price),
        category: liveProduct.category,
        images: [liveProduct.image1, liveProduct.image2].filter(Boolean),
        description: liveProduct.description,
        material: liveProduct.material,
        displaySection: liveProduct.displaySection,
        stock: Number(liveProduct.stock),
        qrCode: scannedQR,
        createdAt: serverTimestamp()
      });

      alert('Successfully Added to Live Store! 🚀');
      setLiveProduct({ name: '', sku: '', price: '', category: '', image1: '', image2: '', description: '', material: '', displaySection: 'Standard', stock: '10' });
      setScannedQR('');
    } catch (error) { alert('Upload failed.'); }
    setLoading(false);
  };

  useEffect(() => { return () => stopScanner(); }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h1 className="text-3xl font-serif text-gray-900 mb-2">Smart Inventory & Onboarding</h1>
        <div className="flex gap-2 border-b border-gray-200 mt-6">
          <button onClick={() => { setActiveTab('generate'); stopScanner(); }} className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'generate' ? 'border-rose-900 text-rose-900' : 'border-transparent text-gray-500'}`}><Database className="w-4 h-4"/> 1. Create Master QR</button>
          <button onClick={() => setActiveTab('scan')} className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'scan' ? 'border-rose-900 text-rose-900' : 'border-transparent text-gray-500'}`}><PackagePlus className="w-4 h-4"/> 2. Scan & Publish Live</button>
        </div>
      </div>

      {activeTab === 'generate' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col lg:flex-row gap-8">
          <form onSubmit={saveMasterProduct} className="flex-1 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><input required type="text" name="name" value={masterProduct.name} onChange={handleMasterChange} placeholder="Product Name" className="w-full p-3 border rounded-lg text-sm" /></div>
              <div><input required type="text" name="sku" value={masterProduct.sku} onChange={handleMasterChange} placeholder="SKU" className="w-full p-3 border rounded-lg text-sm uppercase" /></div>
              <div><input required type="number" name="price" value={masterProduct.price} onChange={handleMasterChange} placeholder="Price (₹)" className="w-full p-3 border rounded-lg text-sm" /></div>
              
              {/* 🔴 NEW: Homepage Placement Dropdown */}
              <div>
                <select required name="displaySection" value={masterProduct.displaySection} onChange={handleMasterChange} className="w-full p-3 border rounded-lg text-sm bg-rose-50 text-rose-900 font-medium">
                  <option value="Standard">Standard (Shop Page Only)</option>
                  <option value="Best Selling">Homepage: Best Selling</option>
                  <option value="Featured">Homepage: Featured</option>
                </select>
              </div>

              <div>
                <select required name="category" value={masterProduct.category} onChange={handleMasterChange} className="w-full p-3 border rounded-lg text-sm">
                  <option value="">Category</option>
                  <option value="Rings">Rings</option>
                  <option value="Earrings">Earrings</option>
                  <option value="Necklaces">Necklaces</option>
                  <option value="Bracelets">Bracelets</option>
                </select>
              </div>
              
              {/* 🔴 NEW: Multiple Images */}
              <div><input required type="url" name="image1" value={masterProduct.image1} onChange={handleMasterChange} placeholder="Primary Image URL" className="w-full p-3 border rounded-lg text-sm" /></div>
              <div><input type="url" name="image2" value={masterProduct.image2} onChange={handleMasterChange} placeholder="Hover/Secondary Image URL" className="w-full p-3 border rounded-lg text-sm" /></div>
              
              <div className="md:col-span-2"><input type="text" name="material" value={masterProduct.material} onChange={handleMasterChange} placeholder="Material Details (e.g., 18K Rose Gold, VVS Diamonds)" className="w-full p-3 border rounded-lg text-sm" /></div>
              <div className="md:col-span-2"><textarea required name="description" value={masterProduct.description} onChange={handleMasterChange} placeholder="Full Description..." rows={3} className="w-full p-3 border rounded-lg text-sm"></textarea></div>
            </div>
            <button type="submit" disabled={loading} className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium w-full">SAVE TO MASTER & GENERATE QR</button>
          </form>

          <div className="w-full lg:w-1/3 bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
            {generatedQR ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border inline-block"><QRCode value={generatedQR} size={180} fgColor="#881337" /></div>
                <div><p className="text-xs text-gray-500 uppercase">System QR</p><p className="text-sm font-mono text-gray-900 font-bold mt-1">{generatedQR}</p></div>
              </div>
            ) : (<div className="text-gray-400"><QrCode className="w-16 h-16 mx-auto mb-3 opacity-50" /><p className="text-sm">Save details to generate QR.</p></div>)}
          </div>
        </div>
      )}

      {activeTab === 'scan' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-4">
            {!isScanning && (
              <div className="p-6 border rounded-xl text-center">
                {scannedQR ? <><CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" /><p className="text-sm font-mono mt-2">{scannedQR}</p></> : <QrCode className="w-12 h-12 text-gray-300 mx-auto" />}
                <button onClick={startScanner} className="w-full mt-4 bg-rose-900 text-white py-2.5 rounded-lg text-sm">Start Scanner</button>
              </div>
            )}
            {isScanning && (
              <div className="relative rounded-xl overflow-hidden bg-black"><div id="reader" className="w-full"></div><button onClick={stopScanner} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full"><XCircle className="w-5 h-5" /></button></div>
            )}
          </div>

          <form onSubmit={publishToLiveStore} className="md:col-span-2 space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><input required readOnly type="text" value={liveProduct.name} className="w-full p-2.5 text-sm border rounded-lg bg-gray-50" placeholder="Product Name (Scan to Autofill)" /></div>
              <div><input required readOnly type="text" value={liveProduct.sku} className="w-full p-2.5 text-sm border rounded-lg bg-gray-50" placeholder="SKU" /></div>
              <div><input required type="number" name="stock" value={liveProduct.stock} onChange={(e)=>setLiveProduct({...liveProduct, stock: e.target.value})} className="w-full p-2.5 text-sm border rounded-lg" placeholder="Stock Qty" /></div>
              <div className="sm:col-span-2 text-xs text-gray-500 bg-blue-50 p-3 rounded border border-blue-100">
                Placement: <strong>{liveProduct.displaySection}</strong> | Material: <strong>{liveProduct.material || 'N/A'}</strong>
              </div>
            </div>
            <button type="submit" disabled={loading || !scannedQR} className="w-full bg-green-700 text-white px-6 py-3 rounded-lg text-sm font-medium">CONFIRM & PUBLISH TO LIVE STORE</button>
          </form>
        </div>
      )}
    </div>
  );
}