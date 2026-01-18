"use client";

import { useEffect, useRef, useState } from "react";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VideoRoomProps {
  roomName: string;
  token: string;
  onDisconnect?: () => void;
}

export function VideoRoom({ roomName, token, onDisconnect }: VideoRoomProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [participants, setParticipants] = useState<Array<{ id: string; name: string }>>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize video room connection
    // For now, simulate connection immediately
    // In production, integrate with LiveKit SDK using the token
    const initVideo = async () => {
      try {
        // Try to get user media
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        setIsConnected(true);
        setParticipants([{ id: "1", name: "You" }]);
      } catch (error) {
        console.warn("Could not access camera/microphone:", error);
        // Still show as connected even if media access fails
        setIsConnected(true);
        setParticipants([{ id: "1", name: "You" }]);
      }
    };

    initVideo();

    // Cleanup on unmount
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      setIsConnected(false);
    };
  }, [roomName, token]);

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // In real implementation, toggle camera stream
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // In real implementation, toggle microphone
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    if (onDisconnect) {
      onDisconnect();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full bg-black">
      <div className="border-b border-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-white" />
          <span className="text-white font-semibold">Video Room: {roomName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleVideo}
            className="text-white hover:bg-gray-800"
          >
            {isVideoEnabled ? (
              <Video className="w-4 h-4" />
            ) : (
              <VideoOff className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAudio}
            className="text-white hover:bg-gray-800"
          >
            {isAudioEnabled ? (
              <Mic className="w-4 h-4" />
            ) : (
              <MicOff className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDisconnect}
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            Leave
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {isConnected ? (
          <div className="w-full h-full flex flex-col gap-4">
            {/* Main video area */}
            <div className="flex-1 bg-gray-900 rounded-lg flex items-center justify-center relative">
              {isVideoEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white text-2xl font-semibold">
                      {participants[0]?.name?.[0] || "U"}
                    </span>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-sm">
                {participants[0]?.name || "You"}
              </div>
            </div>

            {/* Participants list */}
            {participants.length > 1 && (
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Participants ({participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-2 text-white text-sm"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                          {participant.name[0]}
                        </div>
                        <span>{participant.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-white text-center">
            <p>Connecting to video room...</p>
          </div>
        )}
      </div>
    </div>
  );
}
