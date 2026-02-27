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
  Radio,
  Check,
  Globe,
  Lock,
  Users,
} from 'lucide-react';
import { users } from '@/data/sampleData';

export default function CreateChannel() {
  const { setActiveView } = useAppStore();
  const [step, setStep] = useState(1);
  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [channelLink, setChannelLink] = useState('');
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);

  const toggleAdmin = (userId: string) => {
    setSelectedAdmins((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = () => {
    // In a real app, you would create the channel here
    setActiveView('channels');
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0f23]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-[#1a1a2e] border-b border-white/10">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => step === 1 ? setActiveView('chats') : setStep(step - 1)}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">ایجاد کانال</h2>
          <p className="text-xs text-gray-400">
            {step === 1 && 'مرحله ۱: اطلاعات کانال'}
            {step === 2 && 'مرحله ۲: نوع کانال'}
            {step === 3 && 'مرحله ۳: انتخاب ادمین‌ها'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {step === 1 ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 space-y-6"
          >
            {/* Channel Avatar */}
            <div className="flex flex-col items-center py-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Radio className="w-10 h-10 text-white" />
                </div>
                <button className="absolute bottom-0 left-0 w-8 h-8 rounded-full bg-[#0088cc] flex items-center justify-center shadow-lg">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-3">افزودن عکس کانال</p>
            </div>

            {/* Channel Name */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 block">نام کانال</label>
              <Input
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="نام کانال را وارد کنید..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#0088cc]"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 block">توضیحات (اختیاری)</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="توضیحات کانال..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#0088cc]"
              />
            </div>

            {/* Continue Button */}
            <Button
              onClick={() => setStep(2)}
              disabled={!channelName.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              ادامه
            </Button>
          </motion.div>
        ) : step === 2 ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-4 space-y-4"
          >
            <p className="text-gray-300 text-sm mb-4">
              شما می‌توانید یک لینک عمومی برای کانال خود ایجاد کنید تا دیگران بتوانند آن را پیدا کنند.
            </p>

            {/* Public Channel */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              onClick={() => setIsPublic(true)}
              className={cn(
                'w-full flex items-start gap-4 p-4 rounded-xl transition-colors',
                isPublic ? 'bg-[#0088cc]/20 border border-[#0088cc]' : 'bg-white/5 hover:bg-white/10'
              )}
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-white font-medium">کانال عمومی</p>
                <p className="text-gray-400 text-xs mt-1">
                  همه می‌توانند کانال را پیدا کرده و عضو شوند
                </p>
              </div>
              <div
                className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  isPublic ? 'bg-[#0088cc] border-[#0088cc]' : 'border-gray-500'
                )}
              >
                {isPublic && <Check className="w-4 h-4 text-white" />}
              </div>
            </motion.button>

            {/* Private Channel */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              onClick={() => setIsPublic(false)}
              className={cn(
                'w-full flex items-start gap-4 p-4 rounded-xl transition-colors',
                !isPublic ? 'bg-[#0088cc]/20 border border-[#0088cc]' : 'bg-white/5 hover:bg-white/10'
              )}
            >
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-white font-medium">کانال خصوصی</p>
                <p className="text-gray-400 text-xs mt-1">
                  فقط با لینک دعوت می‌توان عضو شد
                </p>
              </div>
              <div
                className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                  !isPublic ? 'bg-[#0088cc] border-[#0088cc]' : 'border-gray-500'
                )}
              >
                {!isPublic && <Check className="w-4 h-4 text-white" />}
              </div>
            </motion.button>

            {/* Channel Link */}
            {isPublic && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <label className="text-xs text-gray-400 block">لینک کانال</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">t.me/</span>
                  <Input
                    value={channelLink}
                    onChange={(e) => setChannelLink(e.target.value)}
                    placeholder="نام_کانال"
                    className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#0088cc]"
                  />
                </div>
              </motion.div>
            )}

            {/* Continue Button */}
            <Button
              onClick={() => setStep(3)}
              disabled={isPublic && !channelLink.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30 transition-all mt-4"
            >
              ادامه
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col h-full"
          >
            {/* Info */}
            <div className="p-4 border-b border-white/10">
              <p className="text-gray-300 text-sm">
                ادمین‌ها می‌توانند در کانال پیام ارسال کنند. می‌توانید بعداً ادمین‌های بیشتری اضافه کنید.
              </p>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto">
              {users.map((user) => (
                <motion.div
                  key={user.id}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  onClick={() => toggleAdmin(user.id)}
                  className="flex items-center gap-3 p-3 cursor-pointer"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-gray-400 text-xs">
                      {user.status === 'online' ? 'آنلاین' : 'آفلاین'}
                    </p>
                  </div>
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                      selectedAdmins.includes(user.id)
                        ? 'bg-[#0088cc] border-[#0088cc]'
                        : 'border-gray-500'
                    )}
                  >
                    {selectedAdmins.includes(user.id) && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Create Button */}
            <div className="p-4 border-t border-white/10">
              <Button
                onClick={handleCreate}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
              >
                <Radio className="w-4 h-4 ml-2" />
                ایجاد کانال
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
