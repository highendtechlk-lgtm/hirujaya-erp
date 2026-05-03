import React from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';
interface TopBarProps {
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
}
export function TopBar({ user }: TopBarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20} />
          
          <input
            type="text"
            placeholder="Search quotations, customers or serial numbers..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-md focus:ring-2 focus:ring-brand-green focus:bg-white transition-all outline-none" />
          
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-gray-500">
          <button className="hover:text-brand-navy transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="hover:text-brand-navy transition-colors">
            <HelpCircle size={20} />
          </button>
        </div>

        <div className="h-8 w-px bg-gray-200"></div>

        <div className="flex items-center gap-3 cursor-pointer">
          <div className="text-right">
            <div className="text-sm font-bold text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-500">{user.role}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold overflow-hidden">
            {user.avatar ?
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover" /> :


            user.name.charAt(0)
            }
          </div>
        </div>
      </div>
    </header>);

}