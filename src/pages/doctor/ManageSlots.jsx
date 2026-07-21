import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Sidebar, Avatar } from "../../components";
import { useApi, useAction } from "../../hooks/useApi";
import MedecinService from "../../services/MedecinService";
import RendezVousService from "../../services/RendezVousService";
import { BG } from "../../styles/tokens";

const G      = "linear-gradient(90deg,#1565c0,#1e88e5)";
const HEURES = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","14:00","14:30","15:00","15:30","16:00","16:30","17:00"];
const MOIS   = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export default function ManageSlots({ onNavigate }) {
  const { user } = useAuth();
  const { data, loading, refetch }         = useApi(() => MedecinService.getDisponibilites());
  const { data: rdvData }                  = useApi(() => RendezVousService.liste());
  const { execute: save, loading: saving } = useAction((payload) =>
    MedecinService.updateDisponibilites(payload)
  );

  const today = new Date();
  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots,        setSlots]        = useState({});
  const [notes,        setNotes]        = useState("");
  const [newHeure,     setNewHeure]     = useState("08:00");
  const [saveOk,       setSaveOk]       = useState(false);

  const rdvs = rdvData?.data ?? [];

  useEffect(() => {
    if (!data?.disponibilites) return;
    try {
      const parsed = JSON.parse(data.disponibilites);
      const s      = parsed.slots || {};
      const isOldFormat = Object.keys(s).some(key =>
        ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].some(j => key.startsWith(j))
      );
      if (isOldFormat) {
        setSlots({});
        setNotes("");
        MedecinService.updateDisponibilites(JSON.stringify({ slots: {}, notes: "" }));
      } else {
        setSlots(s);
        setNotes(parsed.notes || "");
      }
    } catch {
      setNotes(data.disponibilites || "");
    }
  }, [data]);

  function isReserved(date, heure) {
    return rdvs.some(rdv => {
      const d   = new Date(rdv.date_heure);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,"0")}-${String(d.getUTCDate()).padStart(2,"0")}`;
      const h   = `${String(d.getUTCHours()).padStart(2,"0")}:${String(d.getUTCMinutes()).padStart(2,"0")}`;
      return key === date && h === heure && ["en_attente","confirme"].includes(rdv.statut);
    });
  }

  function addSlot() {
    if (!selectedDate) return alert("Sélectionnez une date sur le calendrier.");
    const key = `${selectedDate}-${newHeure}`;
    if (slots[key] !== undefined) return alert("Ce créneau existe déjà.");
    setSlots(prev => ({ ...prev, [key]: true }));
  }

  function removeSlot(key) {
    setSlots(prev => { const n = { ...prev }; delete n[key]; return n; });
  }

  async function handleSave() {
    try {
      await save(JSON.stringify({ slots, notes }));
      setSaveOk(true);
      refetch();
      setTimeout(() => setSaveOk(false), 3000);
    } catch (e) { alert(e.message); }
  }

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y-1); }
    else setCurrentMonth(m => m-1);
  }
  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y+1); }
    else setCurrentMonth(m => m+1);
  }

  function getDaysInMonth(year, month) {
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();
    const total    = new Date(year, month+1, 0).getDate();
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay-1); i++) days.push(null);
    for (let d = 1; d <= total; d++) days.push(d);
    return days;
  }

  const days = getDaysInMonth(currentYear, currentMonth);

  function formatDate(day) {
    return `${currentYear}-${String(currentMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  }

  function hasSlot(day) {
    if (!day) return false;
    const date = formatDate(day);
    return Object.keys(slots).some(k => k.startsWith(date) && slots[k]);
  }

  const slotsByDate = {};
  Object.keys(slots).forEach(key => {
    if (!slots[key]) return;
    const parts = key.split("-");
    const heure = parts.pop();
    const date  = parts.join("-");
    if (!slotsByDate[date]) slotsByDate[date] = [];
    slotsByDate[date].push({ heure, key });
  });
  const allDates = Object.keys(slotsByDate).sort();

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", background:BG }}>

      {/* Topbar */}
      <div style={{ background:G, height:46, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:26, height:26, borderRadius:6, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>💙</div>
          <span style={{ fontSize:14, fontWeight:500, color:"#fff" }}>Kibara-<span style={{ color:"#f4a61d" }}>Santé</span></span>
          <span style={{ color:"rgba(255,255,255,0.5)", margin:"0 4px", fontSize:13 }}>›</span>
          <span style={{ fontSize:13, color:"rgba(255,255,255,0.8)" }}>Accueil</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:"#fff", fontSize:18 }}>🔔</span>
          {/* ✅ Avatar avec photo */}
          <Avatar user={user} size={30} fontSize={11} />
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <Sidebar role="doctor" page="manage-slots" onNavigate={onNavigate} />

        <main style={{ flex:1, overflowY:"auto", padding:16 }}>

          {/* Titre */}
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <h1 style={{ fontSize:24, fontWeight:600, color:"#1a3a5c" }}>Gérer mes créneaux</h1>
            <p style={{ fontSize:14, color:"#1565c0", marginTop:4 }}>Sélectionnez une date pour ajouter des créneaux</p>
          </div>

          {saveOk && (
            <div style={{ background:"#dcfce7", color:"#166534", borderRadius:8, padding:"10px 14px", marginBottom:12, fontSize:14, textAlign:"center" }}>
              ✅ Disponibilités enregistrées avec succès.
            </div>
          )}

          {/* Calendrier */}
          <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", padding:16, marginBottom:14 }}>

            {/* Navigation mois */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <button onClick={prevMonth} style={btnNav}>◀ Mois précédent</button>
              <span style={{ fontSize:16, fontWeight:600, color:"#1565c0" }}>
                {MOIS[currentMonth]} {currentYear}
              </span>
              <button onClick={nextMonth} style={btnNav}>Mois suivant ▶</button>
            </div>

            {/* En-têtes jours */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:6 }}>
              {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(j => (
                <div key={j} style={{ textAlign:"center", fontSize:13, fontWeight:600, color:"#374151", padding:"4px 0" }}>{j}</div>
              ))}
            </div>

            {/* Jours */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
              {days.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const dateStr    = formatDate(day);
                const isToday    = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
                const isSelected = dateStr === selectedDate;
                const hasSl      = hasSlot(day);
                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    style={{
                      textAlign:"center", padding:"8px 4px", borderRadius:8,
                      fontSize:14, cursor:"pointer", fontWeight: isToday ? 700 : 400,
                      background: isSelected ? "#1565c0" : hasSl ? "#dbeafe" : "transparent",
                      color:      isSelected ? "#fff"    : isToday ? "#1565c0" : "#111827",
                      border:     isToday && !isSelected ? "1.5px solid #1565c0" : "1.5px solid transparent",
                    }}
                  >
                    {day}
                    {hasSl && !isSelected && (
                      <div style={{ width:5, height:5, borderRadius:"50%", background:"#1565c0", margin:"2px auto 0" }} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Ajouter créneau */}
            {selectedDate && (
              <div style={{ marginTop:16, padding:"12px 14px", background:"#f0f4f8", borderRadius:8, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <span style={{ fontSize:14, fontWeight:500, color:"#1a3a5c" }}>
                  📅 {new Date(selectedDate).toLocaleDateString("fr-FR", { day:"2-digit", month:"long", year:"numeric" })}
                </span>
                <select value={newHeure} onChange={e => setNewHeure(e.target.value)} style={{ ...inp, width:110, fontSize:14 }}>
                  {HEURES.map(h => <option key={h}>{h}</option>)}
                </select>
                <button onClick={addSlot} style={btnBlue}>➕ Ajouter</button>
              </div>
            )}
          </div>

          {/* Créneaux existants */}
          <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", padding:16, marginBottom:14 }}>
            <h3 style={{ fontSize:16, fontWeight:600, color:"#1565c0", textAlign:"center", marginBottom:14 }}>Créneaux existants</h3>

            {allDates.length === 0 ? (
              <p style={{ color:"#111827", fontSize:14, textAlign:"center" }}>Aucun créneau ajouté.</p>
            ) : allDates.map(date => (
              <div key={date} style={{ marginBottom:16 }}>
                <div style={{ padding:"6px 0", borderBottom:"1px solid #e5e7eb", marginBottom:8 }}>
                  <span style={{ fontSize:14, fontWeight:600, color:"#111827" }}>
                    {new Date(date).toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit", year:"numeric" })}
                  </span>
                </div>
                {slotsByDate[date]
                  .sort((a,b) => a.heure.localeCompare(b.heure))
                  .map(({ heure, key }) => {
                    const reserved = isReserved(date, heure);
                    return (
                      <div key={key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 12px", marginBottom:6, background:"#f8fafd", borderRadius:8, border:"1px solid #e0e7ef" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                          <span style={{ fontSize:14, fontWeight:600, color:"#111827", minWidth:45 }}>{heure}</span>
                          <span style={{
                            padding:"4px 14px", borderRadius:20, fontSize:13, fontWeight:500,
                            background: reserved ? "#fee2e2" : "#dcfce7",
                            color:      reserved ? "#991b1b" : "#166534",
                          }}>
                            {reserved ? "Réservé" : "Disponible"}
                          </span>
                        </div>
                        {!reserved && (
                          <button
                            onClick={() => removeSlot(key)}
                            style={{ padding:"5px 16px", background:"linear-gradient(90deg,#ef4444,#dc2626)", color:"#fff", border:"none", borderRadius:6, fontSize:13, cursor:"pointer", fontWeight:500 }}
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    );
                  })
                }
              </div>
            ))}
          </div>

          {/* Notes + Enregistrer */}
          <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", padding:16 }}>
            <h3 style={{ fontSize:15, fontWeight:500, color:"#1a3a5c", marginBottom:10 }}>📝 Notes complémentaires</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Précisions, exceptions, congés..."
              style={{ width:"100%", padding:"8px 10px", border:"1px solid #d1d5db", borderRadius:7, fontSize:14, resize:"vertical", fontFamily:"inherit", outline:"none", minHeight:70, color:"#111827" }}
            />
            <button onClick={handleSave} disabled={saving} style={{ ...btnBlue, marginTop:10, opacity: saving ? 0.7 : 1 }}>
              {saving ? "Enregistrement..." : "💾 Enregistrer"}
            </button>
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

const inp     = { padding:"7px 10px", border:"1px solid #d1d5db", borderRadius:7, fontSize:13, outline:"none" };
const btnBlue = { padding:"8px 20px", background:"linear-gradient(90deg,#1565c0,#1e88e5)", color:"#fff", border:"none", borderRadius:7, fontSize:14, cursor:"pointer", fontWeight:500 };
const btnNav  = { padding:"7px 16px", background:"linear-gradient(90deg,#1565c0,#1e88e5)", color:"#fff", border:"none", borderRadius:7, fontSize:13, cursor:"pointer", fontWeight:500 };