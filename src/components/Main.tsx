import { useState } from "react";
import { useAvatarSession } from "../lib/avatar-session";
import { ConnectionDetails } from "./ConnectionDetails";
import { VideoFeed } from "./VideoFeed";

export function Main() {
	const [text, setText] = useState("");
	const session = useAvatarSession();

	return (
		<div style={{ display: "flex", height: '100vh' }}>
			<div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20, boxShadow: "4px 0px 5px 0px rgb(235 235 235)" }}>
				<button disabled={session.connection?.connectionState === 'connected'} onClick={session.start}>Create session</button>
				<div style={{ display: 'flex', gap: 20 }}>
					<input value={text} type="text" onChange={(e) => setText(e.target.value)} />
					<button
						disabled={!text || session.connection?.iceConnectionState !== 'connected' || session.isTalkLoading}
						onClick={() => session.talk(text)}
					>
						Send
					</button>
				</div>
				<ConnectionDetails connection={session.connection} />
			</div>

			<div style={{
				display: 'flex',
				flex: 1,
				justifyContent: 'center',
				alignItems: "center",
				lineBreak: 'anywhere',
				padding: '50px'
			}}>
				<VideoFeed />
			</div>

		</div>
	);
}