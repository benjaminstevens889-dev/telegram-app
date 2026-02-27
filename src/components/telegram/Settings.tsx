'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Bell,
  Lock,
  Palette,
  Database,
  Globe,
  HelpCircle,
  Info,
  LogOut,
  Moon,
  Sun,
  Volume2,
  MessageCircle,
  User,
  Shield,
  Smartphone,
  ChevronLeft,
} from 'lucide-react';

interface SettingsItemProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description?: string;
  onClick?: () => void;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}

const SettingsItem = ({
  icon,
  iconBg,
  title,
  description,
  onClick,
  hasSwitch,
  switchValue,
  onSwitchChange,
}: SettingsItemProps) => (
  <motion.button
    whileHover={{ scale: 1.01 }}
    onClick={onClick}
    className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
  >
    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', iconBg)}>
      {icon}
    </div>
    <div className="flex-1 text-right">
      <p className="text-white font-medium">{title}</p>
      {description && <p className="text-gray-400 text-xs mt-0.5">{description}</p>}
    </div>
    {hasSwitch ? (
      <Switch checked={switchValue} onCheckedChange={onSwitchChange} />
    ) : (
      <ChevronLeft className="w-5 h-5 text-gray-400" />
    )}
  </motion.button>
);

export default function Settings() {
  const { currentUser, setActiveView } = useAppStore();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [messagePreview, setMessagePreview] = useState(true);

  return (
    <div className="h-full flex flex-col bg-[#0f0f23]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-[#1a1a2e] border-b border-white/10">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => setActiveView('chats')}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-bold text-white">تنظیمات</h2>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
        {/* User Profile Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={() => setActiveView('profile')}
          className="flex items-center gap-4 p-4 bg-gradient-to-l from-[#0088cc]/20 to-transparent rounded-xl cursor-pointer"
        >
          <Avatar className="w-14 h-14 ring-2 ring-[#0088cc]/50">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback className="bg-[#0088cc]">{currentUser.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-white font-semibold text-lg">{currentUser.name}</p>
            <p className="text-gray-400 text-sm">{currentUser.phone}</p>
          </div>
          <ChevronLeft className="w-5 h-5 text-gray-400" />
        </motion.div>

        {/* Notifications Section */}
        <div className="space-y-2">
          <h4 className="text-xs text-gray-500 font-medium px-2">اعلان‌ها</h4>
          <SettingsItem
            icon={<Bell className="w-5 h-5 text-blue-400" />}
            iconBg="bg-blue-500/20"
            title="اعلان‌های دسکتاپ"
            description="دریافت اعلان برای پیام‌های جدید"
            hasSwitch
            switchValue={notifications}
            onSwitchChange={setNotifications}
          />
          <SettingsItem
            icon={<Volume2 className="w-5 h-5 text-green-400" />}
            iconBg="bg-green-500/20"
            title="صداها"
            description="پخش صدا برای پیام‌ها و تماس‌ها"
            hasSwitch
            switchValue={sounds}
            onSwitchChange={setSounds}
          />
          <SettingsItem
            icon={<MessageCircle className="w-5 h-5 text-purple-400" />}
            iconBg="bg-purple-500/20"
            title="پیش‌نمایش پیام"
            description="نمایش متن پیام در اعلان"
            hasSwitch
            switchValue={messagePreview}
            onSwitchChange={setMessagePreview}
          />
        </div>

        {/* Privacy Section */}
        <div className="space-y-2">
          <h4 className="text-xs text-gray-500 font-medium px-2">حریم خصوصی</h4>
          <SettingsItem
            icon={<Lock className="w-5 h-5 text-red-400" />}
            iconBg="bg-red-500/20"
            title="حریم خصوصی و امنیت"
            description="آخرین بازدید، حساب‌های مسدود شده"
          />
          <SettingsItem
            icon={<Shield className="w-5 h-5 text-orange-400" />}
            iconBg="bg-orange-500/20"
            title="تایید دو مرحله‌ای"
            description="افزودن لایه امنیتی اضافی"
          />
        </div>

        {/* Appearance Section */}
        <div className="space-y-2">
          <h4 className="text-xs text-gray-500 font-medium px-2">ظاهر برنامه</h4>
          <SettingsItem
            icon={darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            iconBg={darkMode ? 'bg-indigo-500/20' : 'bg-yellow-500/20'}
            title="حالت تاریک"
            hasSwitch
            switchValue={darkMode}
            onSwitchChange={setDarkMode}
          />
          <SettingsItem
            icon={<Palette className="w-5 h-5 text-pink-400" />}
            iconBg="bg-pink-500/20"
            title="رنگ چت"
            description="شخصی‌سازی رنگ پیام‌ها"
          />
        </div>

        {/* Data Section */}
        <div className="space-y-2">
          <h4 className="text-xs text-gray-500 font-medium px-2">داده و ذخیره‌سازی</h4>
          <SettingsItem
            icon={<Database className="w-5 h-5 text-cyan-400" />}
            iconBg="bg-cyan-500/20"
            title="استفاده از داده"
            description="مدیریت مصرف اینترنت"
          />
          <SettingsItem
            icon={<Smartphone className="w-5 h-5 text-teal-400" />}
            iconBg="bg-teal-500/20"
            title="دستگاه‌های متصل"
            description="مدیریت جلسات فعال"
          />
        </div>

        {/* Language Section */}
        <div className="space-y-2">
          <h4 className="text-xs text-gray-500 font-medium px-2">زبان</h4>
          <SettingsItem
            icon={<Globe className="w-5 h-5 text-emerald-400" />}
            iconBg="bg-emerald-500/20"
            title="زبان برنامه"
            description="فارسی"
          />
        </div>

        {/* Help Section */}
        <div className="space-y-2">
          <h4 className="text-xs text-gray-500 font-medium px-2">راهنما</h4>
          <SettingsItem
            icon={<HelpCircle className="w-5 h-5 text-amber-400" />}
            iconBg="bg-amber-500/20"
            title="سوالات متداول"
            description="پاسخ به سوالات رایج"
          />
          <SettingsItem
            icon={<Info className="w-5 h-5 text-gray-400" />}
            iconBg="bg-gray-500/20"
            title="درباره تلگرام"
            description="نسخه ۱.۰.۰"
          />
        </div>

        {/* Logout Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/10 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">خروج از حساب</span>
        </motion.button>

        {/* Version */}
        <div className="text-center py-4">
          <p className="text-gray-500 text-xs">تلگرام وب</p>
          <p className="text-gray-600 text-xs">نسخه ۱.۰.۰</p>
        </div>
      </div>
    </div>
  );
}
