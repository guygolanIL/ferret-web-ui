import { useCreateSessionMutation } from "../lib/session/useCreateSessionMutation"


export function Main() {
	const { data, mutateAsync } = useCreateSessionMutation();
	return (
		<div>
			<button onClick={() => mutateAsync()}>Create session</button>
			{JSON.stringify(data)}
		</div>
	);
}