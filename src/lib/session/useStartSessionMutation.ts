import { useMutation } from "@tanstack/react-query";
import { client } from "../axios";


export function useStartSessionMutation() {
    return useMutation({
        mutationFn: async ({ answer, sessionId }: { answer: RTCSessionDescriptionInit, sessionId: string }) => {
            const res = await client.post('/session/', {
                answer,
                sessionId,
            });

            return res.data;
        },
    });
}