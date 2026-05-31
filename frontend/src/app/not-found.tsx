'use client';

export default function NotFound() {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">404 - Not Found</h1>
            <p className="mt-2 text-gray-600">The requested page or store could not be found.</p>
            <a href="/" className="mt-4 inline-block px-4 py-2 bg-red-500 text-white rounded-md">Go Home</a>
          </div>
        </div>
      </body>
    </html>
  );
}
