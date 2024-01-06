import { useMutation } from "@tanstack/react-query";
import { SessionApi, TalkWithAvatarRequest } from "ferret-api-client";

export function useTalkMutation() {
    return useMutation({
        mutationFn: async (params: TalkWithAvatarRequest) => {
            const client = new SessionApi();
            const res = await client.sessionTalkPost(params);
            return res.data;
        }
    })
}