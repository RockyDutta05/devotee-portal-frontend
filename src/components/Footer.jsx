import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} ISKCON Devotee Career Portal. All rights reserved.
        </p>
        <div className="flex gap-6">
          <a href="#" className="text-sm text-gray-500 hover:text-orange-600">Terms</a>
          <a href="#" className="text-sm text-gray-500 hover:text-orange-600">Privacy Policy</a>
          <a href="#" className="text-sm text-gray-500 hover:text-orange-600">Contact Us</a>
        </div>
      </div>
    </footer>
  );
}
