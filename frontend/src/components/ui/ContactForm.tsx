'use client';

import { useState } from 'react';

export default function ContactForm({ isKm }: { isKm: boolean }) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    
    const formData = new FormData(e.currentTarget);
    
    // Web3Forms configuration - Replace this key with your own from web3forms.com
    formData.append('access_key', 'YOUR_WEB3FORMS_ACCESS_KEY');
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        (e.target as HTMLFormElement).reset();
      } else {
        console.error('Error submitting form', data);
        setStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form', error);
      setStatus('error');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {status === 'success' && (
        <div className="w-full p-4 bg-green-50 text-green-600 rounded-xl border border-green-200 font-bold text-center">
          {isKm ? "សារត្រូវបានបញ្ជូនដោយជោគជ័យ! យើងនឹងទាក់ទងទៅអ្នកវិញក្នុងពេលឆាប់ៗ។" : "Message sent successfully! We'll get back to you soon."}
        </div>
      )}
      
      {status === 'error' && (
        <div className="w-full p-4 bg-red-50 text-red-600 rounded-xl border border-red-200 font-bold text-center">
          {isKm ? "មានបញ្ហាក្នុងការបញ្ជូនសារ។ សូមព្យាយាមម្តងទៀត។" : "Something went wrong. Please try again later."}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{isKm ? "ឈ្មោះរបស់អ្នក" : "First Name"}</label>
          <input type="text" name="First Name" required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E84C3D] transition-all" placeholder="John" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{isKm ? "ត្រកូលរបស់អ្នក" : "Last Name"}</label>
          <input type="text" name="Last Name" required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E84C3D] transition-all" placeholder="Doe" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{isKm ? "អ៊ីមែល" : "Email Address"}</label>
        <input type="email" name="email" required className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E84C3D] transition-all" placeholder="john@example.com" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300">{isKm ? "សាររបស់អ្នក" : "Message"}</label>
        <textarea name="message" required rows={4} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E84C3D] transition-all resize-none" placeholder={isKm ? "សរសេរសារនៅទីនេះ..." : "How can we help you?"}></textarea>
      </div>
      
      {/* Required for Web3Forms to know where to send replies to */}
      <input type="hidden" name="from_name" value="ShoppingOT Contact Form" />
      <input type="checkbox" name="botcheck" className="hidden" style={{ display: 'none' }} />

      <button 
        type="submit" 
        disabled={status === 'submitting'}
        className="w-full py-4 bg-[#E84C3D] hover:bg-red-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md"
      >
        {status === 'submitting' 
          ? (isKm ? "កំពុងផ្ញើសារ..." : "Sending Message...") 
          : (isKm ? "ផ្ញើសារ" : "Send Message")
        }
      </button>
    </form>
  );
}
