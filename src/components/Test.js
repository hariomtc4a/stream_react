import { useHMSStore, selectPeers } from "@100mslive/react-sdk";

function ActiveSpeaker() {
  const peers = useHMSStore(selectPeers);

  // Find the peer currently speaking (based on isSpeaking or audioLevel)
  const activeSpeaker = peers.find(peer => peer.isSpeaking);

  return (
    <div>
      {activeSpeaker ? (
        <p>🎤 {activeSpeaker.name} is speaking</p>
      ) : (
        <p>No one is speaking right now</p>
      )}
    </div>
  );
}

export default ActiveSpeaker;
