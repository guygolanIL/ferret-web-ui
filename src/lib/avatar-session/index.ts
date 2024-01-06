import { useEffect, useState } from "react";
import { useCreateSessionMutation } from "./queries/useCreateSessionMutation"
import { useStartSessionMutation } from "./queries/useStartSessionMutation";
import { useUpdateSessionIceMutation } from "./queries/useUpdateSessionIceMutation";
import { useTalkMutation } from "./queries/useTalkMutation";

export function useAvatarSession() {
    const { data: createSessionData, isPending: isCreateSessionPending, mutateAsync: createSession } = useCreateSessionMutation();
    const { isPending: isStartSessionPending, mutateAsync: startSession } = useStartSessionMutation();
    const { isPending: isUpdateIcePending, mutateAsync: updateSessionIce } = useUpdateSessionIceMutation();
    const { isPending: isTalkPending, mutateAsync: sendTalk } = useTalkMutation();

    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const [_, setForceRender] = useState(0);

    const createConnectionHandler = <E extends Event>(handler: (e: E) => void) => (e: E) => {
        setForceRender(old => old + 1);
        handler(e);
    }

    useEffect(() => {
        if (!peerConnection || !createSessionData?.sessionId || !createSessionData?.streamId) return;
        const onIceCandidate = createConnectionHandler((e: RTCPeerConnectionIceEvent) => {
            const { candidate } = e;
            if (!candidate) return;

            const { candidate: candidateStr, sdpMLineIndex, sdpMid } = candidate;
            updateSessionIce({
                candidate: candidateStr,
                sdpMid,
                sdpMLineIndex,
                sessionId: createSessionData!.sessionId,
                streamId: createSessionData!.streamId
            })
            console.log('ice candidate', e.candidate);
        });

        const onIceGatheringStateChange = createConnectionHandler(() => {
            console.log('ice gathering state changed: ', peerConnection.iceGatheringState);
        });

        const onIceConnectionStateChange = createConnectionHandler(() => {
            console.log('ice connection state changed: ', peerConnection.iceConnectionState);
            if (peerConnection.iceConnectionState === 'failed' || peerConnection.iceConnectionState === 'closed') {
                console.error('ice connection interupted: ', peerConnection.iceConnectionState);
            }
        });

        const onConnectionStateChange = createConnectionHandler(() => {
            console.log('connection state change: ', peerConnection.connectionState);
        });

        const onSignalingStatechange = createConnectionHandler(() => {
            console.log("signaling state changed: ", peerConnection.signalingState);
        })

        const onTrack = createConnectionHandler((e: RTCTrackEvent) => {
            console.log(e);
        });


        peerConnection.addEventListener("icecandidate", onIceCandidate, true);
        peerConnection.addEventListener("icegatheringstatechange", onIceGatheringStateChange, true);
        peerConnection.addEventListener("iceconnectionstatechange", onIceConnectionStateChange, true);
        peerConnection.addEventListener("connectionstatechange", onConnectionStateChange, true);
        peerConnection.addEventListener("signalingstatechange", onSignalingStatechange, true);
        peerConnection.addEventListener("track", onTrack, true);

        return () => {
            peerConnection?.removeEventListener('icecandidate', onIceCandidate);
            peerConnection?.removeEventListener("icegatheringstatechange", onIceGatheringStateChange);
            peerConnection?.removeEventListener("iceconnectionstatechange", onIceConnectionStateChange);
            peerConnection?.removeEventListener("connectionstatechange", onConnectionStateChange);
            peerConnection?.removeEventListener("signalingstatechange", onSignalingStatechange);
            peerConnection?.removeEventListener('track', onTrack);
        };
    }, [peerConnection, createSessionData?.sessionId, createSessionData?.streamId]);

    return {
        connection: peerConnection,
        start: async () => {
            console.log("creating session");
            const { iceServers, offer, sessionId, streamId } = await createSession();
            console.log("created session", { iceServers, offer, sessionId, streamId });

            const connection = new RTCPeerConnection({ iceServers });
            console.log('created peer connection');
            connection.addEventListener('track', (e) => {

                console.log({ track: event });
                if (!e.track) return;
                let statsIntervalId = setInterval(async () => {
                    const stats = await connection.getStats(e.track);
                    stats.forEach((report) => {
                        console.log({ report });
                    });
                }, 500);


            });
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