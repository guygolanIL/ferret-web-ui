import { useMutation } from "@tanstack/react-query";
import { SessionApi } from 'ferret-api-client';
export function useStartSessionMutation() {
    return useMutation({
        mutationFn: async ({ answer, sessionId, streamId }: { answer: RTCSessionDescriptionInit, sessionId: string, streamId: string }) => {
            const client = new SessionApi();
            const res = await client.sessionSdpPost({
                answer,
                streamId,
                sessionId,
            });

            return res.data;
        },
    });
}