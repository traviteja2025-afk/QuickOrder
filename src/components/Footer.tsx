
import React from 'react';

const Footer: React.FC = () => {
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = "Check out this amazing store!";

  const shareOnWhatsapp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
  };

  return (
    <footer className="bg-slate-50 mt-8 border-t border-slate-200">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h5 className="font-bold text-slate-800 text-xl">QuickOrder UPI</h5>
            <p className="text-slate-600 mt-2 max-w-xs">
              The simplest way to order and pay. Fast, secure, and hassle-free.
            </p>
            <p className="text-sm text-slate-400 mt-4">
              &copy; {new Date().getFullYear()} QuickOrder Inc. All rights reserved.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end space-y-4">
            <span className="text-base font-bold text-slate-700 uppercase tracking-wider">Share & Connect</span>
            <div className="flex space-x-4">
               {/* Facebook */}
               <button 
                onClick={shareOnFacebook} 
                className="group bg-white p-4 rounded-full shadow-lg border border-slate-100 hover:bg-[#1877F2] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                aria-label="Share on Facebook"
                title="Share on Facebook"
               >
                 <svg fill="currentColor" viewBox="0 0 24 24" className="h-8 w-8 text-slate-600 group-hover:text-white transition-colors">
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.048 0-3.066.88-3.066 2.596v1.376h3.693l-.485 3.667h-3.208v7.98h-4.748Z" />
                 </svg>
               </button>

               {/* Instagram */}
               <a 
                href="https://www.instagram.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-white p-4 rounded-full shadow-lg border border-slate-100 hover:bg-[#E4405F] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                aria-label="Visit us on Instagram"
                title="Visit us on Instagram"
               >
                 <svg fill="currentColor" viewBox="0 0 24 24" className="h-8 w-8 text-slate-600 group-hover:text-white transition-colors">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.846-10.405a1.44 1.44 0 1 1 2.88 0 1.44 1.44 0 0 1-2.88 0Z" />
                 </svg>
               </a>

               {/* WhatsApp */}
               <button 
                onClick={shareOnWhatsapp} 
                className="group bg-white p-4 rounded-full shadow-lg border border-slate-100 hover:bg-[#25D366] transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                aria-label="Share on WhatsApp"
                title="Share on WhatsApp"
               >
                 <svg fill="currentColor" viewBox="0 0 24 24" className="h-8 w-8 text-slate-600 group-hover:text-white transition-colors">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                 </svg>
               </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
