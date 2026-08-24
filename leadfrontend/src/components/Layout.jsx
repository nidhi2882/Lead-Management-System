import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#161f33] to-[#0b1120] text-gray-100 flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Top Header Navigation */}
      <Header />

      {/* Main Page Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Bottom Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
