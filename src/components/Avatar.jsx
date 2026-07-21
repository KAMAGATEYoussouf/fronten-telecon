export default function Avatar({ user, size = 28, fontSize = 11 }) {
  if (user?.photo_profil) {
    return (
      <img
        src={user.photo_profil}
        alt={`${user?.prenom} ${user?.nom}`}
        style={{
          width:        size,
          height:       size,
          borderRadius: "50%",
          objectFit:    "cover",
          border:       "1.5px solid rgba(255,255,255,0.5)",
        }}
      />
    );
  }

  return (
    <div style={{
      width:          size,
      height:         size,
      borderRadius:   "50%",
      background:     "rgba(255,255,255,0.25)",
      border:         "1.5px solid rgba(255,255,255,0.5)",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      color:          "#fff",
      fontSize:       fontSize,
      fontWeight:     500,
    }}>
      {user?.prenom?.[0]}{user?.nom?.[0]}
    </div>
  );
}