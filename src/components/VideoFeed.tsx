export function VideoFeed(props: { videoRef: React.Ref<HTMLVideoElement> }) {
    return <video
        ref={props.videoRef}
        style={{ aspectRatio: 1, borderRadius: "50%", width: 400, height: 400 }}
    />
}