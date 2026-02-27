'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Camera,
  Edit2,
  Check,
  X,
  Phone,
  AtSign,
  Info,
  Bell,
  Lock,
  User,
  QrCode,
} from 'lucide-react';

export default function Profile() {
  const { currentUser, setActiveView } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [username, setUsername] = useState(currentUser.username || '');

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, you would save to backend here
  };

  const handleCancel = () => {
    setName(currentUser.name);
    setBio(currentUser.bio || '');
    setUsername(currentUser.username || '');
    setIsEditing(false);
  };

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
        <h2 className="text-lg font-bold text-white">پروفایل</h2>
        <div className="mr-auto">
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-green-400 hover:bg-green-500/10"
                onClick={handleSave}
              >
                <Check className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-400 hover:bg-red-500/10"
                onClick={handleCancel}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Avatar Section */}
        <div className="flex flex-col items-center py-8 px-4">
          <div className="relative">
            <Avatar className="w-28 h-28 ring-4 ring-[#0088cc]/30">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback className="bg-[#0088cc] text-3xl">
                {currentUser.name[0]}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <button className="absolute bottom-0 left-0 w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center shadow-lg">
                <Camera className="w-5 h-5 text-white" />
              </button>
            )}
            <div
              className={cn(
                'absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#0f0f23]',
                currentUser.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
              )}
            />
          </div>

          {isEditing ? (
            <div className="w-full max-w-sm mt-6 space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">نام</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#0088cc]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">نام کاربری</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#0088cc]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">درباره من</label>
                <Input
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-white/5 border-white/10 text-white focus:border-[#0088cc]"
                />
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-xl font-bold text-white mt-4">{currentUser.name}</h3>
              <p className="text-gray-400 text-sm mt-1">{currentUser.status === 'online' ? 'آنلاین' : 'آفلاین'}</p>
            </>
          )}
        </div>

        {/* Info Cards */}
        <div className="px-4 space-y-2">
          {/* Phone */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#0088cc]/20 flex items-center justify-center">
              <Phone className="w-5 h-5 text-[#0088cc]" />
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-xs">شماره تلفن</p>
              <p className="text-white font-medium">{currentUser.phone}</p>
            </div>
          </motion.div>

          {/* Username */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <AtSign className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-xs">نام کاربری</p>
              <p className="text-white font-medium">{currentUser.username}</p>
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Info className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-gray-400 text-xs">درباره من</p>
              <p className="text-white font-medium">{currentUser.bio}</p>
            </div>
          </motion.div>

          {/* QR Code */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">کد QR</p>
              <p className="text-gray-400 text-xs">نمایش کد QR شما</p>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 mt-6 space-y-2">
          <h4 className="text-xs text-gray-500 font-medium px-2">تنظیمات سریع</h4>
          
          <motion.button
            whileHover={{ scale: 1.01 }}
            className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 text-right">
              <p className="text-white font-medium">اعلان‌ها و صداها</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 text-right">
              <p className="text-white font-medium">حریم خصوصی و امنیت</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-orange-400" />
            </div>
            <div className="flex-1 text-right">
              <p className="text-white font-medium">حساب کاربری</p>
            </div>
          </motion.button>
        </div>

        {/* Version */}
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">تلگرام وب نسخه ۱.۰.۰</p>
        </div>
      </div>
    </div>
  );
}
