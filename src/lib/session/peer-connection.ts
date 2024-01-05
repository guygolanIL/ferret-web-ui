const onIceGatheringStateChange = console.log;
const onIceCandidate = console.log;
const onIceConnectionStateChange = console.log;
const onConnectionStateChange = console.log;
const onSignalingStateChange = console.log;
const onTrack = console.log;

export function createPeerConnection(iceServers: any) {
  const peerConnection = new RTCPeerConnection({ iceServers });

  peerConnection.addEventListener('icegatheringstatechange', onIceGatheringStateChange, true);
  peerConnection.addEventListener('icecandidate', onIceCandidate, true);
  peerConnection.addEventListener('iceconnectionstatechange', onIceConnectionStateChange, true);
  peerConnection.addEventListener('connectionstatechange', onConnectionStateChange, true);
  peerConnection.addEventListener('signalingstatechange', onSignalingStateChange, true);
  peerConnection.addEventListener('track', onTrack, true);

  return peerConnection;
}