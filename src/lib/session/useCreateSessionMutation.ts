import { useMutation } from "@tanstack/react-query";
import { client } from "../axios";

export function useCreateSessionMutation() {

    return useMutation({
        mutationFn: async () => {
            const res = await client.post(`/session`);
            return res.data;
        },
    });
}