export function ConnectionDetails(props: { connection: RTCPeerConnection | null }) {
    return (
        <div style={{ display: "flex", flexDirection: 'column' }}>

            <span style={{ fontWeight: 'bold' }}>Connection details</span>

            <ConnectionDetail
                label="Ice gathering state: "
                status={props.connection?.iceGatheringState}
                variant={props.connection?.iceGatheringState === 'complete' ? 'success' : 'error'}
            />

            <ConnectionDetail
                label="Ice connection state: "
                status={props.connection?.iceConnectionState}
                variant={props.connection?.iceConnectionState === 'connected' ? 'success' : 'error'}
            />

            <ConnectionDetail
                label="Connection state: "
                status={props.connection?.connectionState}
                variant={props.connection?.connectionState === 'connected' ? 'success' : 'error'}
            />

            <ConnectionDetail
                label="Signaling state: "
                status={props.connection?.signalingState}
                variant={props.connection?.signalingState === 'stable' ? 'success' : 'error'}
            />

        </div>
    );
}

function ConnectionDetail({ label, status = "Not started", variant }: { label: string, status?: string, variant: "success" | "error" }) {


    return (
        <div>
            <span
                style={{ fontWeight: 'lighter' }}>
                {label}
            </span>
            {" "}
            <span
                style={{ color: variant === 'success' ? "#51dd51" : '#f36464' }}
            >
                {status}
            </span>
        </div>
    )
}