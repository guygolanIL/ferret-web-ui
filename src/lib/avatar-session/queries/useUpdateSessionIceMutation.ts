import { useMutation } from "@tanstack/react-query";
import { SessionApi, UpdateAvatarStreamSessionIceRequest } from "ferret-api-client";

export function useUpdateSessionIceMutation() {

    return useMutation({
        mutationFn: async (params: UpdateAvatarStreamSessionIceRequest) => {
            const client = new SessionApi();
            const res = await client.sessionIcePost(params);

            return res.data;
        }
    })
}