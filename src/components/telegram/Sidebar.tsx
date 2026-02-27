'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { ViewType } from '@/types/telegram';
import {
  MessageCircle,
  Users,
  Radio,
  User,
  Settings,
  Plus,
  Search,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const menuItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'chats', label: 'چت‌ها', icon: <MessageCircle className="w-5 h-5" /> },
  { id: 'groups', label: 'گروه‌ها', icon: <Users className="w-5 h-5" /> },
  { id: 'channels', label: 'کانال‌ها', icon: <Radio className="w-5 h-5" /> },
];

export default function Sidebar() {
  const {
    currentUser,
    activeView,
    setActiveView,
    searchQuery,
    setSearchQuery,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  } = useAppStore();

  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isMobileMenuOpen ? 0 : typeof window !== 'undefined' && window.innerWidth < 1024 ? -280 : 0,
        }}
        className={cn(
          'fixed lg:relative z-50 lg:z-auto',
          'w-[280px] h-full',
          'bg-gradient-to-b from-[#1a1a2e] to-[#16213e]',
          'border-l border-white/10',
          'flex flex-col',
          'transition-all duration-300'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0088cc] to-[#229ED9] flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              تلگرام
            </h1>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="جستجو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pr-10 pl-4 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#0088cc] transition-colors"
            />
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-2 overflow-y-auto">
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveView(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                activeView === item.id
                  ? 'bg-gradient-to-l from-[#0088cc] to-[#229ED9] text-white shadow-lg shadow-[#0088cc]/20'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              )}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}

          {/* Divider */}
          <div className="my-4 border-t border-white/10" />

          {/* Create Group/Channel */}
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveView('createGroup')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">ایجاد گروه</span>
          </motion.button>

          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveView('createChannel')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            <Radio className="w-5 h-5" />
            <span className="font-medium">ایجاد کانال</span>
          </motion.button>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-white/10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="relative">
                  <Avatar className="w-10 h-10 border-2 border-[#0088cc]">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      'absolute bottom-0 left-0 w-3 h-3 rounded-full border-2 border-[#1a1a2e]',
                      currentUser.status === 'online' ? 'bg-green-500' : 
                      currentUser.status === 'busy' ? 'bg-red-500' : 'bg-gray-500'
                    )}
                  />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-white font-medium">{currentUser.name}</p>
                  <p className="text-gray-400 text-sm">{currentUser.phone}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-[#1a1a2e] border-white/10">
              <DropdownMenuItem
                onClick={() => setActiveView('profile')}
                className="text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5"
              >
                <User className="w-4 h-4 ml-2" />
                پروفایل
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveView('settings')}
                className="text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5"
              >
                <Settings className="w-4 h-4 ml-2" />
                تنظیمات
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={toggleDarkMode}
                className="text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5"
              >
                {isDarkMode ? <Sun className="w-4 h-4 ml-2" /> : <Moon className="w-4 h-4 ml-2" />}
                {isDarkMode ? 'حالت روشن' : 'حالت تاریک'}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5">
                <Bell className="w-4 h-4 ml-2" />
                اعلان‌ها
              </DropdownMenuItem>
              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-white/5 focus:bg-white/5">
                <HelpCircle className="w-4 h-4 ml-2" />
                راهنما
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10">
                <LogOut className="w-4 h-4 ml-2" />
                خروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.aside>
    </>
  );
}
