'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ScreenShare,
  UserPlus,
  X,
} from 'lucide-react';

export default function VideoCall() {
  const { isCallActive, activeCall, setIsCallActive, setActiveCall, currentUser } = useAppStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isCallActive && activeCall?.status === 'calling') {
      // Simulate call connection after 3 seconds
      const timer = setTimeout(() => {
        setIsConnected(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isCallActive, activeCall]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setActiveCall(null);
    setIsConnected(false);
    setCallDuration(0);
  };

  if (!isCallActive || !activeCall) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={cn(
            'relative bg-gradient-to-br from-[#0f0f23] to-[#1a1a2e] rounded-3xl overflow-hidden shadow-2xl',
            isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-2xl aspect-video'
          )}
        >
          {/* Remote Video (Full Background) */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
            {activeCall.type === 'video' && isVideoEnabled ? (
              <div className="w-full h-full flex items-center justify-center">
                {/* Placeholder for remote video */}
                <div className="text-center">
                  <Avatar className="w-32 h-32 mx-auto mb-4 ring-4 ring-white/20">
                    <AvatarImage src={activeCall.receiverAvatar} />
                    <AvatarFallback className="bg-[#0088cc] text-4xl">
                      {activeCall.receiverName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-white text-xl font-medium">{activeCall.receiverName}</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Avatar className="w-40 h-40 ring-4 ring-white/20">
                  <AvatarImage src={activeCall.receiverAvatar} />
                  <AvatarFallback className="bg-[#0088cc] text-5xl">
                    {activeCall.receiverName[0]}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>

          {/* Local Video (Picture-in-Picture) */}
          {activeCall.type === 'video' && isVideoEnabled && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-4 right-4 w-32 h-44 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl overflow-hidden shadow-lg border border-white/10"
            >
              <div className="w-full h-full flex items-center justify-center">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={currentUser.avatar} />
                  <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                </Avatar>
              </div>
            </motion.div>
          )}

          {/* Header */}
          <div className="absolute top-0 right-0 left-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-white/30">
                  <AvatarImage src={activeCall.receiverAvatar} />
                  <AvatarFallback>{activeCall.receiverName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white font-semibold text-lg">
                    {activeCall.receiverName}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {!isConnected && (
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        در حال تماس...
                      </span>
                    )}
                    {isConnected && (
                      <span className="text-green-400">{formatDuration(callDuration)}</span>
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="text-white hover:bg-white/10"
              >
                {isFullscreen ? (
                  <Minimize className="w-5 h-5" />
                ) : (
                  <Maximize className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Call Type Badge */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2',
                activeCall.type === 'video'
                  ? 'bg-purple-500/30 text-purple-200'
                  : 'bg-green-500/30 text-green-200'
              )}
            >
              {activeCall.type === 'video' ? (
                <>
                  <Video className="w-4 h-4" />
                  تماس تصویری
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  تماس صوتی
                </>
              )}
            </motion.div>
          </div>

          {/* Audio Visualization */}
          {!isConnected && activeCall.type === 'audio' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-end gap-1 h-20">
                {Array.from({ length: 15 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 bg-gradient-to-t from-[#0088cc] to-[#229ED9] rounded-full"
                    animate={{
                      height: [20, 60, 40, 80, 30, 20],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-0 right-0 left-0 p-6 bg-gradient-to-t from-black/80 to-transparent"
          >
            <div className="flex items-center justify-center gap-3">
              {/* Mute Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className={cn(
                  'w-12 h-12 rounded-full',
                  isMuted ? 'bg-red-500/30 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'
                )}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>

              {/* Video Toggle (only for video calls) */}
              {activeCall.type === 'video' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  className={cn(
                    'w-12 h-12 rounded-full',
                    !isVideoEnabled ? 'bg-red-500/30 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'
                  )}
                >
                  {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
              )}

              {/* Speaker */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSpeakerMuted(!isSpeakerMuted)}
                className={cn(
                  'w-12 h-12 rounded-full',
                  isSpeakerMuted ? 'bg-red-500/30 text-red-400' : 'bg-white/10 text-white hover:bg-white/20'
                )}
              >
                {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>

              {/* End Call Button */}
              <Button
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </Button>

              {/* Screen Share (only for video calls) */}
              {activeCall.type === 'video' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ScreenShare className="w-5 h-5" />
                </Button>
              )}

              {/* Add Participant */}
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <UserPlus className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
