"use client";

import { useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  Track,
  type RemoteTrack,
  type RemoteTrackPublication,
  type RemoteParticipant,
} from "livekit-client";
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoRoomProps {
  roomName: string;
  token: string;
  serverUrl?: string | null;
  onDisconnect?: () => void;
}

type Tile = {
  id: string;
  name: string;
  stream: MediaStream | null;
  isLocal: boolean;
};

function isMockToken(token: string) {
  return !token || token.startsWith("mock-token");
}

function bindVideo(el: HTMLVideoElement | null, stream: MediaStream | null) {
  if (!el) return;
  if (el.srcObject !== stream) {
    el.srcObject = stream;
  }
  if (stream) {
    el.play().catch(() => {});
  }
}

export function VideoRoom({ roomName, token, serverUrl, onDisconnect }: VideoRoomProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Connecting…");
  const [isConnected, setIsConnected] = useState(false);

  const localStreamRef = useRef<MediaStream | null>(null);
  const roomRef = useRef<Room | null>(null);
  const mock = isMockToken(token);

  useEffect(() => {
    let cancelled = false;

    const setLocalTile = (stream: MediaStream | null, name = "You", id = "local") => {
      setTiles((prev) => {
        const remotes = prev.filter((t) => !t.isLocal);
        return [{ id, name, stream, isLocal: true }, ...remotes];
      });
    };

    const startLocalPreview = async () => {
      setStatus("Starting camera…");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        setLocalTile(stream);
        setIsConnected(true);
        setStatus(
          mock
            ? "Local camera preview — enable LiveKit for multi-user rooms"
            : "Connected"
        );
        setError(null);
      } catch (err: any) {
        console.warn("Camera/mic error:", err);
        setLocalTile(null);
        setIsConnected(true);
        setError(
          err?.name === "NotAllowedError"
            ? "Camera/mic blocked — allow permissions in the browser address bar, then refresh"
            : `Camera unavailable: ${err?.message || String(err)}`
        );
        setStatus("No camera");
      }
    };

    const mergeRemoteTrack = (
      participant: RemoteParticipant,
      track: RemoteTrack
    ) => {
      if (track.kind !== Track.Kind.Video && track.kind !== Track.Kind.Audio) return;
      setTiles((prev) => {
        const existing = prev.find((t) => t.id === participant.identity);
        const stream = existing?.stream ? existing.stream : new MediaStream();
        if (!stream.getTracks().includes(track.mediaStreamTrack)) {
          stream.addTrack(track.mediaStreamTrack);
        }
        const others = prev.filter((t) => t.id !== participant.identity);
        return [
          ...others,
          {
            id: participant.identity,
            name: participant.name || participant.identity,
            stream,
            isLocal: false,
          },
        ];
      });
    };

    const startLiveKit = async () => {
      const url =
        serverUrl ||
        process.env.NEXT_PUBLIC_LIVEKIT_URL ||
        "ws://localhost:7880";

      setStatus("Connecting to LiveKit…");
      const room = new Room({ adaptiveStream: true, dynacast: true });
      roomRef.current = room;

      room.on(
        RoomEvent.TrackSubscribed,
        (track: RemoteTrack, _pub: RemoteTrackPublication, participant: RemoteParticipant) => {
          mergeRemoteTrack(participant, track);
        }
      );
      room.on(
        RoomEvent.TrackUnsubscribed,
        (track: RemoteTrack, _pub: RemoteTrackPublication, participant: RemoteParticipant) => {
          setTiles((prev) =>
            prev.map((t) => {
              if (t.id !== participant.identity || !t.stream) return t;
              const next = new MediaStream(
                t.stream.getTracks().filter((tr) => tr !== track.mediaStreamTrack)
              );
              return { ...t, stream: next.getTracks().length ? next : null };
            })
          );
        }
      );
      room.on(RoomEvent.ParticipantDisconnected, (p) => {
        setTiles((prev) => prev.filter((t) => t.id !== p.identity));
      });
      room.on(RoomEvent.LocalTrackPublished, () => {
        const stream = new MediaStream();
        room.localParticipant.trackPublications.forEach((pub) => {
          if (pub.track) stream.addTrack(pub.track.mediaStreamTrack);
        });
        if (stream.getTracks().length) {
          localStreamRef.current = stream;
          setLocalTile(stream, room.localParticipant.name || "You", room.localParticipant.identity);
        }
      });

      try {
        await room.connect(url, token);
        if (cancelled) {
          await room.disconnect();
          return;
        }

        await room.localParticipant.setCameraEnabled(true);
        await room.localParticipant.setMicrophoneEnabled(true);

        const localStream = new MediaStream();
        room.localParticipant.trackPublications.forEach((pub) => {
          if (pub.track) localStream.addTrack(pub.track.mediaStreamTrack);
        });
        if (localStream.getTracks().length) {
          localStreamRef.current = localStream;
          setLocalTile(
            localStream,
            room.localParticipant.name || "You",
            room.localParticipant.identity
          );
        } else {
          // Ensure we still show something while LiveKit publishes
          await startLocalPreview();
        }

        room.remoteParticipants.forEach((p) => {
          p.trackPublications.forEach((pub) => {
            if (pub.track) mergeRemoteTrack(p, pub.track);
          });
        });

        setIsConnected(true);
        setStatus("Live multi-user room");
        setError(null);
      } catch (err: any) {
        console.warn("LiveKit connect failed, falling back to local preview:", err);
        setError(
          `LiveKit unavailable (${err?.message || "connection failed"}). Local camera only.`
        );
        await startLocalPreview();
      }
    };

    if (mock) {
      void startLocalPreview();
    } else {
      void startLiveKit();
    }

    return () => {
      cancelled = true;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      const room = roomRef.current;
      roomRef.current = null;
      room?.disconnect().catch(() => {});
      setIsConnected(false);
    };
  }, [roomName, token, serverUrl, mock]);

  const toggleVideo = async () => {
    const next = !isVideoEnabled;
    setIsVideoEnabled(next);
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = next;
    });
    try {
      await roomRef.current?.localParticipant.setCameraEnabled(next);
    } catch {
      // ignore
    }
  };

  const toggleAudio = async () => {
    const next = !isAudioEnabled;
    setIsAudioEnabled(next);
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = next;
    });
    try {
      await roomRef.current?.localParticipant.setMicrophoneEnabled(next);
    } catch {
      // ignore
    }
  };

  const handleDisconnect = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    roomRef.current?.disconnect().catch(() => {});
    roomRef.current = null;
    setIsConnected(false);
    onDisconnect?.();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full bg-zinc-950">
      <div className="border-b border-zinc-800 p-4 flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-white shrink-0" />
            <span className="text-white font-semibold truncate">
              Video · {roomName.slice(0, 8)}
            </span>
          </div>
          <span className={`text-xs ${mock ? "text-amber-400" : "text-emerald-400"}`}>
            {status}
          </span>
          {error ? <span className="text-xs text-red-400">{error}</span> : null}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleVideo}
            className="text-white hover:bg-zinc-800"
          >
            {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAudio}
            className="text-white hover:bg-zinc-800"
          >
            {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDisconnect}>
            <PhoneOff className="w-4 h-4 mr-2" />
            Leave
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-4 overflow-auto">
        {!isConnected ? (
          <div className="h-full flex items-center justify-center text-zinc-300 text-sm">
            Connecting to video room…
          </div>
        ) : (
          <div className="h-full grid gap-3 grid-cols-1 md:grid-cols-2 auto-rows-fr">
            {tiles.map((tile) => {
              const showVideo =
                !!tile.stream && (tile.isLocal ? isVideoEnabled : true);
              return (
                <div
                  key={tile.id}
                  className="relative min-h-[240px] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800"
                >
                  {showVideo ? (
                    <video
                      ref={(el) => bindVideo(el, tile.stream)}
                      autoPlay
                      playsInline
                      muted={tile.isLocal}
                      className="absolute inset-0 w-full h-full object-cover bg-black"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full bg-zinc-700 flex items-center justify-center text-white text-3xl font-semibold">
                        {(tile.name || "?").charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1 rounded text-white text-xs flex items-center gap-1.5">
                    {tile.isLocal ? "You" : tile.name}
                    {!isAudioEnabled && tile.isLocal ? (
                      <MicOff className="w-3 h-3 text-red-400" />
                    ) : null}
                  </div>
                </div>
              );
            })}

            {tiles.length === 0 ? (
              <div className="col-span-full flex items-center justify-center text-zinc-400 text-sm">
                No video yet
              </div>
            ) : null}
          </div>
        )}

        {tiles.length > 1 ? (
          <div className="mt-3 flex items-center gap-2 text-zinc-400 text-xs">
            <Users className="w-3.5 h-3.5" />
            {tiles.length} in room
          </div>
        ) : null}
      </div>
    </div>
  );
}
