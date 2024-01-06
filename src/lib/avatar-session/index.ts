import { useRef, useState } from "react";
import { useCreateSessionMutation } from "./queries/useCreateSessionMutation"
import { useStartSessionMutation } from "./queries/useStartSessionMutation";
import { useUpdateSessionIceMutation } from "./queries/useUpdateSessionIceMutation";
import { useTalkMutation } from "./queries/useTalkMutation";
import { useVideo } from "./useVideo";

export function useAvatarSession() {
  const { data: createSessionData, isPending: isCreateSessionPending, mutateAsync: createSession } = useCreateSessionMutation();
  const { isPending: isStartSessionPending, mutateAsync: startSession } = useStartSessionMutation();
  const { isPending: isUpdateIcePending, mutateAsync: updateSessionIce } = useUpdateSessionIceMutation();
  const { isPending: isTalkPending, mutateAsync: sendTalk } = useTalkMutation();

  const video = useVideo({
    idleSrc: 'public/idle.mp4'
  });

  const intervalRef = useRef<number | null>(null);
  const lastBytesReceivedRef = useRef<number>(0);

  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [_, setForceRender] = useState(0);


  const createConnectionHandler = <E extends Event>(handler: (e: E) => void) => (e: E) => {
    setForceRender(old => old + 1);
    handler(e);
  }

  const cleanUpConnection = () => {
    peerConnection?.close();
    if (intervalRef.current) window.clearInterval(intervalRef.current);
  }

  return {
    connection: peerConnection,
    video,
    start: async () => {
      cleanUpConnection();
      video.playIdle();
      console.log("creating session");
      const { iceServers, offer, sessionId, streamId } = await createSession();
      console.log("created session", { iceServers, offer, sessionId, streamId });

      const connection = new RTCPeerConnection({ iceServers });
      console.log('created peer connection');

      const onIceCandidate = createConnectionHandler((e: RTCPeerConnectionIceEvent) => {
        const { candidate } = e;
        if (!candidate) return;

        const { candidate: candidateStr, sdpMLineIndex, sdpMid } = candidate;
        updateSessionIce({
          candidate: candidateStr,
          sdpMid,
          sdpMLineIndex,
          sessionId,
          streamId
        })
        console.log('ice candidate', e.candidate);
      });

      const onIceGatheringStateChange = createConnectionHandler(() => {
        console.log('ice gathering state changed: ', connection.iceGatheringState);
      });

      const onIceConnectionStateChange = createConnectionHandler(() => {
        console.log('ice connection state changed: ', connection.iceConnectionState);
        if (connection.iceConnectionState === 'failed' || connection.iceConnectionState === 'closed') {
          console.error('ice connection interupted: ', connection.iceConnectionState);
        }
      });

      const onConnectionStateChange = createConnectionHandler(() => {
        console.log('connection state change: ', connection.connectionState);
      });

      const onSignalingStatechange = createConnectionHandler(() => {
        console.log("signaling state changed: ", connection.signalingState);
      })

      const onTrack = createConnectionHandler((e: RTCTrackEvent) => {

        if (!e.track) return;
        let statsIntervalId = window.setInterval(async () => {
          const stats = await connection.getStats(e.track);
          stats.forEach((report) => {
            if (report.type === 'inbound-rtp' && report.mediaType === 'video') {

              const receivedMoreBytes = report.bytesReceived > lastBytesReceivedRef.current;

              const videoStatusChanged = video.videoPropertiesRef.current.streaming !== receivedMoreBytes;

              if (videoStatusChanged) {
                video.videoPropertiesRef.current.streaming = receivedMoreBytes;
                if (receivedMoreBytes) {
                  video.stream(e.streams[0]);
                } else {
                  video.playIdle();
                }
              }

              lastBytesReceivedRef.current = report.bytesReceived;
            }
          });
        }, 500);

        intervalRef.current = statsIntervalId;
      });

      connection.addEventListener("icecandidate", onIceCandidate, true);
      connection.addEventListener("icegatheringstatechange", onIceGatheringStateChange, true);
      connection.addEventListener("iceconnectionstatechange", onIceConnectionStateChange, true);
      connection.addEventListener("connectionstatechange", onConnectionStateChange, true);
      connection.addEventListener("signalingstatechange", onSignalingStatechange, true);
      connection.addEventListener("track", onTrack, true);

      await connection.setRemoteDescription(offer);
      console.log('setting remote description with offer', offer);

      const sessionClientAnswer = await connection.createAnswer();

      await connection.setLocalDescription(sessionClientAnswer);
      console.log('setting local description with answer', sessionClientAnswer);


      await startSession({
        answer: sessionClientAnswer,
        sessionId,
        streamId
      });
      console.log('sdp answer sent');

      setPeerConnection(connection);
    },
    talk: (text: string) => {
      if (!peerConnection || !createSessionData?.sessionId || !createSessionData?.streamId) return;
      sendTalk({
        sessionId: createSessionData.sessionId,
        streamId: createSessionData.streamId,
        text,
      });
    },
    isTalkLoading: isTalkPending,
    isConnectionLoading: isCreateSessionPending || isStartSessionPending || isUpdateIcePending,
    _data: {
      createSessionData,
    },
  };
}