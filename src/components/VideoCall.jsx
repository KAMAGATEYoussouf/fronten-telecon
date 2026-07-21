import { useEffect, useRef } from "react";

export default function VideoCall({ rdvId, displayName, onHangup }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    function handleMessage(event) {
      if (event.origin !== "https://meet.jit.si") return;
      if (
        event.data?.action === "hangup" ||
        event.data?.name  === "readyToClose" ||
        event.data?.name  === "videoConferenceLeft"
      ) {
        onHangup();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onHangup]);

  // ✅ Nouveau roomName pour éviter le lobby
  const roomName = `kibarasante${rdvId}v2`;
  const params = [
    `userInfo.displayName="${encodeURIComponent(displayName)}"`,
    "config.prejoinPageEnabled=false",
    "config.disableDeepLinking=true",
    "config.startWithVideoMuted=false",
    "config.startWithAudioMuted=false",
    "config.resolution=720",
    "config.constraints.video.height.ideal=720",
    "interfaceConfig.SHOW_JITSI_WATERMARK=false",
    "interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false",
    "interfaceConfig.SHOW_POWERED_BY=false",
    "interfaceConfig.SHOW_BRAND_WATERMARK=false",
  ].join("&");

  const src = `https://meet.jit.si/${roomName}#${params}`;

  return (
    <div style={{ position:"relative", width:"100%", height:400, borderRadius:10, overflow:"hidden", border:"1px solid #e5e7eb" }}>

      <iframe
        ref={iframeRef}
        src={src}
        style={{ width:"100%", height:"100%", border:"none" }}
        allow="camera *; microphone *; fullscreen *; display-capture *; autoplay *; clipboard-write"
        allowFullScreen
        title="Appel vidéo Kibara-Santé"
      />

      {/* Overlay logo */}
      <div style={{
        position:"absolute", top:0, left:0,
        width:120, height:48,
        background:"#1a3a5c",
        zIndex:10,
        display:"flex", alignItems:"center", justifyContent:"center", gap:6,
      }}>
        <span style={{ fontSize:14 }}>💙</span>
        <span style={{ fontSize:15, fontWeight:500, color:"#fff" }}>
          Kibara-<span style={{ color:"#f4a61d" }}>Santé</span>
        </span>
      </div>

      {/* Bouton raccrocher */}
      <button
        onClick={onHangup}
        style={{
          position:"absolute", bottom:14, left:"50%", transform:"translateX(-50%)",
          padding:"8px 28px",
          background:"linear-gradient(90deg,#ef4444,#dc2626)",
          color:"#fff", border:"none", borderRadius:20,
          fontSize:13, cursor:"pointer", fontWeight:500,
          zIndex:10, boxShadow:"0 2px 8px rgba(0,0,0,0.4)"
        }}
      >
        📵 Raccrocher
      </button>

    </div>
  );
}