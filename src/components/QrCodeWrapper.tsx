
import React, { useEffect, useRef } from 'react';

interface QrCodeWrapperProps {
  value: string;
  size?: number;
}

const QrCodeWrapper: React.FC<QrCodeWrapperProps> = ({ value, size = 256 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check if the generic QRCode library is loaded
    const qrLib = (window as any).QRCode;
    
    if (qrLib && canvasRef.current) {
      // Clear previous content
      const context = canvasRef.current.getContext('2d');
      if (context) context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      // Generate new QR code
      // using node-qrcode API: QRCode.toCanvas(canvasElement, text, options, callback)
      qrLib.toCanvas(canvasRef.current, value, { width: size, margin: 1, color: { dark: '#000000', light: '#ffffff' } }, function (error: any) {
        if (error) console.error('QR Code generation failed:', error);
      });
    }
  }, [value, size]);

  if (!(window as any).QRCode) {
      return (
          <div style={{ width: size, height: size }} className="bg-slate-200 rounded-lg flex items-center justify-center">
              <p className="text-red-500 text-xs p-2 text-center">QR Library missing</p>
          </div>
      )
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-inner border inline-block">
        <canvas ref={canvasRef} />
    </div>
  );
};

export default QrCodeWrapper;
