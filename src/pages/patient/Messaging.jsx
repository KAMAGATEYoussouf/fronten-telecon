import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "../../components";
import { useApi } from "../../hooks/useApi";
import { MessageService } from "../../services";
import MedecinService from "../../services/MedecinService";
import api from "../../services/api";
import { BG } from "../../styles/tokens";

const G = "linear-gradient(90deg,#1565c0,#1e88e5)";

export default function Messaging({ onNavigate }) {
  const { user } = useAuth();
  const role = user?.role === "medecin" ? "doctor" : "patient";

  const { data: convsData, loading: loadingConvs, refetch: refetchConvs } =
    useApi(() => MessageService.conversations());

  const { data: medecinData } = useApi(
    () => role === "patient" ? MedecinService.rechercher() : Promise.resolve(null)
  );

  const conversations = convsData ?? [];
  const medecins      = medecinData?.data ?? [];

  const [selectedUser,  setSelectedUser]  = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [loadingMsgs,   setLoadingMsgs]   = useState(false);
  const [newMessage,    setNewMessage]    = useState("");
  const [sending,       setSending]       = useState(false);
  const [error,         setError]         = useState(null);
  const [showNewMsg,    setShowNewMsg]    = useState(false);
  const [searchMedecin, setSearchMedecin] = useState("");

  const messagesEndRef = useRef(null);

  function getInterlocuteur(conv) {
    return conv.expediteur_id === user?.id ? conv.destinataire : conv.expediteur;
  }

  // ✅ silent = true → pas de "Chargement..." (pour le polling)
  async function loadMessages(utilisateurId, silent = false) {
    if (!utilisateurId) return;
    if (!silent) setLoadingMsgs(true);
    setError(null);
    try {
      const data = await api.get(`/messages/${utilisateurId}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
      setMessages([]);
    } finally {
      if (!silent) setLoadingMsgs(false);
    }
  }

  async function selectConversation(conv) {
    const inter = getInterlocuteur(conv);
    setSelectedUser(inter);
    await loadMessages(inter?.id);
  }

  async function startNewConversation(medecin) {
    const interlocuteur = medecin.utilisateur;
    setSelectedUser(interlocuteur);
    setShowNewMsg(false);
    setSearchMedecin("");
    await loadMessages(interlocuteur?.id);
  }

  async function handleSend() {
    if (!newMessage.trim() || !selectedUser) return;
    setSending(true);
    setError(null);
    try {
      await MessageService.envoyer(selectedUser.id, newMessage.trim());
      setNewMessage("");
      await loadMessages(selectedUser.id, true); // ✅ silencieux après envoi
      refetchConvs();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  // ✅ Scroll en bas uniquement quand nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages.length]);

  // ✅ Polling silencieux toutes les 5 secondes
  useEffect(() => {
    if (!selectedUser) return;
    const interval = setInterval(() => {
      loadMessages(selectedUser.id, true); // ✅ silencieux = pas de clignotement
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedUser?.id]);

  function formatTime(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" });
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("fr-FR", { day:"2-digit", month:"short" });
  }

  const filteredMedecins = medecins.filter(m => {
    const nom = `${m.utilisateur?.prenom} ${m.utilisateur?.nom}`.toLowerCase();
    return nom.includes(searchMedecin.toLowerCase());
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:BG }}>

      {/* Topbar */}
      <div style={{ background:G, height:46, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, borderRadius:6, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>💙</div>
          <span style={{ fontSize:14, fontWeight:500, color:"#fff" }}>Kibara-<span style={{ color:"#f4a61d" }}>Santé</span></span>
          <span style={{ color:"rgba(255,255,255,0.5)", margin:"0 4px", fontSize:13 }}>›</span>
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.8)" }}>Messagerie</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:"#fff", fontSize:18 }}>🔔</span>
          <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,0.25)", border:"1.5px solid rgba(255,255,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11 }}>
            {user?.prenom?.[0]}{user?.nom?.[0]}
          </div>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <Sidebar role={role} page="messaging" onNavigate={onNavigate} />

        <main style={{ flex:1, display:"flex", overflow:"hidden", position:"relative" }}>

          {/* ── Modal nouveau message ── */}
          {showNewMsg && (
            <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.4)", zIndex:50, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ background:"#fff", borderRadius:14, width:420, maxHeight:"70vh", display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
                <div style={{ background:G, padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ color:"#fff", fontSize:15, fontWeight:500 }}>✉️ Nouveau message</span>
                  <button onClick={() => { setShowNewMsg(false); setSearchMedecin(""); }} style={{ background:"none", border:"none", color:"#fff", fontSize:20, cursor:"pointer", lineHeight:1 }}>✕</button>
                </div>
                <div style={{ padding:"12px 16px", borderBottom:"1px solid #e5e7eb" }}>
                  <input
                    type="text"
                    placeholder="🔍 Rechercher un médecin..."
                    value={searchMedecin}
                    onChange={e => setSearchMedecin(e.target.value)}
                    autoFocus
                    style={{ width:"100%", padding:"9px 12px", border:"1px solid #d1d5db", borderRadius:8, fontSize:14, outline:"none", color:"#111827" }}
                  />
                </div>
                <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
                  {filteredMedecins.length === 0 ? (
                    <p style={{ color:"#111827", fontSize:14, padding:16, textAlign:"center" }}>Aucun médecin trouvé.</p>
                  ) : filteredMedecins.map(m => (
                    <div
                      key={m.id}
                      onClick={() => startNewConversation(m)}
                      style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", cursor:"pointer", borderBottom:"1px solid #f3f4f6" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#EFF6FF"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                    >
                      {m.utilisateur?.photo_profil ? (
                        <img src={m.utilisateur.photo_profil} alt="photo" style={{ width:44, height:44, borderRadius:"50%", objectFit:"cover", border:"2px solid #e5e7eb", flexShrink:0 }} />
                      ) : (
                        <div style={{ width:44, height:44, borderRadius:"50%", background:G, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:15, fontWeight:500, flexShrink:0 }}>
                          {m.utilisateur?.prenom?.[0]}{m.utilisateur?.nom?.[0]}
                        </div>
                      )}
                      <div>
                        <p style={{ margin:0, fontSize:15, fontWeight:500, color:"#111827" }}>Dr. {m.utilisateur?.prenom} {m.utilisateur?.nom}</p>
                        <p style={{ margin:0, fontSize:13, color:"#374151" }}>{m.specialite?.nom} — {m.region?.nom}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Liste conversations ── */}
          <div style={{ width:280, background:"#fff", borderRight:"1px solid #e5e7eb", display:"flex", flexDirection:"column", flexShrink:0 }}>
            <div style={{ background:G, padding:"12px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ color:"#fff", fontSize:15, fontWeight:500 }}>✉️ Conversations</span>
              {role === "patient" && (
                <button
                  onClick={() => setShowNewMsg(true)}
                  style={{ background:"rgba(255,255,255,0.2)", border:"1px solid rgba(255,255,255,0.4)", color:"#fff", borderRadius:6, padding:"4px 10px", fontSize:13, cursor:"pointer", fontWeight:500 }}
                >
                  ✏️ Nouveau
                </button>
              )}
            </div>

            <div style={{ flex:1, overflowY:"auto" }}>
              {loadingConvs ? (
                <p style={{ color:"#111827", fontSize:14, padding:16, textAlign:"center" }}>Chargement...</p>
              ) : conversations.length === 0 ? (
                <div style={{ padding:16, textAlign:"center" }}>
                  <p style={{ color:"#111827", fontSize:14, marginBottom:8 }}>Aucune conversation.</p>
                  {role === "patient" && (
                    <button
                      onClick={() => setShowNewMsg(true)}
                      style={{ padding:"8px 16px", background:G, color:"#fff", border:"none", borderRadius:7, fontSize:13, cursor:"pointer" }}
                    >
                      ✏️ Écrire à un médecin
                    </button>
                  )}
                </div>
              ) : conversations.map((conv, i) => {
                const inter      = getInterlocuteur(conv);
                const isSelected = selectedUser?.id === inter?.id;
                return (
                  <div
                    key={i}
                    onClick={() => selectConversation(conv)}
                    style={{
                      padding:"12px 14px", cursor:"pointer",
                      borderBottom:"1px solid #f3f4f6",
                      background:  isSelected ? "#EFF6FF" : "#fff",
                      borderLeft:  isSelected ? "3px solid #1565c0" : "3px solid transparent",
                    }}
                  >
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:40, height:40, borderRadius:"50%", background:G, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:500, flexShrink:0 }}>
                        {inter?.prenom?.[0]}{inter?.nom?.[0]}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:14, fontWeight:500, color:"#111827", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          {inter?.role === "medecin" ? "Dr. " : ""}{inter?.prenom} {inter?.nom}
                        </div>
                        <div style={{ fontSize:12, color:"#374151", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", marginTop:2 }}>
                          {conv.contenu?.substring(0, 35)}{(conv.contenu?.length ?? 0) > 35 ? "..." : ""}
                        </div>
                      </div>
                      <div style={{ fontSize:11, color:"#374151", flexShrink:0 }}>
                        {formatDate(conv.date_envoi ?? conv.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Zone messages ── */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

            {!selectedUser ? (
              <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12, background:"#f8fafd" }}>
                <div style={{ fontSize:52 }}>✉️</div>
                <p style={{ fontSize:16, color:"#111827", fontWeight:500 }}>Sélectionnez une conversation</p>
                <p style={{ fontSize:14, color:"#374151" }}>Choisissez une conversation à gauche pour commencer.</p>
                {role === "patient" && (
                  <button
                    onClick={() => setShowNewMsg(true)}
                    style={{ padding:"10px 24px", background:G, color:"#fff", border:"none", borderRadius:8, fontSize:14, cursor:"pointer", fontWeight:500, marginTop:8 }}
                  >
                    ✏️ Écrire à un médecin
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* En-tête */}
                <div style={{ background:"#fff", padding:"12px 16px", borderBottom:"1px solid #e5e7eb", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", background:G, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14, fontWeight:500 }}>
                    {selectedUser?.prenom?.[0]}{selectedUser?.nom?.[0]}
                  </div>
                  <div>
                    <p style={{ margin:0, fontSize:15, fontWeight:600, color:"#111827" }}>
                      {selectedUser?.role === "medecin" ? "Dr. " : ""}{selectedUser?.prenom} {selectedUser?.nom}
                    </p>
                    <p style={{ margin:0, fontSize:13, color:"#374151" }}>
                      {selectedUser?.role === "medecin" ? "Médecin" : "Patient"}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div style={{ flex:1, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:10, background:"#f8fafd" }}>
                  {/* ✅ Chargement uniquement au premier chargement */}
                  {loadingMsgs ? (
                    <p style={{ color:"#111827", textAlign:"center", fontSize:14 }}>Chargement...</p>
                  ) : messages.length === 0 ? (
                    <div style={{ textAlign:"center", marginTop:"4rem" }}>
                      <p style={{ color:"#111827", fontSize:14 }}>Aucun message. Commencez la conversation !</p>
                    </div>
                  ) : messages.map((msg, i) => {
                    const isMine = msg.expediteur_id === user?.id;
                    return (
                      <div key={i} style={{ display:"flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                        <div style={{
                          maxWidth:"70%", padding:"10px 14px",
                          background: isMine ? "#1565c0" : "#fff",
                          color:      isMine ? "#fff"    : "#111827",
                          border:     isMine ? "none"    : "1px solid #e5e7eb",
                          borderRadius: isMine ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                        }}>
                          <p style={{ margin:0, fontSize:14, lineHeight:1.6 }}>{msg.contenu}</p>
                          <p style={{ margin:"4px 0 0", fontSize:11, opacity:0.75, textAlign:"right" }}>
                            {formatTime(msg.date_envoi ?? msg.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Erreur */}
                {error && (
                  <div style={{ background:"#fee2e2", color:"#991b1b", padding:"8px 16px", fontSize:13 }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* Zone saisie */}
                <div style={{ background:"#fff", padding:"12px 16px", borderTop:"1px solid #e5e7eb", display:"flex", gap:10, alignItems:"flex-end" }}>
                  <textarea
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Écrire un message... (Entrée pour envoyer)"
                    rows={2}
                    style={{ flex:1, padding:"10px 12px", border:"1px solid #d1d5db", borderRadius:10, fontSize:14, resize:"none", fontFamily:"inherit", outline:"none", color:"#111827" }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !newMessage.trim()}
                    style={{
                      padding:"10px 20px", background:G, color:"#fff",
                      border:"none", borderRadius:10, fontSize:14,
                      cursor: sending || !newMessage.trim() ? "not-allowed" : "pointer",
                      fontWeight:500, flexShrink:0,
                      opacity: sending || !newMessage.trim() ? 0.6 : 1,
                    }}
                  >
                    {sending ? "..." : "📤 Envoyer"}
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <div style={{ background:G, padding:10, textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.85)" }}>
        © 2026 <span style={{ color:"#f4a61d" }}>Kibara-Santé</span>. Tous droits réservés.
      </div>
    </div>
  );
}