import React from 'react';
import { Clock, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PendingApproval() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="bg-orange-50 p-6 rounded-full mb-8">
        <Clock className="h-16 w-16 text-orange-500" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Account Pending Approval</h2>
      <p className="max-w-md text-gray-600 text-lg mb-8 leading-relaxed">
        Thank you for registering! Your account is currently under review by an administrator.
        We will verify your connection details to ensure the safety and authenticity of our community.
      </p>
      <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-lg shadow-sm flex gap-4 text-left">
        <ShieldAlert className="h-8 w-8 text-blue-500 shrink-0" />
        <div>
          <h4 className="font-semibold text-gray-900">What happens next?</h4>
          <p className="text-gray-600 text-sm mt-1">
            An admin may reach out to the counselor or mentor you listed. 
            Once verified, you'll receive an email notification that you can log in.
          </p>
        </div>
      </div>
      
      <Link to="/" className="mt-8 text-orange-600 font-semibold hover:underline">
        &larr; Back to Home
      </Link>
    </div>
  );
}
