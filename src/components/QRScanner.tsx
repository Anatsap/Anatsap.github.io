import React, { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError: (error: string) => void;
  isScanning: boolean;
}

export function QRScanner({ onScan, onError, isScanning }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [codeReader] = useState(() => new BrowserMultiFormatReader());

  useEffect(() => {
    if (!isScanning || !videoRef.current) return;

    let isActive = true;

    const startScanning = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        if (videoRef.current && isActive) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();

          // Start decoding
          const scanLoop = async () => {
            if (!isActive || !videoRef.current) return;

            try {
              const result = await codeReader.decodeOnceFromVideoDevice(undefined, videoRef.current);
              if (result && isActive) {
                onScan(result.getText());
                // Stop the stream
                stream.getTracks().forEach(track => track.stop());
                return;
              }
            } catch (err) {
              // Continue scanning - this is normal when no QR code is detected
            }

            // Continue scanning
            if (isActive) {
              setTimeout(scanLoop, 300);
            }
          };

          scanLoop();
        }
      } catch (err) {
        console.error('Camera access error:', err);
        onError('Camera access denied or not available. You can enter the code manually.');
      }
    };

    startScanning();

    return () => {
      isActive = false;
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScanning, codeReader, onScan, onError]);

  if (!isScanning) return null;

  return (
    <div className="mt-3">
      <div className="border rounded overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="w-full h-48 object-cover"
          playsInline
          muted
        />
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Allow camera access. Point camera at the machine's QR code.
      </div>
    </div>
  );
}
