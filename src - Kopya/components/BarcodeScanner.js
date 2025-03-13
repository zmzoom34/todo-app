import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '../components/ui/button';
import { Play, StopCircle, RefreshCw } from 'lucide-react';

const BarcodeScanner = ({ onScanSuccess, onScanError }) => {
  const html5QrCodeRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [isLoadingCameras, setIsLoadingCameras] = useState(false);

  const formatsToSupport = [
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.CODE_39,
  ];

  const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    formatsToSupport: formatsToSupport,
    disableFlip: false,
    showTorchButtonIfSupported: true,
    showZoomSliderIfSupported: true,
  };

  useEffect(() => {
    fetchCameras();
    return () => {
      stopScanning();
    };
  }, []);

  // Arka kamerayı bulmak için bir yardımcı fonksiyon
  const findBackCamera = (devices) => {
    // Genellikle arka kamera "back" veya "rear" kelimelerini içerir
    const backCamera = devices.find((device) =>
      device.label.toLowerCase().includes('back') || 
      device.label.toLowerCase().includes('rear')
    );
    return backCamera || devices[0]; // Arka kamera yoksa ilk kamerayı seç
  };

  const fetchCameras = async () => {
    setIsLoadingCameras(true);
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        setCameras(devices);
        const defaultCamera = findBackCamera(devices); // Arka kamerayı bul
        setSelectedCamera(defaultCamera.id); // Varsayılan olarak arka kamerayı seç
      } else {
        console.log('No cameras found.');
      }
    } catch (error) {
      console.error('Error getting cameras', error);
      onScanError(error);
    } finally {
      setIsLoadingCameras(false);
    }
  };

  const startScanning = async () => {
    if (!selectedCamera) {
      onScanError(new Error('No camera selected'));
      return;
    }

    try {
      stopScanning();

      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        selectedCamera,
        config,
        (decodedText, decodedResult) => {
          onScanSuccess(decodedText, decodedResult);
        },
        (errorMessage) => {
          console.log(errorMessage);
        }
      );

      setIsScanning(true);
    } catch (error) {
      console.error('Error starting scanner', error);
      onScanError(error);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (error) {
        console.error('Failed to stop scanning', error);
      }
    }
    setIsScanning(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 items-center">
        <div className="w-full sm:w-2/3">
          <label htmlFor="camera-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Camera
          </label>
          <select
            id="camera-select"
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-700"
            disabled={isScanning || isLoadingCameras}
          >
            <option value="" disabled>
              {isLoadingCameras ? 'Loading cameras...' : 'Select a camera'}
            </option>
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={fetchCameras}
            variant="outline"
            type="button"
            className="p-2 border rounded-md flex items-center justify-center"
            disabled={isScanning || isLoadingCameras}
            title="Refresh camera list"
          >
            <RefreshCw size={18} className={isLoadingCameras ? "animate-spin" : ""} />
          </Button>
          {isScanning ? (
            <Button 
              onClick={stopScanning} 
              variant="destructive" 
              type="button"
              className="w-32 p-2 bg-red-500 text-white rounded-md flex items-center justify-center"
            >
              <StopCircle size={18} className="mr-2" /> Stop
            </Button>
          ) : (
            <Button 
              onClick={startScanning} 
              disabled={!selectedCamera} 
              type="button"
              className="w-32 p-2 bg-blue-500 text-white rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={18} className="mr-2" /> Start
            </Button>
          )}
        </div>
      </div>

      <div
        id="qr-reader"
        className="w-full bg-gray-100 border rounded-lg overflow-hidden"
      ></div>

      <div className="text-xs text-gray-500 mt-2">
        Supported formats: QR Code, Code 128, EAN-13, UPC-A, Code 39
      </div>
    </div>
  );
};

export default BarcodeScanner;