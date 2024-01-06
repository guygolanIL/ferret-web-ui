import { useMutation } from "@tanstack/react-query";
import { SessionApi } from 'ferret-api-client';

export function useCreateSessionMutation() {
    const sessionApi = new SessionApi();
    return useMutation({
        mutationFn: async () => {
            const res = await sessionApi.sessionPost();
            return res.data;
        },
    });
}