'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
// Real-time chat application
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, User, Chat, Message, ChatRequest, Group } from '@/store/useAppStore';
import { useSocket } from '@/hooks/useSocket';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { DeleteAnimation } from '@/components/ui/DeleteAnimation';
import { 
  Send, 
  Search, 
  Video,
  MoreVertical, 
  LogOut, 
  Check, 
  CheckCheck,
  UserPlus,
  X,
  Menu,
  ArrowLeft,
  Settings,
  User as UserIcon,
  Trash2,
  UserX,
  Mic,
  File,
  Image as ImageIcon,
  Play,
  Pause,
  Camera,
  StopCircle,
  RotateCcw,
  Users,
  Clock,
  Reply
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';

// ==================== Password Input with Eye Toggle ====================
function PasswordInput({
  value,
  onChange,
  placeholder
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pl-10"
        required
        autoComplete="current-password"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-all"
      >
        <div className="relative w-5 h-5">
          {/* Eye */}
          <svg 
            viewBox="0 0 24 24" 
            className="w-5 h-5 text-white/70 transition-all"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
          
          {/* Fog/Steam effect when password is hidden */}
          <div 
            className={`absolute inset-0 transition-all duration-300 ${
              !showPassword ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white">
              {/* Steam clouds */}
              <ellipse cx="7" cy="12" rx="3" ry="2" fill="currentColor" className="animate-pulse" opacity="0.8" />
              <ellipse cx="12" cy="10" rx="4" ry="2.5" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.1s' }} opacity="0.9" />
              <ellipse cx="17" cy="12" rx="3" ry="2" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.2s' }} opacity="0.8" />
              {/* Small steam particles */}
              <circle cx="6" cy="9" r="1" fill="currentColor" className="animate-ping" />
              <circle cx="18" cy="9" r="1" fill="currentColor" className="animate-ping" style={{ animationDelay: '0.3s' }} />
              <circle cx="12" cy="7" r="1.2" fill="currentColor" className="animate-ping" style={{ animationDelay: '0.15s' }} />
            </svg>
          </div>
          
          {/* Line through when hidden */}
          <svg 
            viewBox="0 0 24 24" 
            className={`absolute inset-0 w-5 h-5 text-white/70 transition-all duration-300 ${
              !showPassword ? 'opacity-100' : 'opacity-0'
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="4" y1="20" x2="20" y2="4" />
          </svg>
        </div>
      </button>
    </div>
  );
}

// ==================== Auth Form Component ====================
function AuthForm({ onSuccess }: { onSuccess: (user: User) => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Play "yoop" sound - soft and melodic
  const playYoopSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      
      // Resume if suspended (browser autoplay policy)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      const now = audioContext.currentTime;
      
      // Create a soft "yoop" sound with multiple oscillators for richness
      const frequencies = [400, 500, 600]; // Chord frequencies
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, now);
        oscillator.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.15);
        oscillator.frequency.exponentialRampToValueAtTime(freq * 0.8, now + 0.3);
        
        // Soft envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.08, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.15, now + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        oscillator.start(now + index * 0.02);
        oscillator.stop(now + 0.5);
      });
      
    } catch {
      // Ignore audio errors
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Play yoop sound on button click
    playYoopSound();
    
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { username, password }
        : { username, password, displayName };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'خطا در عملیات');
        setLoading(false);
        return;
      }

      // Success - call onSuccess with user data
      onSuccess(data.user);
    } catch {
      setError('خطا در اتصال به سرور');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Animated background */}
      <div className="absolute inset-0 animated-gradient opacity-30" />
      <div className="absolute inset-0 bg-[#0a0a0f]/80" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl float" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl float" style={{ animationDelay: '1s' }} />
      
      <Card className="w-full max-w-md bg-[#12121a]/80 backdrop-blur-2xl border-white/10 relative z-10 shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 relative">
            <div className="absolute inset-0 modern-gradient rounded-full blur-xl opacity-50" />
            <div className="relative w-24 h-24 modern-gradient rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
          <CardTitle className="text-3xl text-white font-bold text-glow">تلگرام</CardTitle>
          <p className="text-white/50 text-sm mt-2">پیام‌رسان امن و سریع</p>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(v) => setIsLogin(v === 'login')}>
            <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
              <TabsTrigger value="login" className="text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all">ورود</TabsTrigger>
              <TabsTrigger value="register" className="text-white/70 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all">ثبت‌نام</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label className="text-white/70 text-sm">نام نمایشی</Label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="نام خود را وارد کنید"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
                    required={!isLogin}
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-white/70 text-sm">نام کاربری</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="نام کاربری"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white/70 text-sm">رمز عبور</Label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز عبور"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 px-4 rounded-lg border border-red-500/20">{error}</p>
              )}

              <Button 
                type="submit" 
                className="w-full modern-gradient hover:opacity-90 text-white font-medium py-6 transition-all hover:shadow-lg hover:shadow-indigo-500/25 btn-press"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>لطفاً صبر کنید...</span>
                  </div>
                ) : isLogin ? 'ورود' : 'ثبت‌نام'}
              </Button>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== User Search Component ====================
function UserSearch({ onSelect }: { onSelect: (user: User) => void }) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/users/search?username=${encodeURIComponent(query)}`);
        const data = await res.json();
        setUsers(data.users || []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSendRequest = async (user: User) => {
    try {
      const res = await fetch('/api/chat-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'خطا در ارسال درخواست');
        return;
      }

      alert('درخواست چت ارسال شد');
      setShowResults(false);
      setQuery('');
    } catch {
      alert('خطا در ارسال درخواست');
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="جستجوی کاربر..."
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 pr-10 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
        />
      </div>

      {showResults && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#12121a]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 z-50 max-h-60 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-white/50 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/20 border-t-indigo-500 rounded-full animate-spin" />
              در حال جستجو...
            </div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-white/50">کاربری یافت نشد</div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 hover:bg-white/5 cursor-pointer transition-all border-b border-white/5 last:border-0"
                onClick={() => handleSendRequest(user)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9 ring-2 ring-white/10">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="modern-gradient">{user.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white text-sm font-medium">{user.displayName}</p>
                    <p className="text-white/40 text-xs">@{user.username}</p>
                  </div>
                </div>
                <div className="p-2 rounded-full bg-indigo-500/20 text-indigo-400">
                  <UserPlus className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ==================== Chat Request Modal ====================
function ChatRequestModal({ 
  requests, 
  open,
  onAccept, 
  onReject,
  onClose 
}: { 
  requests: ChatRequest[];
  open: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onClose: () => void;
}) {
  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <Dialog open={open && pendingRequests.length > 0} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>درخواست‌های چت</DialogTitle>
          <DialogDescription className="text-white/60">
            شما {pendingRequests.length} درخواست چت جدید دارید
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-80">
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={request.sender.avatar || undefined} />
                    <AvatarFallback>{request.sender.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{request.sender.displayName}</p>
                    <p className="text-sm text-white/60">@{request.sender.username}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                    onClick={() => onAccept(request.id)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    onClick={() => onReject(request.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Delete Chat Modal ====================
function DeleteChatModal({
  chat,
  onConfirm,
  onClose
}: {
  chat: Chat;
  onConfirm: (deleteType: 'both' | 'me' | 'receiver') => void;
  onClose: () => void;
}) {
  const [deleteType, setDeleteType] = useState<'both' | 'me' | 'receiver'>('me');

  return (
    <Dialog open={!!chat} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>حذف چت</DialogTitle>
          <DialogDescription className="text-white/60">
            آیا مطمئن هستید که می‌خواهید این چت را حذف کنید؟
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 my-4">
          <button
            onClick={() => setDeleteType('me')}
            className={`w-full p-3 rounded-lg text-right transition ${
              deleteType === 'me' ? 'bg-blue-500/20 border border-blue-500' : 'bg-white/5'
            }`}
          >
            <p className="font-medium">حذف برای من</p>
            <p className="text-sm text-white/60">فقط برای شما حذف می‌شود</p>
          </button>
          <button
            onClick={() => setDeleteType('both')}
            className={`w-full p-3 rounded-lg text-right transition ${
              deleteType === 'both' ? 'bg-blue-500/20 border border-blue-500' : 'bg-white/5'
            }`}
          >
            <p className="font-medium">حذف برای هر دو</p>
            <p className="text-sm text-white/60">برای شما و {chat.otherParticipant?.displayName} حذف می‌شود</p>
          </button>
          <button
            onClick={() => setDeleteType('receiver')}
            className={`w-full p-3 rounded-lg text-right transition ${
              deleteType === 'receiver' ? 'bg-blue-500/20 border border-blue-500' : 'bg-white/5'
            }`}
          >
            <p className="font-medium">حذف برای طرف مقابل</p>
            <p className="text-sm text-white/60">فقط برای {chat.otherParticipant?.displayName} حذف می‌شود</p>
          </button>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>انصراف</Button>
          <Button variant="destructive" onClick={() => onConfirm(deleteType)}>
            حذف
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Create Group Modal ====================
function CreateGroupModal({
  open,
  onClose,
  onCreated
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (group: Group) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        onCreated(data.group);
        setName('');
        setDescription('');
        onClose();
      } else {
        alert(data.error || 'خطا در ایجاد گروه');
      }
    } catch {
      alert('خطا در ایجاد گروه');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>ایجاد گروه جدید</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label className="text-white/80 mb-2 block">نام گروه</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="نام گروه را وارد کنید"
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <div>
            <Label className="text-white/80 mb-2 block">توضیحات (اختیاری)</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات گروه"
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="ghost" onClick={onClose}>انصراف</Button>
          <Button onClick={handleCreate} disabled={loading || !name.trim()}>
            {loading ? 'در حال ایجاد...' : 'ایجاد گروه'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Add Member Modal ====================
function AddMemberModal({
  groupId,
  open,
  onClose,
  onAdded
}: {
  groupId: string;
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!username.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        onAdded();
        setUsername('');
        onClose();
      } else {
        alert(data.error || 'خطا در اضافه کردن عضو');
      }
    } catch {
      alert('خطا در اضافه کردن عضو');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-white/20 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle>اضافه کردن عضو</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="نام کاربری را وارد کنید"
            className="bg-white/10 border-white/20 text-white"
          />
        </div>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="ghost" onClick={onClose}>انصراف</Button>
          <Button onClick={handleAdd} disabled={loading || !username.trim()}>
            {loading ? '...' : 'اضافه کردن'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Group Chat Window ====================
function GroupChatWindow({
  group,
  currentUser,
  onBack,
  onLeave
}: {
  group: Group;
  currentUser: User;
  onBack: () => void;
  onLeave: () => void;
}) {
  const [message, setMessage] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMuteModal, setShowMuteModal] = useState<string | null>(null);
  const [muteDuration, setMuteDuration] = useState({ value: 5, unit: 'minutes' as 'minutes' | 'hours' });
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [deletingMessageIds, setDeletingMessageIds] = useState<Set<string>>(new Set());
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleMinutes, setScheduleMinutes] = useState(1);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [replyTo, setReplyTo] = useState<GroupMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { groupMessages, setGroupMessages, addGroupMessage, updateGroup, removeGroupMessage } = useAppStore();

  const isOwner = group.ownerId === currentUser.id;

  // Toggle message selection
  const toggleMessageSelection = (msgId: string) => {
    const newSelected = new Set(selectedMessageIds);
    if (newSelected.has(msgId)) {
      newSelected.delete(msgId);
    } else {
      newSelected.add(msgId);
    }
    setSelectedMessageIds(newSelected);
  };

  // Reply to message
  const handleReply = (msg: GroupMessage) => {
    setReplyTo(msg);
    setIsSelectMode(false);
  };

  // Show bulk delete modal
  const handleDeleteSelected = () => {
    if (selectedMessageIds.size === 0) return;
    setShowBulkDeleteModal(true);
  };

  // Confirm bulk delete
  const confirmBulkDelete = async (deleteType: 'me' | 'all') => {
    const msgIds = Array.from(selectedMessageIds);
    setShowBulkDeleteModal(false);
    setDeletingMessageIds(new Set(msgIds));
    
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/groups/${group.id}/messages/bulk-delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageIds: msgIds, deleteType }),
        });
        
        if (res.ok) {
          msgIds.forEach(id => removeGroupMessage(id));
          setDeletingMessageIds(new Set());
          setSelectedMessageIds(new Set());
          setIsSelectMode(false);
        }
      } catch {
        console.error('Failed to delete messages');
      }
    }, 1000);
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle scroll to detect if user scrolled up
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    shouldAutoScrollRef.current = isAtBottom;
  }, []);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/groups/${group.id}/messages`);
        const data = await res.json();
        setGroupMessages(data.messages || []);
      } catch {
        console.error('Failed to fetch group messages');
      }
    };
    fetchMessages();

    const poll = setInterval(fetchMessages, 2000);
    return () => clearInterval(poll);
  }, [group.id, setGroupMessages]);

  // Auto-scroll when messages change (new message received)
  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom();
    }
  }, [groupMessages]);

  const handleSend = async (delayMinutes?: number) => {
    if (!message.trim()) return;

    const scheduledAt = delayMinutes 
      ? new Date(Date.now() + delayMinutes * 60 * 1000).toISOString()
      : undefined;

    try {
      const res = await fetch(`/api/groups/${group.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: message.trim(), 
          scheduledAt,
          replyToId: replyTo?.id 
        })
      });
      const data = await res.json();
      if (res.ok) {
        if (!data.isScheduled) {
          addGroupMessage(data.message);
        }
        setMessage('');
        setShowSchedule(false);
        setScheduleMinutes(1);
        setReplyTo(null);
        shouldAutoScrollRef.current = true;
        setTimeout(scrollToBottom, 50);
      } else {
        alert(data.error || 'خطا در ارسال پیام');
      }
    } catch {
      alert('خطا در ارسال پیام');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      const res = await fetch(`/api/groups/${group.id}/members?memberId=${memberId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        updateGroup(data.group);
      } else {
        alert(data.error || 'خطا در حذف عضو');
      }
    } catch {
      alert('خطا در حذف عضو');
    }
  };

  const handleMute = async (memberId: string) => {
    try {
      const minutes = muteDuration.unit === 'hours' ? muteDuration.value * 60 : muteDuration.value;
      const res = await fetch(`/api/groups/${group.id}/mute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, minutes })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setShowMuteModal(null);
      } else {
        alert(data.error || 'خطا در سکوت کردن');
      }
    } catch {
      alert('خطا در سکوت کردن');
    }
  };

  const handleUnmute = async (memberId: string) => {
    try {
      const res = await fetch(`/api/groups/${group.id}/mute?memberId=${memberId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
      } else {
        alert(data.error || 'خطا در برداشتن سکوت');
      }
    } catch {
      alert('خطا در برداشتن سکوت');
    }
  };

  const handleDeleteMessage = async (deleteType: 'me' | 'both') => {
    if (!messageToDelete) return;
    
    const msgId = messageToDelete.id;
    
    // Start animation
    setDeletingMessageIds(prev => new Set(prev).add(msgId));
    setMessageToDelete(null);
    
    // Wait for animation to complete (1 second)
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/groups/${group.id}/messages/${msgId}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (res.ok) {
          removeGroupMessage(msgId);
          setDeletingMessageIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(msgId);
            return newSet;
          });
        } else {
          alert(data.error || 'خطا در حذف پیام');
          setDeletingMessageIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(msgId);
            return newSet;
          });
        }
      } catch {
        alert('خطا در حذف پیام');
        setDeletingMessageIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(msgId);
          return newSet;
        });
      }
    }, 1000);
  };

  // Voice recording for group
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendVoiceMessage(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } catch {
      alert('خطا در دسترسی به میکروفون');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      audioChunksRef.current = [];
      setIsRecording(false);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, `voice_${Date.now()}.webm`);
      
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error);

      const res = await fetch(`/api/groups/${group.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'پیام صوتی',
          messageType: 'voice',
          fileUrl: uploadData.url,
          fileName: 'voice.webm',
          fileSize: audioBlob.size,
          fileType: 'audio',
          duration: recordingTime
        })
      });
      const data = await res.json();
      if (res.ok) addGroupMessage(data.message);
      else alert(data.error || 'خطا در ارسال');
    } catch (e) {
      alert('خطا در ارسال ویس');
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  const handleLeave = async () => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    try {
      const res = await fetch(`/api/groups/${group.id}/leave`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        onLeave();
      } else {
        alert(data.error || 'خطا در خروج');
      }
    } catch {
      alert('خطا در خروج');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-[#12121a]/80 backdrop-blur-xl">
        {isSelectMode ? (
          <>
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white" onClick={() => { setIsSelectMode(false); setSelectedMessageIds(new Set()); }}>
              <X className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <p className="font-medium text-white">{selectedMessageIds.size} پیام انتخاب شده</p>
            </div>
            {selectedMessageIds.size > 0 && (
              <Button variant="destructive" size="sm" onClick={handleDeleteSelected} className="bg-red-500 hover:bg-red-600">
                <Trash2 className="w-4 h-4 ml-1" />
                حذف
              </Button>
            )}
          </>
        ) : (
          <>
            <Button variant="ghost" size="icon" className="lg:hidden text-white/70 hover:text-white hover:bg-white/5" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Avatar className="w-11 h-11 ring-2 ring-white/10">
              <AvatarFallback className="modern-gradient font-bold">{group.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-white">{group.name}</p>
              <p className="text-sm text-white/40">{group.members.length} عضو</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/5" onClick={() => setIsSelectMode(true)} title="انتخاب پیام‌ها">
                <CheckCheck className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/5" onClick={() => setShowMembers(true)}>
                <UserIcon className="w-5 h-5" />
              </Button>
              <div className="relative">
                <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/5" onClick={() => setShowMenu(!showMenu)}>
                  <MoreVertical className="w-5 h-5" />
                </Button>
                {showMenu && (
                  <div className="absolute left-0 top-full mt-2 bg-[#12121a]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 z-50 min-w-[160px] overflow-hidden">
                    {isOwner && (
                      <button
                        onClick={() => { setShowAddMember(true); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 p-3 text-indigo-400 hover:bg-white/5 transition-all"
                      >
                        <UserPlus className="w-4 h-4" /> افزودن عضو
                      </button>
                    )}
                    <button
                      onClick={handleLeave}
                      className="w-full flex items-center gap-3 p-3 text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> {isOwner ? 'حذف گروه' : 'خروج از گروه'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-3">
          {groupMessages.map((msg) => {
            const isOwn = msg.senderId === currentUser.id;
            const isVoice = msg.messageType === 'voice';
            const isDeleting = deletingMessageIds.has(msg.id);
            const isSelected = selectedMessageIds.has(msg.id);
            return (
              <div 
                key={msg.id} 
                className={`flex ${isOwn ? 'justify-start' : 'justify-end'} group items-center gap-2 ${isSelectMode ? 'cursor-pointer' : ''}`}
                onClick={() => isSelectMode && toggleMessageSelection(msg.id)}
              >
                {isSelectMode ? (
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-white/30'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                ) : (
                  <>
                    {/* Reply button */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleReply(msg); }} 
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-indigo-500/80 hover:bg-indigo-500"
                    >
                      <Reply className="w-4 h-4 text-white rotate-180" />
                    </button>
                    {/* Delete button - only for own messages */}
                    {isOwn && !isDeleting && (
                      <button onClick={(e) => { e.stopPropagation(); setMessageToDelete(msg); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-red-500/80 hover:bg-red-500">
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    )}
                  </>
                )}
                <DeleteAnimation isDeleting={isDeleting} onComplete={() => {}}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                    isOwn ? 'chat-bubble-sent text-white' : 'chat-bubble-received text-white'
                  } ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}>
                    {/* Reply preview */}
                    {msg.replyTo && (
                      <div className="mb-2 p-2 rounded-lg bg-white/10 border-r-2 border-indigo-400 text-xs">
                        <p className="text-indigo-300 font-medium">{msg.replyTo.sender.displayName}</p>
                        <p className="text-white/60 truncate">{msg.replyTo.content}</p>
                      </div>
                    )}
                    {!isOwn && (
                      <p className="text-xs text-indigo-400 mb-1 font-medium">{msg.sender.displayName}</p>
                    )}
                    {isVoice && msg.fileUrl ? (
                      <div className="flex items-center gap-2">
                        <audio controls src={msg.fileUrl} className="h-8 w-48" />
                        <span className="text-xs opacity-60">{formatTime(msg.duration || 0)}</span>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                    <p className="text-[10px] opacity-50 mt-1 text-left">
                      {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </DeleteAnimation>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 bg-[#12121a]/80 backdrop-blur-xl">
        {/* Reply preview */}
        {replyTo && (
          <div className="mb-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
            <Reply className="w-4 h-4 text-indigo-400 rotate-180" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-indigo-300 font-medium">{replyTo.sender.displayName}</p>
              <p className="text-sm text-white/60 truncate">{replyTo.content}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setReplyTo(null)} className="text-white/50 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        {isRecording ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 bg-red-500/20 rounded-full px-4 py-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white">{formatTime(recordingTime)}</span>
            </div>
            <Button onClick={cancelRecording} variant="ghost" className="text-white/70"><X className="w-5 h-5" /></Button>
            <Button onClick={stopRecording} className="modern-gradient w-11 h-11 rounded-xl"><Send className="w-5 h-5" /></Button>
          </div>
        ) : uploading ? (
          <div className="flex items-center justify-center gap-2 text-white/60">
            <div className="w-4 h-4 border-2 border-white/20 border-t-indigo-500 rounded-full animate-spin" />
            در حال آپلود...
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Button onClick={startRecording} variant="ghost" className="text-white/50 hover:text-white hover:bg-white/5">
              <Mic className="w-5 h-5" />
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !showSchedule && handleSend()}
              placeholder="پیام خود را بنویسید..."
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
            {message.trim() && (
              <Button
                onClick={() => setShowSchedule(!showSchedule)}
                variant="ghost"
                className={`text-white/50 hover:text-white ${showSchedule ? 'bg-indigo-500/30' : ''}`}
                title="زمان‌بندی ارسال"
              >
                <Clock className="w-5 h-5" />
              </Button>
            )}
            <Button 
              onClick={() => showSchedule ? handleSend(scheduleMinutes) : handleSend()} 
              className="modern-gradient hover:opacity-90 w-11 h-11 rounded-xl btn-press"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        )}
        {/* Schedule UI for group */}
        {showSchedule && (
          <div className="p-4 bg-white/5 border-t border-white/5">
            <p className="text-white/70 text-sm mb-2">ارسال بعد از چند دقیقه:</p>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setScheduleMinutes(Math.max(1, scheduleMinutes - 1))}
                variant="ghost"
                size="sm"
                className="text-white"
              >
                -
              </Button>
              <span className="text-white text-lg font-bold w-16 text-center">{scheduleMinutes}</span>
              <Button
                onClick={() => setScheduleMinutes(scheduleMinutes + 1)}
                variant="ghost"
                size="sm"
                className="text-white"
              >
                +
              </Button>
              <span className="text-white/50">دقیقه</span>
            </div>
          </div>
        )}
      </div>

      {/* Mute Modal */}
      <Dialog open={!!showMuteModal} onOpenChange={() => setShowMuteModal(null)}>
        <DialogContent className="bg-[#12121a]/95 backdrop-blur-2xl border-white/10 text-white max-w-sm">
          <DialogHeader><DialogTitle>سکوت کردن کاربر</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex gap-2">
              <Input type="number" value={muteDuration.value} onChange={(e) => setMuteDuration(d => ({...d, value: parseInt(e.target.value) || 1}))} className="bg-white/5 border-white/10 text-white" />
              <select value={muteDuration.unit} onChange={(e) => setMuteDuration(d => ({...d, unit: e.target.value as 'minutes' | 'hours'}))} className="bg-white/5 border border-white/10 text-white rounded-lg px-3">
                <option value="minutes">دقیقه</option>
                <option value="hours">ساعت</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setShowMuteModal(null)} className="flex-1">انصراف</Button>
              <Button onClick={() => showMuteModal && handleMute(showMuteModal)} className="flex-1 modern-gradient">سکوت</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Members Modal */}
      <Dialog open={showMembers} onOpenChange={setShowMembers}>
        <DialogContent className="bg-[#12121a]/95 backdrop-blur-2xl border-white/10 text-white max-w-md shadow-2xl">
          <DialogHeader><DialogTitle className="text-xl">اعضای گروه ({group.members.length})</DialogTitle></DialogHeader>
          <ScrollArea className="max-h-80 mt-4">
            <div className="space-y-2">
              {group.members.map((member) => {
                const isMemberOwner = member.id === group.ownerId;
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 ring-2 ring-white/10">
                        <AvatarFallback className="modern-gradient font-bold">{member.displayName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.displayName}</p>
                        <p className="text-xs text-white/40">@{member.username}</p>
                      </div>
                      {isMemberOwner && <span className="text-[10px] modern-gradient text-white px-2 py-0.5 rounded-full font-medium">مالک</span>}
                    </div>
                    {isOwner && !isMemberOwner && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="text-green-400 h-9 hover:bg-green-500/10" onClick={() => handleUnmute(member.id)}>🔊</Button>
                        <Button size="sm" variant="ghost" className="text-yellow-400 h-9 hover:bg-yellow-500/10" onClick={() => setShowMuteModal(member.id)}>🔇</Button>
                        <Button size="sm" variant="ghost" className="text-red-400 h-9 hover:bg-red-500/10" onClick={() => handleRemoveMember(member.id)}><X className="w-4 h-4" /></Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Add Member Modal */}
      <AddMemberModal
        groupId={group.id}
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        onAdded={async () => {
          const res = await fetch(`/api/groups/${group.id}`);
          const data = await res.json();
          if (res.ok) updateGroup(data.group);
        }}
      />

      {/* Delete Message Modal */}
      <DeleteMessageModal
        message={messageToDelete}
        isOwn={messageToDelete?.senderId === currentUser.id}
        isGroup={true}
        onConfirm={handleDeleteMessage}
        onClose={() => setMessageToDelete(null)}
      />

      {/* Bulk Delete Modal */}
      <Dialog open={showBulkDeleteModal} onOpenChange={() => setShowBulkDeleteModal(false)}>
        <DialogContent className="bg-gray-900 border-white/20 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>حذف پیام‌ها</DialogTitle>
            <DialogDescription className="text-white/60">
              {selectedMessageIds.size} پیام انتخاب شده. نوع حذف را انتخاب کنید:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 my-4">
            <button
              onClick={() => confirmBulkDelete('me')}
              className="w-full p-3 rounded-lg text-right transition bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <p className="font-medium">حذف برای من</p>
              <p className="text-sm text-white/60">فقط برای شما حذف می‌شود</p>
            </button>
            <button
              onClick={() => confirmBulkDelete('all')}
              className="w-full p-3 rounded-lg text-right transition bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <p className="font-medium">حذف برای همه</p>
              <p className="text-sm text-white/60">برای همه اعضای گروه حذف می‌شود</p>
            </button>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowBulkDeleteModal(false)}>انصراف</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== Chat List Component ====================
function ChatList({ 
  chats,
  groups,
  selectedChat,
  selectedGroup,
  onSelect,
  onSelectGroup,
  onLogout,
  currentUser
}: { 
  chats: Chat[];
  groups: Group[];
  selectedChat: Chat | null;
  selectedGroup: Group | null;
  onSelect: (chat: Chat) => void;
  onSelectGroup: (group: Group) => void;
  onLogout: () => void;
  currentUser: User;
}) {
  const [showProfile, setShowProfile] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const { chatRequests, setChatRequests, addChat, addGroup, setGroups } = useAppStore();

  // Fetch chat requests with polling every 4 seconds
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch('/api/chat-requests');
        const data = await res.json();
        setChatRequests(data.requests || []);
      } catch {
        console.error('Failed to fetch chat requests');
      }
    };
    
    fetchRequests();
    
    // Poll for new chat requests every 4 seconds
    const pollInterval = setInterval(fetchRequests, 2000);
    
    return () => clearInterval(pollInterval);
  }, [setChatRequests]);

  // Fetch groups with polling
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch('/api/groups');
        const data = await res.json();
        setGroups(data.groups || []);
      } catch {
        console.error('Failed to fetch groups');
      }
    };
    
    fetchGroups();
    const poll = setInterval(fetchGroups, 2000);
    return () => clearInterval(poll);
  }, [setGroups]);

  const pendingCount = chatRequests.filter(r => r.status === 'pending' && r.receiverId === currentUser.id).length;

  const handleAcceptRequest = async (id: string) => {
    try {
      const res = await fetch(`/api/chat-requests/${id}/accept`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        addChat(data.chat);
        setChatRequests(chatRequests.filter(r => r.id !== id));
      }
    } catch {
      console.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      await fetch(`/api/chat-requests/${id}/reject`, { method: 'POST' });
      setChatRequests(chatRequests.filter(r => r.id !== id));
    } catch {
      console.error('Failed to reject request');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-white/50 hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setShowRequests(true)}
            >
              <UserPlus className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 modern-gradient rounded-full text-xs flex items-center justify-center text-white font-medium">
                  {pendingCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/50 hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setShowCreateGroup(true)}
              title="ساخت گروه"
            >
              <Users className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/50 hover:text-white hover:bg-white/5 transition-all"
              onClick={() => setShowProfile(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/50 hover:text-white hover:bg-white/5 transition-all"
              onClick={onLogout}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <UserSearch onSelect={() => {}} />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-2">
          {/* Groups Section */}
          {groups.length > 0 && (
            <>
              <p className="text-[11px] text-white/30 px-4 mb-2 font-medium uppercase tracking-wider">گروه‌ها</p>
              {groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => onSelectGroup(group)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all mb-1 card-hover ${
                    selectedGroup?.id === group.id 
                      ? 'bg-indigo-500/10 border border-indigo-500/20' 
                      : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="modern-gradient text-lg font-bold">
                        {group.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {/* Unread badge for group */}
                    {group.unreadCount && group.unreadCount > 0 && (
                      <div className="absolute -top-1 -left-1 w-5 h-5 unread-badge rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{group.unreadCount > 9 ? '9+' : group.unreadCount}</span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0f]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${group.unreadCount && group.unreadCount > 0 ? 'text-white' : 'text-white/80'}`}>{group.name}</p>
                    <p className={`text-sm truncate ${group.unreadCount && group.unreadCount > 0 ? 'text-white/70' : 'text-white/40'}`}>
                      {group.members.length} عضو
                    </p>
                  </div>
                </div>
              ))}
              <div className="border-t border-white/5 my-3 mx-2" />
            </>
          )}
          
          {/* Chats Section */}
          {chats.length === 0 && groups.length === 0 ? (
            <div className="text-center text-white/30 py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-white/20" />
              </div>
              <p className="font-medium">هنوز چتی ندارید</p>
              <p className="text-sm mt-1 text-white/20">کاربری را جستجو کنید</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelect(chat)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all mb-1 card-hover ${
                  selectedChat?.id === chat.id 
                    ? 'bg-indigo-500/10 border border-indigo-500/20' 
                    : 'hover:bg-white/[0.03]'
                }`}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={chat.otherParticipant?.avatar || undefined} />
                    <AvatarFallback className="modern-gradient text-lg font-bold">{chat.otherParticipant?.displayName[0]}</AvatarFallback>
                  </Avatar>
                  {/* Unread badge - animated red circle */}
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <div className="absolute -top-1 -left-1 w-5 h-5 unread-badge rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{chat.unreadCount > 9 ? '9+' : chat.unreadCount}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0f]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium truncate ${chat.unreadCount && chat.unreadCount > 0 ? 'text-white' : 'text-white/80'}`}>
                      {chat.otherParticipant?.displayName}
                    </p>
                    {chat.lastMessage && (
                      <span className="text-[11px] text-white/30">
                        {formatDistanceToNow(new Date(chat.lastMessage.createdAt), { 
                          addSuffix: true,
                          locale: faIR 
                        })}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm truncate ${chat.unreadCount && chat.unreadCount > 0 ? 'text-white/70 font-medium' : 'text-white/40'}`}>
                    {chat.lastMessage?.content || 'بدون پیام'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Requests Modal */}
      <ChatRequestModal
        requests={chatRequests.filter(r => r.receiverId === currentUser.id)}
        open={showRequests}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
        onClose={() => setShowRequests(false)}
      />

      {/* Profile Modal */}
      <ProfileModal
        user={currentUser}
        open={showProfile}
        onClose={() => setShowProfile(false)}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        open={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreated={(group) => addGroup(group)}
      />
    </div>
  );
}

// ==================== Profile Modal ====================
function ProfileModal({ 
  user, 
  open, 
  onClose 
}: { 
  user: User;
  open: boolean;
  onClose: () => void;
}) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [newUsername, setNewUsername] = useState('');
  const [password, setPassword] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { setCurrentUser, setAuthenticated } = useAppStore();

  const handleTransfer = async () => {
    if (!newUsername || !password) {
      alert('لطفاً همه فیلدها را پر کنید');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'خطا در انتقال حساب');
        return;
      }

      setCurrentUser(data.user);
      setNewUsername('');
      setPassword('');
      alert('نام کاربری با موفقیت تغییر کرد');
    } catch {
      alert('خطا در انتقال حساب');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert('لطفاً رمز عبور خود را وارد کنید');
      return;
    }

    if (!confirm('آیا مطمئن هستید؟ این عمل قابل بازگشت نیست!')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'خطا در حذف حساب');
        return;
      }

      alert('حساب کاربری شما با موفقیت حذف شد');
      setCurrentUser(null);
      setAuthenticated(false);
      onClose();
    } catch {
      alert('خطا در حذف حساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>پروفایل</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="text-2xl">{user.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="text-xl font-medium">{displayName}</p>
              <p className="text-white/60">@{user.username}</p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <h3 className="font-medium mb-3">انتقال حساب به نام کاربری جدید</h3>
            <div className="space-y-3">
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="نام کاربری جدید"
                className="bg-white/10 border-white/20 text-white"
              />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور فعلی"
                className="bg-white/10 border-white/20 text-white"
              />
              <Button 
                onClick={handleTransfer} 
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                {loading ? 'لطفاً صبر کنید...' : 'انتقال حساب'}
              </Button>
            </div>
          </div>

          <div className="border-t border-red-500/30 pt-4">
            <h3 className="font-medium mb-3 text-red-400">حذف حساب کاربری</h3>
            {!showDeleteConfirm ? (
              <Button 
                onClick={() => setShowDeleteConfirm(true)} 
                variant="destructive"
                className="w-full"
              >
                حذف حساب کاربری
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-red-400">برای حذف حساب، رمز عبور خود را وارد کنید:</p>
                <Input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="رمز عبور"
                  className="bg-white/10 border-red-500/50 text-white"
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setShowDeleteConfirm(false)} 
                    variant="ghost"
                    className="flex-1"
                  >
                    انصراف
                  </Button>
                  <Button 
                    onClick={handleDeleteAccount} 
                    variant="destructive"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'در حال حذف...' : 'تأیید حذف'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Delete Message Modal ====================
function DeleteMessageModal({
  message,
  isOwn,
  isGroup = false,
  onConfirm,
  onClose
}: {
  message: Message | null;
  isOwn: boolean;
  isGroup?: boolean;
  onConfirm: (deleteType: 'me' | 'both') => void;
  onClose: () => void;
}) {
  const [deleteType, setDeleteType] = useState<'me' | 'both'>('me');

  return (
    <Dialog open={!!message} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-white/20 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle>حذف پیام</DialogTitle>
          <DialogDescription className="text-white/60">
            آیا مطمئن هستید که می‌خواهید این پیام را حذف کنید؟
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 my-4">
          <button
            onClick={() => setDeleteType('me')}
            className={`w-full p-3 rounded-lg text-right transition ${
              deleteType === 'me' ? 'bg-blue-500/20 border border-blue-500' : 'bg-white/5'
            }`}
          >
            <p className="font-medium">حذف برای من</p>
            <p className="text-sm text-white/60">فقط برای شما حذف می‌شود</p>
          </button>
          {isOwn && (
            <button
              onClick={() => setDeleteType('both')}
              className={`w-full p-3 rounded-lg text-right transition ${
                deleteType === 'both' ? 'bg-blue-500/20 border border-blue-500' : 'bg-white/5'
              }`}
            >
              <p className="font-medium">{isGroup ? 'حذف برای همه' : 'حذف برای هر دو'}</p>
              <p className="text-sm text-white/60">{isGroup ? 'برای همه اعضای گروه حذف می‌شود' : 'برای شما و گیرنده حذف می‌شود'}</p>
            </button>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>انصراف</Button>
          <Button variant="destructive" onClick={() => onConfirm(deleteType)}>
            حذف
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Voice Message Component ====================
function VoiceMessage({ 
  msg, 
  isOwn, 
  formatTime,
  onDelete,
  isDeleting = false
}: { 
  msg: Message; 
  isOwn: boolean; 
  formatTime: (seconds: number) => string;
  onDelete: (msg: Message) => void;
  isDeleting?: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(msg.duration || 0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setAudioLoaded(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      console.error('Audio error:', audio.error);
      setAudioError(true);
      setAudioLoaded(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        console.error('Play error:', err);
        setAudioError(true);
      });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audioLoaded) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
  };

  // Generate random heights for waveform bars
  const barHeights = useMemo(() => {
    return [...Array(40)].map(() => Math.random() * 12 + 8);
  }, []);

  return (
    <div className={`flex ${isOwn ? 'justify-start' : 'justify-end'} group items-center gap-2`}>
      {/* Delete button - always on left */}
      <button
        onClick={() => onDelete(msg)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full flex-shrink-0 bg-red-500/80 hover:bg-red-500"
      >
        <Trash2 className="w-4 h-4 text-white" />
      </button>
      
      <DeleteAnimation isDeleting={isDeleting} onComplete={() => {}}>
        <div className="relative">
          <div
            className={`rounded-2xl px-4 py-3 ${
              isOwn
                ? 'bg-blue-500 text-white rounded-bl-none'
                : 'bg-white/10 text-white rounded-br-none'
            }`}
          >
            <audio 
              ref={audioRef}
              src={msg.fileUrl || ''} 
              preload="metadata"
            />
            
            <div className="flex items-center gap-3 w-[240px]">
              <button
                onClick={togglePlay}
                disabled={audioError}
                className={`w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 transition ${
                  audioError 
                    ? 'bg-red-500/50 cursor-not-allowed' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {audioError ? (
                  <Mic className="w-5 h-5" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
              
              <div className="flex-1 overflow-hidden">
                {audioError ? (
                  <div className="flex items-center gap-2 text-red-300 text-sm">
                    <Mic className="w-4 h-4" />
                    <span>خطا در پخش</span>
                  </div>
                ) : (
                  <>
                    {/* Animated Waveform visualization */}
                    <div 
                      className="flex items-center justify-center h-8 cursor-pointer gap-[2px]"
                      onClick={handleSeek}
                    >
                      {barHeights.map((height, i) => {
                        const progress = duration > 0 ? (currentTime / duration) : 0;
                        const isActive = i / 40 < progress;
                        const isAnimating = isPlaying && i / 40 >= progress;
                        
                        return (
                          <div
                            key={i}
                            className={`w-[3px] rounded-full transition-all duration-150 ${
                              isActive ? 'bg-white' : 'bg-white/40'
                            }`}
                            style={{
                              height: `${height}px`,
                              animation: isAnimating ? `wave 0.5s ease-in-out infinite ${i * 0.02}s` : 'none',
                            }}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-xs opacity-60 mt-1 px-1">
                      <span>{formatTime(Math.floor(currentTime))}</span>
                      <span>{formatTime(Math.floor(duration))}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="text-xs opacity-60">
                {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              {isOwn && (
                msg.readAt ? (
                  <CheckCheck className="w-4 h-4 text-blue-300" />
                ) : (
                  <Check className="w-4 h-4 opacity-60" />
                )
              )}
            </div>
          </div>
        </div>
      </DeleteAnimation>
    </div>
  );
}

// ==================== File Message Component ====================
function FileMessage({ 
  msg, 
  isOwn, 
  getFileIcon,
  formatFileSize,
  onDelete,
  isDeleting = false
}: { 
  msg: Message; 
  isOwn: boolean; 
  getFileIcon: (fileType?: string | null) => JSX.Element;
  formatFileSize: (bytes: number) => string;
  onDelete: (msg: Message) => void;
  isDeleting?: boolean;
}) {
  const [downloading, setDownloading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDownload = async () => {
    if (!msg.fileUrl) return;
    
    setDownloading(true);
    try {
      const response = await fetch(msg.fileUrl);
      if (!response.ok) throw new Error('File not found');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = msg.fileName || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert('خطا در دانلود فایل');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-start' : 'justify-end'} group items-center gap-2`}>
      {/* Delete button - always on left */}
      <button
        onClick={() => onDelete(msg)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full flex-shrink-0 bg-red-500/80 hover:bg-red-500"
      >
        <Trash2 className="w-4 h-4 text-white" />
      </button>
      
      <DeleteAnimation isDeleting={isDeleting} onComplete={() => {}}>
        <div className="relative">
          <div
            className={`max-w-[280px] sm:max-w-[350px] md:max-w-[450px] rounded-2xl px-4 py-3 ${
              isOwn
                ? 'bg-blue-500 text-white rounded-bl-none'
                : 'bg-white/10 text-white rounded-br-none'
            }`}
          >
            <div className="flex items-center gap-3">
              {getFileIcon(msg.fileType)}
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="font-medium truncate break-words">{msg.fileName}</p>
                <p className="text-xs opacity-60">{formatFileSize(msg.fileSize || 0)}</p>
              </div>
              {msg.fileUrl && (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className={`p-2 rounded-full transition flex-shrink-0 ${
                    downloading 
                      ? 'bg-white/10 opacity-50' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {downloading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <File className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
            {msg.fileType === 'image' && msg.fileUrl && (
              <div className="mt-2">
                {!imageLoaded && !imageError && (
                  <div className="w-full h-48 bg-white/10 rounded-lg animate-pulse" />
                )}
                {!imageError && (
                  <img 
                    src={msg.fileUrl} 
                    alt={msg.fileName || 'Image'} 
                    className={`rounded-lg max-w-full max-h-48 object-cover ${
                      imageLoaded ? 'block' : 'hidden'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                      setImageError(true);
                      setImageLoaded(true);
                    }}
                  />
                )}
                {imageError && (
                  <div className="w-full h-24 bg-white/10 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 opacity-50" />
                  </div>
                )}
              </div>
            )}
            <div className="flex items-center justify-end gap-1 mt-2">
              <span className="text-xs opacity-60">
                {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              {isOwn && (
                msg.readAt ? (
                  <CheckCheck className="w-4 h-4 text-blue-300" />
                ) : (
                  <Check className="w-4 h-4 opacity-60" />
                )
              )}
            </div>
          </div>
        </div>
      </DeleteAnimation>
    </div>
  );
}

// ==================== Toast Component ====================
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top duration-300 ${
      type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`}>
      {type === 'error' ? (
        <X className="w-5 h-5" />
      ) : (
        <Check className="w-5 h-5" />
      )}
      <span>{message}</span>
      <button onClick={onClose} className="mr-2 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ==================== Text Message Component ====================
function TextMessage({ 
  msg, 
  isOwn,
  onDelete,
  isDeleting = false,
  isSelectMode = false,
  isSelected = false,
  onSelect
}: { 
  msg: Message; 
  isOwn: boolean;
  onDelete: (msg: Message) => void;
  isDeleting?: boolean;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (msgId: string) => void;
}) {
  return (
    <div 
      className={`flex ${isOwn ? 'justify-start' : 'justify-end'} group items-center gap-2 ${isSelectMode ? 'cursor-pointer' : ''}`}
      onClick={() => isSelectMode && onSelect?.(msg.id)}
    >
      {/* Checkbox in select mode or Delete button */}
      {isSelectMode ? (
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
          isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-white/30'
        }`}>
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(msg);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full flex-shrink-0 bg-red-500/80 hover:bg-red-500"
        >
          <Trash2 className="w-4 h-4 text-white" />
        </button>
      )}
      
      <DeleteAnimation isDeleting={isDeleting} onComplete={() => {}}>
        <div className={`relative ${isSelected ? 'ring-2 ring-indigo-500 rounded-2xl' : ''}`}>
          <div
            className={`max-w-[280px] sm:max-w-[350px] md:max-w-[450px] rounded-2xl px-4 py-2 ${
              isOwn
                ? 'bg-blue-500 text-white rounded-bl-none'
                : 'bg-white/10 text-white rounded-br-none'
            }`}
          >
            <p className="whitespace-pre-wrap break-words overflow-wrap-anywhere" style={{ wordBreak: 'break-word' }}>
              {msg.content}
            </p>
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="text-xs opacity-60">
                {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              {isOwn && (
                msg.readAt ? (
                  <CheckCheck className="w-4 h-4 text-blue-300" />
                ) : (
                  <Check className="w-4 h-4 opacity-60" />
                )
              )}
            </div>
          </div>
        </div>
      </DeleteAnimation>
    </div>
  );
}

// ==================== Chat Window Component ====================
function ChatWindow({ 
  chat, 
  currentUser,
  onBack,
  onDelete
}: { 
  chat: Chat;
  currentUser: User;
  onBack: () => void;
  onDelete: () => void;
}) {
  const [message, setMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [deletingMessageIds, setDeletingMessageIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [videoRecordingTime, setVideoRecordingTime] = useState(0);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleMinutes, setScheduleMinutes] = useState(1);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoRecordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeRef = useRef<number>(0);
  const { messages, setMessages, addMessage, removeMessage, markMessageAsRead } = useAppStore();
  const { sendMessage, emitMessageRead, emitMessageDeleted } = useSocket();

  // Toggle message selection
  const toggleMessageSelection = (msgId: string) => {
    const newSelected = new Set(selectedMessageIds);
    if (newSelected.has(msgId)) {
      newSelected.delete(msgId);
    } else {
      newSelected.add(msgId);
    }
    setSelectedMessageIds(newSelected);
  };

  // Show bulk delete modal
  const handleDeleteSelected = () => {
    if (selectedMessageIds.size === 0) return;
    setShowBulkDeleteModal(true);
  };

  // Confirm bulk delete with deleteType
  const confirmBulkDelete = async (deleteType: 'me' | 'both') => {
    const msgIds = Array.from(selectedMessageIds);
    setShowBulkDeleteModal(false);
    
    // Start animation for all selected
    setDeletingMessageIds(new Set(msgIds));
    
    setTimeout(async () => {
      try {
        const res = await fetch('/api/messages/bulk-delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageIds: msgIds, deleteType }),
        });
        
        if (res.ok) {
          msgIds.forEach(id => removeMessage(id));
          setDeletingMessageIds(new Set());
          setSelectedMessageIds(new Set());
          setIsSelectMode(false);
          showToast(`${msgIds.length} پیام حذف شد`);
        }
      } catch {
        showToast('خطا در حذف پیام‌ها', 'error');
      }
    }, 1000);
  };

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle scroll to detect if user scrolled up
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    // If user is at bottom, enable auto-scroll
    // If user scrolled up, disable auto-scroll
    shouldAutoScrollRef.current = isAtBottom;
  }, []);

  // Fetch messages with polling
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?chatId=${chat.id}`);
        const data = await res.json();
        setMessages(data.messages || []);
      } catch {
        console.error('Failed to fetch messages');
      }
    };
    
    fetchMessages();
    
    // Poll for new messages every 4 seconds
    const pollInterval = setInterval(fetchMessages, 2000);

    return () => clearInterval(pollInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat.id]);

  // Auto-scroll when messages change (new message received)
  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  // Mark unread messages as read (only for received messages)
  useEffect(() => {
    // Only mark messages sent TO the current user (not by them)
    const receivedMessages = messages.filter(msg => 
      msg.receiverId === currentUser.id && !msg.readAt
    );
    
    if (receivedMessages.length === 0) return;
    
    const markAsRead = async () => {
      for (const msg of receivedMessages) {
        try {
          const res = await fetch(`/api/messages/${msg.id}/read`, { method: 'POST' });
          const data = await res.json();
          if (res.ok) {
            markMessageAsRead(msg.id, data.message.readAt);
            emitMessageRead(msg.id, msg.senderId, data.message.readAt);
          }
        } catch {
          console.error('Failed to mark message as read');
        }
      }
    };
    
    markAsRead();
  }, [messages, currentUser.id, markMessageAsRead, emitMessageRead]);

  const handleSend = async (delayMinutes?: number) => {
    if (!message.trim()) return;

    // Calculate scheduled time if delay is provided
    const scheduledAt = delayMinutes 
      ? new Date(Date.now() + delayMinutes * 60 * 1000).toISOString()
      : undefined;

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chat.id,
          content: message.trim(),
          receiverId: chat.otherParticipant?.id,
          scheduledAt,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (!data.isScheduled) {
          addMessage(data.message);
          sendMessage(data.message, chat.otherParticipant?.id || '');
        } else {
          showToast(`پیام در ${delayMinutes} دقیقه ارسال می‌شود`, 'success');
        }
        setMessage('');
        setShowSchedule(false);
        setScheduleMinutes(1);
        shouldAutoScrollRef.current = true;
        setTimeout(scrollToBottom, 50);
      }
    } catch {
      console.error('Failed to send message');
    }
  };

  // ==================== File Upload Function (Super Fast) ====================
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chat.otherParticipant?.id) return;

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      showToast('حجم فایل بیش از ۵۰ مگابایت است', 'error');
      return;
    }

    setUploading(true);
    setUploadProgress(5);

    try {
      // Super fast upload with XMLHttpRequest for real progress
      const formData = new FormData();
      formData.append('file', file);

      const uploadPromise = new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 80) + 5;
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error('خطا در پردازش پاسخ'));
            }
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error || 'خطا در آپلود'));
            } catch {
              reject(new Error('خطا در آپلود'));
            }
          }
        };

        xhr.onerror = () => reject(new Error('خطا در اتصال'));
        xhr.open('POST', '/api/upload', true);
        xhr.send(formData);
      });

      const uploadData = await uploadPromise;
      setUploadProgress(90);

      // Send file message
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chat.id,
          content: file.name,
          receiverId: chat.otherParticipant.id,
          messageType: 'file',
          fileUrl: uploadData.url,
          fileName: file.name,
          fileSize: file.size,
          fileType: uploadData.fileType,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        addMessage(data.message);
        sendMessage(data.message, chat.otherParticipant.id);
        showToast(`فایل ارسال شد (${uploadData.uploadTime || ''}ms)`, 'success');
      } else {
        throw new Error(data.error || 'خطا در ارسال پیام');
      }
    } catch (err) {
      const error = err as Error;
      showToast(error.message || 'خطا در ارسال فایل', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ==================== Video Recording Functions ====================
  
  // Start video recording
  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: true
      });
      
      setVideoStream(stream);
      setIsVideoRecording(true);
      setVideoRecordingTime(0);
      
      // Show preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Start recording with optimized settings
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
        ? 'video/webm;codecs=vp9' 
        : 'video/webm';
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 500000 // 500kbps for fast upload
      });
      
      videoRecorderRef.current = mediaRecorder;
      videoChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          videoChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(videoChunksRef.current, { type: mimeType });
        await sendVideoMessage(blob);
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
        setIsVideoRecording(false);
      };
      
      mediaRecorder.start(1000); // Collect data every second
      
      videoRecordingIntervalRef.current = setInterval(() => {
        setVideoRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Video recording error:', error);
      showToast('خطا در دسترسی به دوربین', 'error');
    }
  };
  
  // Stop video recording
  const stopVideoRecording = () => {
    if (videoRecorderRef.current && isVideoRecording) {
      videoRecorderRef.current.stop();
      if (videoRecordingIntervalRef.current) {
        clearInterval(videoRecordingIntervalRef.current);
      }
    }
  };
  
  // Cancel video recording
  const cancelVideoRecording = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }
    setVideoStream(null);
    setIsVideoRecording(false);
    setVideoRecordingTime(0);
    videoChunksRef.current = [];
    if (videoRecordingIntervalRef.current) {
      clearInterval(videoRecordingIntervalRef.current);
    }
  };
  
  // Send video message - optimized for speed
  const sendVideoMessage = async (videoBlob: Blob) => {
    setUploading(true);
    setUploadProgress(10);
    
    const fileName = `video_${Date.now()}.webm`;
    
    try {
      const formData = new FormData();
      formData.append('file', videoBlob, fileName);

      setUploadProgress(20);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(60);
      
      const responseText = await uploadRes.text();
      let uploadData;
      try {
        uploadData = JSON.parse(responseText);
      } catch {
        throw new Error('خطا در سرور');
      }
      
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'خطا در آپلود');
      }

      setUploadProgress(80);

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chat.id,
          content: 'ویدیو',
          receiverId: chat.otherParticipant?.id,
          messageType: 'file',
          fileUrl: uploadData.url,
          fileName: fileName,
          fileSize: videoBlob.size,
          fileType: 'video',
        }),
      });

      const msgResponseText = await res.text();
      let data;
      try {
        data = JSON.parse(msgResponseText);
      } catch {
        throw new Error('خطا در ارسال پیام');
      }

      if (res.ok) {
        setUploadProgress(100);
        addMessage(data.message);
        sendMessage(data.message, chat.otherParticipant?.id || '');
        showToast('ویدیو ارسال شد', 'success');
      } else {
        throw new Error(data.error || 'خطا در ارسال پیام');
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Video upload error:', err);
      showToast(err.message || 'خطا در ارسال ویدیو', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete message handler
  const handleDeleteMessage = async (deleteType: 'me' | 'both') => {
    if (!messageToDelete) return;
    
    const msgId = messageToDelete.id;
    
    // Start delete animation
    setDeletingMessageIds(prev => new Set(prev).add(msgId));
    setMessageToDelete(null);
    
    // Wait for animation to complete (1 second)
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/messages/${msgId}?type=${deleteType}`, {
          method: 'DELETE',
        });

        const data = await res.json();

        if (res.ok) {
          removeMessage(msgId);
          setDeletingMessageIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(msgId);
            return newSet;
          });
          
          // Notify the other participant if deleted for both
          if (deleteType === 'both' && chat.otherParticipant?.id) {
            emitMessageDeleted({
              messageId: msgId,
              chatId: chat.id,
              deletedFor: deleteType,
              participantId: chat.otherParticipant.id,
            });
          }
        } else {
          alert(data.error || 'خطا در حذف پیام');
          setDeletingMessageIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(msgId);
            return newSet;
          });
        }
      } catch (error) {
        console.error('Failed to delete message:', error);
        alert('خطا در حذف پیام');
        setDeletingMessageIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(msgId);
          return newSet;
        });
      }
    }, 1000);
  };

  // Voice recording handlers
  const startRecording = async () => {
    try {
      // Request microphone access with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // Check supported MIME types
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/ogg';
          }
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      recordingTimeRef.current = 0;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('Audio chunk received:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        alert('خطا در ضبط صدا');
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onstop = async () => {
        const finalTime = recordingTimeRef.current;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        console.log('Recording stopped. Total chunks:', audioChunksRef.current.length, 'Total size:', audioBlob.size, 'bytes');
        
        // Check if we have actual audio data
        if (audioBlob.size < 500) {
          alert('ضبط صدا ناموفق بود. لطفاً دوباره تلاش کنید.');
          setUploading(false);
          return;
        }
        
        await sendVoiceMessage(audioBlob, finalTime, mimeType);
      };

      // Start recording with timeslice to ensure data is collected
      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error: any) {
      console.error('Recording error:', error);
      if (error.name === 'NotAllowedError') {
        alert('اجازه دسترسی به میکروفون داده نشد. لطفاً در تنظیمات مرورگر اجازه دسترسی دهید.');
      } else if (error.name === 'NotFoundError') {
        alert('میکروفون یافت نشد. لطفاً یک میکروفون به دستگاه متصل کنید.');
      } else {
        alert('خطا در دسترسی به میکروفون: ' + error.message);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // Request any remaining data
      mediaRecorderRef.current.requestData();
      setTimeout(() => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
        }
      }, 100);
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      audioChunksRef.current = [];
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const sendVoiceMessage = async (audioBlob: Blob, duration: number, mimeType: string) => {
    setUploading(true);
    setUploadProgress(20);
    
    const ext = mimeType.includes('mp4') ? 'm4a' : 'webm';
    const fileName = `voice_${Date.now()}.${ext}`;
    
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, fileName);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const text = await uploadRes.text();
      let uploadData;
      try {
        uploadData = JSON.parse(text);
      } catch {
        throw new Error('خطا در سرور');
      }

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'خطا در آپلود ویس');
      }

      setUploadProgress(50);

      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: chat.id,
          content: 'پیام صوتی',
          receiverId: chat.otherParticipant?.id,
          messageType: 'voice',
          fileUrl: uploadData.url,
          fileName: fileName,
          fileSize: audioBlob.size,
          fileType: 'audio',
          duration: duration,
        }),
      });

      const msgText = await res.text();
      let data;
      try {
        data = JSON.parse(msgText);
      } catch {
        throw new Error('خطا در ارسال پیام');
      }

      if (res.ok) {
        setUploadProgress(100);
        addMessage(data.message);
        sendMessage(data.message, chat.otherParticipant?.id || '');
        showToast('ویس ارسال شد', 'success');
      } else {
        showToast(data.error || 'خطا در ارسال ویس', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'خطا', 'error');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Format recording time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get file icon
  const getFileIcon = (fileType?: string | null) => {
    if (!fileType) return <File className="w-8 h-8" />;
    if (fileType === 'image') return <ImageIcon className="w-8 h-8" />;
    if (fileType === 'video') return <Video className="w-8 h-8" />;
    if (fileType === 'audio') return <Mic className="w-8 h-8" />;
    if (fileType === 'pdf') return <File className="w-8 h-8 text-red-400" />;
    return <File className="w-8 h-8" />;
  };

  return (
    <div className="h-full flex flex-col bg-[#0e1621]">
      {/* Toast notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-white/10 bg-[#17212b]">
        {isSelectMode ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={() => {
                setIsSelectMode(false);
                setSelectedMessageIds(new Set());
              }}
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <p className="font-medium text-white">{selectedMessageIds.size} پیام انتخاب شده</p>
            </div>
            {selectedMessageIds.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="bg-red-500 hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4 ml-1" />
                حذف
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white"
              onClick={onBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={chat.otherParticipant?.avatar || undefined} />
              <AvatarFallback>{chat.otherParticipant?.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-white">{chat.otherParticipant?.displayName}</p>
              <p className="text-sm text-white/60">آنلاین</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/70 hover:text-white hover:bg-white/10"
                onClick={() => setIsSelectMode(true)}
                title="انتخاب پیام‌ها"
              >
                <CheckCheck className="w-5 h-5" />
              </Button>
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white/70 hover:text-white hover:bg-white/10"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
                {showMenu && (
                  <div className="absolute left-0 top-full mt-1 bg-gray-800 rounded-lg shadow-xl border border-white/10 z-50 min-w-[160px]">
                    <button
                      onClick={() => {
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 p-3 text-red-400 hover:bg-white/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                      حذف چت
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Messages - Custom scrollable area with glass scrollbar */}
      <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 relative scrollbar-thin">
        <div className="space-y-4 pr-2">
          {messages.map((msg) => {
            const isOwn = msg.senderId === currentUser.id;
            const isDeleting = deletingMessageIds.has(msg.id);
            
            // Voice message
            if (msg.messageType === 'voice') {
              return (
                <VoiceMessage
                  key={msg.id}
                  msg={msg}
                  isOwn={isOwn}
                  formatTime={formatTime}
                  onDelete={setMessageToDelete}
                  isDeleting={isDeleting}
                />
              );
            }
            
            // File message
            if (msg.messageType === 'file') {
              return (
                <FileMessage
                  key={msg.id}
                  msg={msg}
                  isOwn={isOwn}
                  getFileIcon={getFileIcon}
                  formatFileSize={formatFileSize}
                  onDelete={setMessageToDelete}
                  isDeleting={isDeleting}
                />
              );
            }
            
            // Text message
            return (
              <TextMessage
                key={msg.id}
                msg={msg}
                isOwn={isOwn}
                onDelete={setMessageToDelete}
                isDeleting={isDeleting}
                isSelectMode={isSelectMode}
                isSelected={selectedMessageIds.has(msg.id)}
                onSelect={toggleMessageSelection}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Delete Message Modal */}
      <DeleteMessageModal
        message={messageToDelete}
        isOwn={messageToDelete?.senderId === currentUser.id}
        onConfirm={handleDeleteMessage}
        onClose={() => setMessageToDelete(null)}
      />

      {/* Input */}
      <div className="p-3 border-t border-white/10 bg-[#17212b]">
        {isRecording ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 bg-red-500/20 rounded-full px-4 py-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white">در حال ضبط صدا: {formatTime(recordingTime)}</span>
            </div>
            <Button
              onClick={cancelRecording}
              variant="ghost"
              className="text-white/70"
            >
              <X className="w-5 h-5" />
            </Button>
            <Button
              onClick={stopRecording}
              className="bg-green-500 hover:bg-green-600 rounded-full w-12 h-12"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        ) : isVideoRecording ? (
          // Video Recording UI
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-48 object-cover rounded-lg bg-black"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-between p-3">
              <div className="flex items-center gap-2 bg-red-500/80 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-sm">{formatTime(videoRecordingTime)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={cancelVideoRecording}
                  variant="ghost"
                  className="bg-white/20 text-white rounded-full w-12 h-12"
                >
                  <X className="w-5 h-5" />
                </Button>
                <Button
                  onClick={stopVideoRecording}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full w-14 h-14"
                >
                  <StopCircle className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="*/*"
            />
            {/* File upload button */}
            <Button
              onClick={handleFileSelect}
              disabled={uploading}
              variant="ghost"
              className="text-white/70 hover:text-white"
              title="ارسال فایل"
            >
              <File className="w-5 h-5" />
            </Button>
            <Button
              onClick={startVideoRecording}
              disabled={uploading}
              variant="ghost"
              className="text-white/70 hover:text-white"
              title="ضبط ویدیو"
            >
              <Camera className="w-5 h-5" />
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !showSchedule && handleSend()}
              placeholder="پیام خود را بنویسید..."
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
            {/* Schedule button */}
            {message.trim() && (
              <Button
                onClick={() => setShowSchedule(!showSchedule)}
                variant="ghost"
                className={`text-white/70 hover:text-white ${showSchedule ? 'bg-indigo-500/30' : ''}`}
                title="زمان‌بندی ارسال"
              >
                <Clock className="w-5 h-5" />
              </Button>
            )}
            {message.trim() ? (
              <Button
                onClick={() => showSchedule ? handleSend(scheduleMinutes) : handleSend()}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Send className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                onClick={startRecording}
                disabled={uploading}
                variant="ghost"
                className="text-white/70 hover:text-white"
                title="ضبط صدا"
              >
                <Mic className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}
        {/* Schedule UI */}
        {showSchedule && (
          <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/70 text-sm mb-2">ارسال بعد از چند دقیقه:</p>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setScheduleMinutes(Math.max(1, scheduleMinutes - 1))}
                variant="ghost"
                size="sm"
                className="text-white"
              >
                -
              </Button>
              <span className="text-white text-lg font-bold w-16 text-center">{scheduleMinutes}</span>
              <Button
                onClick={() => setScheduleMinutes(scheduleMinutes + 1)}
                variant="ghost"
                size="sm"
                className="text-white"
              >
                +
              </Button>
              <span className="text-white/50">دقیقه</span>
            </div>
          </div>
        )}
        {uploading && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-white/60 text-xs mb-1">
              <span>در حال آپلود...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bulk Delete Modal */}
      <Dialog open={showBulkDeleteModal} onOpenChange={() => setShowBulkDeleteModal(false)}>
        <DialogContent className="bg-gray-900 border-white/20 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>حذف پیام‌ها</DialogTitle>
            <DialogDescription className="text-white/60">
              {selectedMessageIds.size} پیام انتخاب شده. نوع حذف را انتخاب کنید:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 my-4">
            <button
              onClick={() => confirmBulkDelete('me')}
              className="w-full p-3 rounded-lg text-right transition bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <p className="font-medium">حذف برای من</p>
              <p className="text-sm text-white/60">فقط برای شما حذف می‌شود</p>
            </button>
            <button
              onClick={() => confirmBulkDelete('both')}
              className="w-full p-3 rounded-lg text-right transition bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <p className="font-medium">حذف برای همه</p>
              <p className="text-sm text-white/60">برای شما و {chat.otherParticipant?.displayName} حذف می‌شود</p>
            </button>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowBulkDeleteModal(false)}>انصراف</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


// ==================== Main App Component ====================
export default function Home() {
  const { 
    currentUser, 
    setCurrentUser, 
    isAuthenticated,
    setAuthenticated,
    chats,
    setChats,
    groups,
    selectedChat,
    setSelectedChat,
    selectedGroup,
    setSelectedGroup,
    removeGroup,
    logout: storeLogout
  } = useAppStore();
  
  const [loading, setLoading] = useState(true);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);

  // Handle selecting a group - mark as read
  const handleSelectGroup = async (group: Group) => {
    setSelectedGroup(group);
    
    // Mark group as read
    if (group.unreadCount && group.unreadCount > 0) {
      try {
        await fetch(`/api/groups/${group.id}/read`, { method: 'POST' });
      } catch {
        console.error('Failed to mark group as read');
      }
    }
  };

  // Handle selecting a chat - mark as read
  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    // Mark all messages as read when opening chat
    if (chat.unreadCount && chat.unreadCount > 0) {
      try {
        await fetch(`/api/chats/${chat.id}/read-all`, { method: 'POST' });
        // Update unread count in chats array
        setChats(chats.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c));
      } catch {
        console.error('Failed to mark as read');
      }
    }
  };

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          setAuthenticated(true);
        } else {
          setCurrentUser(null);
          setAuthenticated(false);
        }
      } catch {
        setCurrentUser(null);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [setCurrentUser, setAuthenticated]);

  // Fetch chats when authenticated with polling
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchChats = async () => {
      try {
        const res = await fetch('/api/chats', { credentials: 'include' });
        const data = await res.json();
        setChats(data.chats || []);
      } catch {
        console.error('Failed to fetch chats');
      }
    };
    
    fetchChats();
    
    // Poll for new chats every 4 seconds
    const pollInterval = setInterval(fetchChats, 2000);
    
    return () => clearInterval(pollInterval);
  }, [isAuthenticated, setChats]);

  // Check and send scheduled messages every 10 seconds
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const checkScheduled = async () => {
      try {
        await fetch('/api/scheduled/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id }),
        });
      } catch {
        // Ignore errors
      }
    };

    // Check immediately and then every 10 seconds
    checkScheduled();
    const interval = setInterval(checkScheduled, 10000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, currentUser]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      storeLogout();
    } catch {
      console.error('Failed to logout');
    }
  };

  const handleDeleteChat = async (deleteType: 'both' | 'me' | 'receiver') => {
    if (!chatToDelete) return;

    try {
      const res = await fetch(`/api/chats/${chatToDelete.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteType }),
      });

      if (res.ok) {
        setChats(chats.filter(c => c.id !== chatToDelete.id));
        if (selectedChat?.id === chatToDelete.id) {
          setSelectedChat(null);
        }
        setChatToDelete(null);
      } else {
        const data = await res.json().catch(() => ({}));
        // Chat might already be deleted, just remove from UI
        setChats(chats.filter(c => c.id !== chatToDelete.id));
        if (selectedChat?.id === chatToDelete.id) {
          setSelectedChat(null);
        }
        setChatToDelete(null);
        console.log('Chat deleted from UI');
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
      // Still remove from UI even if API fails
      setChats(chats.filter(c => c.id !== chatToDelete.id));
      if (selectedChat?.id === chatToDelete.id) {
        setSelectedChat(null);
      }
      setChatToDelete(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !currentUser) {
    return <AuthForm onSuccess={(user: User) => {
      setCurrentUser(user);
      setAuthenticated(true);
    }} />;
  }

  // Authenticated - show main app
  return (
    <>
      {/* CSS for animations and scrollbar */}
      <style jsx global>{`
        @keyframes wave {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.5);
          }
        }
        
        /* Glass scrollbar styles */
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:active {
          background: rgba(255, 255, 255, 0.6);
        }
        
        /* Firefox scrollbar */
        .scrollbar-thin {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }
      `}</style>
      
      <div className="h-screen w-screen flex overflow-hidden bg-[#0e1621]">
      {/* Desktop: Show chat list and window side by side */}
      {/* Mobile: Show either chat list OR chat window */}
      
      {/* Chat List */}
      <div className={`${selectedChat || selectedGroup ? 'hidden lg:flex' : 'flex'} w-full lg:w-[350px] flex-col border-l border-white/10`}>
        <ChatList
          chats={chats}
          groups={groups}
          selectedChat={selectedChat}
          selectedGroup={selectedGroup}
          onSelect={handleSelectChat}
          onSelectGroup={handleSelectGroup}
          onLogout={handleLogout}
          currentUser={currentUser}
        />
      </div>

      {/* Chat Window */}
      <div className={`${!selectedChat && !selectedGroup ? 'hidden lg:flex' : 'flex'} flex-1 flex-col`}>
        {selectedGroup ? (
          <GroupChatWindow
            group={selectedGroup}
            currentUser={currentUser}
            onBack={() => setSelectedGroup(null)}
            onLeave={() => removeGroup(selectedGroup.id)}
          />
        ) : selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            currentUser={currentUser}
            onBack={() => setSelectedChat(null)}
            onDelete={() => setChatToDelete(selectedChat)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/40">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
              </div>
              <p className="text-lg">یک چت انتخاب کنید</p>
              <p className="text-sm mt-1">یا کاربری را جستجو کنید</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Chat Modal */}
      {chatToDelete && (
        <DeleteChatModal
          chat={chatToDelete}
          onConfirm={handleDeleteChat}
          onClose={() => setChatToDelete(null)}
        />
      )}
      </div>
    </>
  );
}
