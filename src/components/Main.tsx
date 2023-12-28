import { useMutation } from "@tanstack/react-query"
import { Configuration, DefaultApi, ImageDataBase64 } from '@guygolanil/ferret-api-client';
import { useState } from "react";

const serverUrl = import.meta.env.API_URL

export function Main() {
	const [receivedImageBase64, setReceivedImageBase64] = useState<string>();
	const [selectedFile, setSelectedFile] = useState<File>();

	const { mutateAsync: upload, isPending } = useMutation({
		mutationFn: async (params: ImageDataBase64) => {
			const api = new DefaultApi(new Configuration({
				basePath: serverUrl
			}));
			const res = await api.uploadImagePost(params);
			return res.data;
		}
	});

	const handleSubmit = () => {
		if (!selectedFile) return
		const reader = new FileReader();

		reader.onloadend = e => {
			const base64Data = e.target?.result?.toString().split(',')[1];
			if (!base64Data) return


			upload({
				imageData: base64Data
			}).then(i => setReceivedImageBase64(i.imageData));
		};

		reader.readAsDataURL(selectedFile as Blob)
	}


	return (
		<div>
			{isPending && "Loading..."}
			<input type="file" onChange={(event) => setSelectedFile(event.target.files?.[0])} />
			<button onClick={handleSubmit}>Submit</button>
			{receivedImageBase64 && <img src={`data:image/jpeg;base64, ${receivedImageBase64}`} />}
		</div>
	)
}