import { useCreateSessionMutation } from "./useCreateSessionMutation"
import { createPeerConnection } from './peer-connection';
import { useStartSessionMutation } from "./useStartSessionMutation";

export function useAvatarSession() {

    const { data: createSessionData, isPending: isCreateSessionPending, mutateAsync: createSession } = useCreateSessionMutation();
    const { data: startSessionData, isPending: isStartSessionPending, mutateAsync: startSession } = useStartSessionMutation();

    return {
        start: async () => {
            const res = await createSession();
            const conn = createPeerConnection(res.iceServers);

            await conn.setRemoteDescription(res.offer);
            const sessionClientAnswer = await conn.createAnswer();
            await conn.setLocalDescription(sessionClientAnswer);

            const response = await startSession({
                answer: sessionClientAnswer,
                sessionId: "hi",
            });

        },
        isLoading: isCreateSessionPending || isStartSessionPending,
        _data: {
            createSessionData,
            startSessionData,
        },
    };
}