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
  Users,
  Check,
  Search,
  Hash,
} from 'lucide-react';
import { users } from '@/data/sampleData';

export default function CreateGroup() {
  const { setActiveView } = useAppStore();
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = () => {
    // In a real app, you would create the group here
    setActiveView('groups');
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0f23]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-[#1a1a2e] border-b border-white/10">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => step === 1 ? setActiveView('chats') : setStep(1)}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">ایجاد گروه</h2>
          <p className="text-xs text-gray-400">
            {step === 1 ? 'مرحله ۱: اطلاعات گروه' : 'مرحله ۲: انتخاب اعضا'}
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
            {/* Group Avatar */}
            <div className="flex flex-col items-center py-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0088cc] to-[#229ED9] flex items-center justify-center">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <button className="absolute bottom-0 left-0 w-8 h-8 rounded-full bg-[#0088cc] flex items-center justify-center shadow-lg">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-3">افزودن عکس گروه</p>
            </div>

            {/* Group Name */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 block">نام گروه</label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="نام گروه را وارد کنید..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#0088cc]"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 block">توضیحات (اختیاری)</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="توضیحات گروه..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#0088cc]"
              />
            </div>

            {/* Continue Button */}
            <Button
              onClick={() => setStep(2)}
              disabled={!groupName.trim()}
              className="w-full bg-gradient-to-r from-[#0088cc] to-[#229ED9] hover:shadow-lg hover:shadow-[#0088cc]/30 transition-all"
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
            {/* Search */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="جستجوی مخاطبین..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pr-10 pl-4 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#0088cc]"
                />
              </div>
            </div>

            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <div className="p-4 border-b border-white/10">
                <p className="text-xs text-gray-400 mb-2">
                  {selectedMembers.length} عضو انتخاب شده
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((userId) => {
                    const user = users.find((u) => u.id === userId);
                    if (!user) return null;
                    return (
                      <motion.div
                        key={userId}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 px-3 py-1 bg-[#0088cc]/20 rounded-full"
                      >
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-white">{user.name}</span>
                        <button
                          onClick={() => toggleMember(userId)}
                          className="text-gray-400 hover:text-white"
                        >
                          ×
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* User List */}
            <div className="flex-1 overflow-y-auto">
              {filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  onClick={() => toggleMember(user.id)}
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
                      selectedMembers.includes(user.id)
                        ? 'bg-[#0088cc] border-[#0088cc]'
                        : 'border-gray-500'
                    )}
                  >
                    {selectedMembers.includes(user.id) && (
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
                disabled={selectedMembers.length === 0}
                className="w-full bg-gradient-to-r from-[#0088cc] to-[#229ED9] hover:shadow-lg hover:shadow-[#0088cc]/30 transition-all"
              >
                ایجاد گروه ({selectedMembers.length} عضو)
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
