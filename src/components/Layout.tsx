import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-gray-200 font-sans">
      <Header />
      <main className="flex-1 w-full overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
