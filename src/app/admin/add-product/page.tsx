'use client';
import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { Html5Qrcode } from 'html5-qrcode';
import QRCode from 'react-qr-code'; // 🔴 Naya QR Code Generator
import { QrCode, Camera, CheckCircle2, RefreshCw, XCircle, Database, PackagePlus } from 'lucide-react';

export default function SmartInventoryPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'scan'>('generate');
  const [loading, setLoading] = useState(false);

  // --- TAB 1: GENERATE QR STATES ---
  const [masterProduct, setMasterProduct] = useState({
    name: '', price: '', category: '', image: '', description: '', sku: ''
  });
  const [generatedQR, setGeneratedQR] = useState('');

  // --- TAB 2: SCAN & PUBLISH STATES ---
  const [scannedQR, setScannedQR] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [liveProduct, setLiveProduct] = useState({
    name: '', price: '', category: '', image: '', description: '', stock: '10', sku: ''
  });

  // ==========================================
  // LOGIC: TAB 1 - GENERATE MASTER QR
  // ==========================================
  const handleMasterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setMasterProduct({ ...masterProduct, [e.target.name]: e.target.value });
  };

  const saveMasterProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Unique Barcode ID (SKU + Random Number)
      const uniqueQR = `${masterProduct.sku.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Firebase 'master_inventory' me permanently save kar rahe hain
      await setDoc(doc(db, 'master_inventory', uniqueQR), {
        ...masterProduct,
        price: Number(masterProduct.price),
        sku: masterProduct.sku.toUpperCase(),
        qrCode: uniqueQR,
        createdAt: serverTimestamp()
      });

      setGeneratedQR(uniqueQR);
      alert('Master Template Saved! You can now print this QR Code.');
    } catch (error) {
      alert('Failed to save master product.');
      console.error(error);
    }
    setLoading(false);
  };

  // ==========================================
  // LOGIC: TAB 2 - SCAN & PUBLISH
  // ==========================================
  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current?.clear();
        scannerRef.current = null;
      }).catch(err => console.error(err));
    }
    setIsScanning(false);
  };

  const startScanner = async () => {
    setCameraError('');
    setIsScanning(true);
    setScannedQR('');

    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };

        try {
          await html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, undefined);
        } catch (err) {
          await html5QrCode.start({ facingMode: "user" }, config, onScanSuccess, undefined);
        }
      } catch (err) {
        setCameraError("Camera access denied.");
        setIsScanning(false);
      }
    }, 100);
  };

  const onScanSuccess = (decodedText: string) => {
    setScannedQR(decodedText);
    stopScanner();
    fetchMasterProductDetails(decodedText);
  };

  const fetchMasterProductDetails = async (qrText: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'master_inventory', qrText);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setLiveProduct({
          name: data.name || '', price: data.price ? String(data.price) : '',
          category: data.category || '', image: data.image || '',
          description: data.description || '', stock: '10', sku: data.sku || ''
        });
      } else {
        alert('QR Code not found in Master Inventory! Please create it first.');
        setLiveProduct(prev => ({ ...prev, sku: qrText }));
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleLiveChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setLiveProduct({ ...liveProduct, [e.target.name]: e.target.value });
  };

  const publishToLiveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        ...liveProduct,
        price: Number(liveProduct.price),
        stock: Number(liveProduct.stock),
        sku: liveProduct.sku.toUpperCase(),
        qrCode: scannedQR,
        createdAt: serverTimestamp()
      });

      alert('Successfully Added to Live Store! 🚀');
      setLiveProduct({ name: '', price: '', category: '', image: '', description: '', stock: '10', sku: '' });
      setScannedQR('');
    } catch (error) { alert('Upload failed.'); }
    setLoading(false);
  };

  // Cleanup scanner on unmount
  useEffect(() => { return () => stopScanner(); }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header & Tabs */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h1 className="text-3xl font-serif text-gray-900 mb-2">Smart Inventory Center</h1>
        <p className="text-sm text-gray-500 mb-6">Create master templates, generate QR codes, and quick-publish products.</p>
        
        <div className="flex gap-2 border-b border-gray-200">
          <button onClick={() => { setActiveTab('generate'); stopScanner(); }} className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'generate' ? 'border-rose-900 text-rose-900' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
            <Database className="w-4 h-4"/> 1. Create Master & Generate QR
          </button>
          <button onClick={() => setActiveTab('scan')} className={`px-6 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'scan' ? 'border-rose-900 text-rose-900' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
            <PackagePlus className="w-4 h-4"/> 2. Scan QR & Publish Live
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* VIEW 1: GENERATE MASTER QR */}
      {/* ========================================== */}
      {activeTab === 'generate' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col lg:flex-row gap-8">
          <form onSubmit={saveMasterProduct} className="flex-1 space-y-5">
            <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Master Product Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><input required type="text" name="name" value={masterProduct.name} onChange={handleMasterChange} placeholder="Product Name" className="w-full p-3 border rounded-lg outline-none focus:border-rose-900 text-sm" /></div>
              <div><input required type="text" name="sku" value={masterProduct.sku} onChange={handleMasterChange} placeholder="SKU (e.g. RING-01)" className="w-full p-3 border rounded-lg outline-none focus:border-rose-900 text-sm uppercase" /></div>
              <div><input required type="number" name="price" value={masterProduct.price} onChange={handleMasterChange} placeholder="Price (₹)" className="w-full p-3 border rounded-lg outline-none focus:border-rose-900 text-sm" /></div>
              <div>
                <select required name="category" value={masterProduct.category} onChange={handleMasterChange} className="w-full p-3 border rounded-lg outline-none focus:border-rose-900 text-sm">
                  <option value="">Category</option>
                  <option value="Rings">Rings</option>
                  <option value="Earrings">Earrings</option>
                  <option value="Necklaces">Necklaces</option>
                </select>
              </div>
              <div><input required type="url" name="image" value={masterProduct.image} onChange={handleMasterChange} placeholder="Image URL" className="w-full p-3 border rounded-lg outline-none focus:border-rose-900 text-sm" /></div>
              <div className="md:col-span-2"><textarea required name="description" value={masterProduct.description} onChange={handleMasterChange} placeholder="Full Description..." rows={3} className="w-full p-3 border rounded-lg outline-none focus:border-rose-900 text-sm"></textarea></div>
            </div>
            <button type="submit" disabled={loading} className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium w-full hover:bg-gray-800 transition">
              {loading ? 'SAVING...' : 'SAVE TO MASTER & GENERATE QR'}
            </button>
          </form>

          {/* QR Code Display Area */}
          <div className="w-full lg:w-1/3 bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
            {generatedQR ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 inline-block">
                  <QRCode value={generatedQR} size={180} fgColor="#881337" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">System QR Code</p>
                  <p className="text-sm font-mono text-gray-900 font-bold mt-1">{generatedQR}</p>
                </div>
                <button onClick={() => window.print()} className="text-rose-900 text-xs font-medium hover:underline mt-2 inline-block">Print Label</button>
              </div>
            ) : (
              <div className="text-gray-400">
                <QrCode className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Fill the details and save to generate a unique QR code.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* VIEW 2: SCAN & PUBLISH (LIVE STORE) */}
      {/* ========================================== */}
      {activeTab === 'scan' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-1 space-y-4">
            <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Scanner View</h2>
            {!isScanning && (
              <div className={`p-6 border rounded-xl text-center space-y-4 ${scannedQR ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                {scannedQR ? (
                  <><CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" /><p className="text-sm font-mono font-bold text-gray-800 break-all">{scannedQR}</p></>
                ) : (
                  <div className="py-6"><QrCode className="w-12 h-12 text-gray-300 mx-auto mb-2" /><p className="text-xs text-gray-500">Ready to scan Master QR</p></div>
                )}
                <button onClick={startScanner} className="w-full bg-rose-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-rose-800 transition flex items-center justify-center gap-2">
                  {scannedQR ? <><RefreshCw className="w-4 h-4"/> Rescan QR</> : <><Camera className="w-4 h-4"/> Start Scanner</>}
                </button>
              </div>
            )}

            {isScanning && (
              <div className="relative overflow-hidden rounded-xl border border-rose-200 bg-black shadow-inner">
                <div id="reader" className="w-full bg-black"></div>
                <div className="absolute inset-0 border-[3px] border-rose-900/50 rounded-xl pointer-events-none"></div>
                <button onClick={stopScanner} className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full"><XCircle className="w-5 h-5" /></button>
              </div>
            )}
            {cameraError && <p className="text-xs text-red-600 text-center">{cameraError}</p>}
          </div>

          <form onSubmit={publishToLiveStore} className="md:col-span-2 space-y-5">
             <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Live Store Details (Autofilled)</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><input required readOnly type="text" name="name" value={liveProduct.name} className="w-full p-2.5 text-sm border rounded-lg bg-gray-50 text-gray-600" placeholder="Product Name (Scan to Autofill)" /></div>
              <div><input required readOnly type="text" name="sku" value={liveProduct.sku} className="w-full p-2.5 text-sm border rounded-lg bg-gray-50 text-gray-600" placeholder="SKU" /></div>
              <div><input required type="number" name="price" value={liveProduct.price} onChange={handleLiveChange} className="w-full p-2.5 text-sm border rounded-lg focus:border-rose-900 outline-none" placeholder="Price (₹)" /></div>
              <div><input required type="number" name="stock" value={liveProduct.stock} onChange={handleLiveChange} className="w-full p-2.5 text-sm border rounded-lg focus:border-rose-900 outline-none" placeholder="Stock Qty" /></div>
            </div>
            <button type="submit" disabled={loading || !scannedQR} className="w-full bg-green-700 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-all shadow-sm">
              {loading ? 'PUBLISHING...' : 'CONFIRM & PUBLISH TO LIVE STORE'}
            </button>
            {!scannedQR && <p className="text-xs text-gray-400 text-center mt-2">Scan a Master QR code first to enable publishing.</p>}
          </form>

        </div>
      )}
    </div>
  );
}