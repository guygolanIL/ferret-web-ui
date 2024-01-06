import { ElementRef, useRef } from "react";

export function useVideo({ idleSrc }: { idleSrc: string }) {
    const videoElRef = useRef<ElementRef<'video'> | null>(null);
    const videoPropertiesRef = useRef<{ streaming: boolean }>({ streaming: false });

    return {
        videoElRef,
        videoPropertiesRef,
        playIdle: () => {
            if (!videoElRef.current) return;
            videoElRef.current.srcObject = null;
            videoElRef.current.src = idleSrc;
            videoElRef.current.loop = true;
            videoElRef.current.play();
        },
        stream: (stream: any) => {
            if (!stream || !videoElRef.current) return;

            videoElRef.current.srcObject = stream;
            videoElRef.current.loop = false;

            // safari hotfix
            if (videoElRef.current.paused) {
                videoElRef.current
                    .play()
                    .then((_) => { })
                    .catch((_) => { });
            }
        }
    }
}