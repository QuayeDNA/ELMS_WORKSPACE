import React from 'react';
import { QRCodeComponents } from '@/components/qr-code/QRCodeComponents';

export default function QRCodeManagementPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">QR Code Management</h1>
        <p className="text-gray-600">Generate and manage QR codes for exam logistics</p>
      </div>
      <QRCodeComponents />
    </div>
  );
}
