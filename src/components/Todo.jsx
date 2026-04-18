import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ── Category config ──────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",       label: "All",       color: "#c084fc", bg: "rgba(192,132,252,0.15)" },
  { id: "streaming", label: "Streaming", color: "#60a5fa", bg: "rgba(96,165,250,0.15)"  },
  { id: "events",    label: "Events",    color: "#f472b6", bg: "rgba(244,114,182,0.15)" },
  { id: "merch",     label: "Merch",     color: "#34d399", bg: "rgba(52,211,153,0.15)"  },
  { id: "other",     label: "Other",     color: "#fbbf24", bg: "rgba(251,191,36,0.15)"  },
];

const CONFETTI_COLORS = ["#ff6eb4","#c084fc","#818cf8","#60a5fa","#f472b6","#fbbf24","#34d399"];

// ── Confetti canvas ──────────────────────────────────────────────
function Confetti({ trigger }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    particles.current = Array.from({ length: 130 }, () => ({
      x:      canvas.width / 2 + (Math.random() - 0.5) * 80,
      y:      canvas.height / 2,
      vx:     (Math.random() - 0.5) * 14,
      vy:     -(Math.random() * 11 + 5),
      size:   Math.random() * 8 + 3,
      color:  CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      spin:   (Math.random() - 0.5) * 0.3,
      angle:  Math.random() * Math.PI * 2,
      gravity:0.38,
      life:   1,
      decay:  Math.random() * 0.013 + 0.007,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter((p) => p.life > 0);
      particles.current.forEach((p) => {
        p.x     += p.vx;
        p.vy    += p.gravity;
        p.y     += p.vy;
        p.angle += p.spin;
        p.life  -= p.decay;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });
      if (particles.current.length > 0) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      "absolute",
        inset:         0,
        width:         "100%",
        height:        "100%",
        pointerEvents: "none",
        borderRadius:  "20px",
      }}
    />
  );
}

// ── Star picker ──────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          onClick={(e) => { e.stopPropagation(); onChange(n === value ? 0 : n); }}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{
            fontSize:   "15px",
            cursor:     "pointer",
            color:      (hover || value) >= n ? "#fbbf24" : "rgba(255,255,255,0.2)",
            transition: "color 0.15s",
            userSelect: "none",
          }}
        >★</span>
      ))}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
const Todo = () => {
  const [inputText,    setInputText]    = useState("");
  const [items,        setItems]        = useState([]);
  const [error,        setError]        = useState(false);
  const [showModal,    setShowModal]    = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [itemToEdit,   setItemToEdit]   = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [newCategory,  setNewCategory]  = useState("streaming");
  const [newStars,     setNewStars]     = useState(1);
  const [confettiKey,  setConfettiKey]  = useState(0);
  const prevAllDone = useRef(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("kph-todos"));
    if (stored) setItems(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("kph-todos", JSON.stringify(items));
  }, [items]);

  // Fire confetti once when all missions completed
  useEffect(() => {
    const allDone = items.length > 0 && items.every((i) => i.completed);
    if (allDone && !prevAllDone.current) {
      setConfettiKey((k) => k + 1);
      toast.success("🎊 All missions complete! Ultimate hunter!");
    }
    prevAllDone.current = allDone;
  }, [items]);

  const handleRemove = () => {
    setItems((prev) => prev.filter((_, i) => i !== itemToRemove));
    setShowModal(false);
    toast.error("Mission dropped! 💔");
  };

  const confirmRemove = (index) => { setItemToRemove(index); setShowModal(true); };

  const addItem = () => {
    if (inputText.trim() === "") { setError(true); return; }
    setError(false);
    if (itemToEdit !== null) {
      setItems((prev) => {
        const next = [...prev];
        next[itemToEdit] = { ...next[itemToEdit], text: inputText, category: newCategory, stars: newStars };
        return next;
      });
      setItemToEdit(null);
      toast.success("Mission updated! ✏️");
    } else {
      setItems((prev) => [...prev, { text: inputText, completed: false, category: newCategory, stars: newStars }]);
      toast.success("New mission unlocked! ✨");
    }
    setInputText("");
    setNewCategory("streaming");
    setNewStars(1);
  };

  const handleKeyPress = (e) => { if (e.key === "Enter") addItem(); };

  const toggleCompletion = (index) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], completed: !next[index].completed };
      return next;
    });
  };

  const editItem = (index) => {
    setInputText(items[index].text);
    setNewCategory(items[index].category || "streaming");
    setNewStars(items[index].stars || 1);
    setItemToEdit(index);
  };

  const filtered = (activeFilter === "all" ? items : items.filter((i) => i.category === activeFilter))
    .map((item, _, arr) => ({ ...item, realIndex: items.indexOf(item) }));

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount     = items.length;

  return (
    <div style={{
      minHeight:      "100vh",
      background:     "linear-gradient(135deg,#0f0020 0%,#1a003a 40%,#0a0015 70%,#1e0040 100%)",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      fontFamily:     "'Segoe UI', sans-serif",
      padding:        "2rem 1rem",
      position:       "relative",
      overflow:       "hidden",
    }}>
      {/* BG sparkles */}
      {["8%,12%","82%,8%","4%,72%","92%,60%","48%,4%","68%,88%","22%,92%","58%,18%","35%,55%","75%,35%"].map((pos, i) => {
        const [left, top] = pos.split(",");
        return <div key={i} style={{
          position:     "absolute", left, top,
          width:        i % 2 === 0 ? "5px" : "3px",
          height:       i % 2 === 0 ? "5px" : "3px",
          borderRadius: "50%",
          background:   i % 3 === 0 ? "#ff6eb4" : i % 3 === 1 ? "#c084fc" : "#818cf8",
          opacity:      0.45 + (i % 3) * 0.15,
          pointerEvents:"none",
        }}/>;
      })}

      <div style={{
        maxWidth:     "500px",
        width:        "100%",
        background:   "rgba(255,255,255,0.04)",
        border:       "1px solid rgba(255,110,180,0.25)",
        borderRadius: "20px",
        padding:      "2rem",
        boxShadow:    "0 0 60px rgba(192,132,252,0.12),inset 0 1px 0 rgba(255,255,255,0.07)",
        position:     "relative",
      }}>
        <Confetti trigger={confettiKey} />

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"1.5rem" }}>
          <div style={{ fontSize:"28px", marginBottom:"4px" }}>🎤</div>
          <h1 style={{
            fontSize:             "24px",
            fontWeight:           "900",
            background:           "linear-gradient(90deg,#ff6eb4,#c084fc,#818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
            margin:               "0 0 4px",
            letterSpacing:        "2px",
            textTransform:        "uppercase",
          }}>K-Pop Hunters</h1>
          <p style={{ color:"rgba(192,132,252,0.65)", fontSize:"11px", margin:0, letterSpacing:"1.5px" }}>
            FANDOM MISSION TRACKER ✦
          </p>

          {totalCount > 0 && (
            <div style={{ marginTop:"14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:"10px", color:"rgba(255,255,255,0.35)", marginBottom:"5px", letterSpacing:"1px" }}>
                <span>MISSIONS CLEARED</span>
                <span>{completedCount} / {totalCount}</span>
              </div>
              <div style={{ height:"4px", background:"rgba(255,255,255,0.08)", borderRadius:"999px", overflow:"hidden" }}>
                <div style={{
                  height:      "100%",
                  width:       `${(completedCount / totalCount) * 100}%`,
                  background:  "linear-gradient(90deg,#ff6eb4,#c084fc)",
                  borderRadius:"999px",
                  transition:  "width 0.5s ease",
                }}/>
              </div>
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display:"flex", gap:"5px", marginBottom:"1rem", flexWrap:"wrap" }}>
          {CATEGORIES.map((cat) => {
            const active = activeFilter === cat.id;
            return (
              <button key={cat.id} onClick={() => setActiveFilter(cat.id)} style={{
                padding:      "4px 12px",
                borderRadius: "999px",
                border:       `1px solid ${active ? cat.color : "rgba(255,255,255,0.1)"}`,
                background:   active ? cat.bg : "transparent",
                color:        active ? cat.color : "rgba(255,255,255,0.4)",
                fontSize:     "11px",
                fontWeight:   "700",
                cursor:       "pointer",
                letterSpacing:"0.5px",
                transition:   "all 0.2s",
              }}>{cat.label}</button>
            );
          })}
        </div>

        {/* Input panel */}
        <div style={{
          background:   "rgba(255,255,255,0.03)",
          border:       "1px solid rgba(255,255,255,0.08)",
          borderRadius: "12px",
          padding:      "12px",
          marginBottom: "1rem",
        }}>
          <div style={{ display:"flex", gap:"8px", marginBottom:"10px" }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => { setInputText(e.target.value); if (error) setError(false); }}
              onKeyPress={handleKeyPress}
              placeholder="Add a new mission..."
              style={{
                flex:         1,
                padding:      "9px 13px",
                background:   "rgba(255,255,255,0.07)",
                border:       `1.5px solid ${error ? "#f87171" : "rgba(192,132,252,0.28)"}`,
                borderRadius: "9px",
                color:        "#fff",
                fontSize:     "14px",
                outline:      "none",
              }}
            />
            <button onClick={addItem} style={{
              background:   "linear-gradient(135deg,#ff6eb4,#c084fc)",
              border:       "none",
              borderRadius: "9px",
              color:        "#fff",
              fontSize:     "13px",
              fontWeight:   "800",
              padding:      "9px 18px",
              cursor:       "pointer",
              whiteSpace:   "nowrap",
            }}>
              {itemToEdit !== null ? "Update" : "+ Add"}
            </button>
          </div>

          {/* Category + difficulty row */}
          <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap" }}>
            <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)", letterSpacing:"0.8px" }}>TAG:</span>
            {CATEGORIES.filter((c) => c.id !== "all").map((cat) => {
              const sel = newCategory === cat.id;
              return (
                <button key={cat.id} onClick={() => setNewCategory(cat.id)} style={{
                  padding:      "3px 10px",
                  borderRadius: "999px",
                  border:       `1px solid ${sel ? cat.color : "rgba(255,255,255,0.09)"}`,
                  background:   sel ? cat.bg : "transparent",
                  color:        sel ? cat.color : "rgba(255,255,255,0.3)",
                  fontSize:     "10px",
                  fontWeight:   "700",
                  cursor:       "pointer",
                  transition:   "all 0.15s",
                }}>{cat.label}</button>
              );
            })}
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"6px" }}>
              <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)", letterSpacing:"0.8px" }}>DIFF:</span>
              <StarPicker value={newStars} onChange={setNewStars} />
            </div>
          </div>
          {error && <p style={{ color:"#f87171", fontSize:"12px", margin:"8px 0 0" }}>Mission name can't be empty!</p>}
        </div>

        {/* List */}
        <ul style={{ listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"7px" }}>
          {filtered.length === 0 && (
            <li style={{ textAlign:"center", color:"rgba(255,255,255,0.22)", fontSize:"13px", padding:"2rem 0" }}>
              {activeFilter === "all" ? "No missions yet. Start hunting! 🌟" : "No missions in this category."}
            </li>
          )}
          {filtered.map((item) => {
            const cat = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[1];
            return (
              <li key={item.realIndex} style={{
                display:        "flex",
                alignItems:     "center",
                background:     item.completed ? "rgba(192,132,252,0.05)" : "rgba(255,255,255,0.045)",
                border:         `1px solid ${item.completed ? "rgba(192,132,252,0.18)" : "rgba(255,255,255,0.08)"}`,
                borderRadius:   "11px",
                padding:        "10px 12px",
                gap:            "10px",
                transition:     "all 0.2s",
              }}>
                {/* Circle check */}
                <div onClick={() => toggleCompletion(item.realIndex)} style={{
                  width:          "20px",
                  height:         "20px",
                  borderRadius:   "50%",
                  border:         `2px solid ${item.completed ? "#c084fc" : "rgba(255,255,255,0.22)"}`,
                  background:     item.completed ? "linear-gradient(135deg,#ff6eb4,#c084fc)" : "transparent",
                  flexShrink:     0,
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontSize:       "10px",
                  color:          "#fff",
                  cursor:         "pointer",
                  transition:     "all 0.2s",
                }}>
                  {item.completed && "✓"}
                </div>

                {/* Content */}
                <div style={{ flex:1, cursor:"pointer", minWidth:0 }} onClick={() => toggleCompletion(item.realIndex)}>
                  <div style={{
                    fontSize:       "13px",
                    color:          item.completed ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.88)",
                    textDecoration: item.completed ? "line-through" : "none",
                    marginBottom:   "5px",
                    whiteSpace:     "nowrap",
                    overflow:       "hidden",
                    textOverflow:   "ellipsis",
                  }}>{item.text}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <span style={{
                      fontSize:     "10px",
                      fontWeight:   "700",
                      color:        cat.color,
                      background:   cat.bg,
                      border:       `1px solid ${cat.color}33`,
                      borderRadius: "999px",
                      padding:      "1px 8px",
                    }}>{cat.label}</span>
                    <span style={{ fontSize:"12px", color:"#fbbf24", letterSpacing:"1px" }}>
                      {"★".repeat(item.stars || 1)}
                      <span style={{ color:"rgba(255,255,255,0.15)" }}>{"★".repeat(3 - (item.stars || 1))}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display:"flex", gap:"5px", flexShrink:0 }}>
                  <button onClick={() => editItem(item.realIndex)} style={{
                    background:   "rgba(129,140,248,0.15)",
                    border:       "1px solid rgba(129,140,248,0.32)",
                    borderRadius: "7px",
                    color:        "#a5b4fc",
                    fontSize:     "11px",
                    padding:      "4px 9px",
                    cursor:       "pointer",
                    fontWeight:   "700",
                  }}>Edit</button>
                  <button onClick={() => confirmRemove(item.realIndex)} style={{
                    background:   "rgba(248,113,113,0.12)",
                    border:       "1px solid rgba(248,113,113,0.28)",
                    borderRadius: "7px",
                    color:        "#fca5a5",
                    fontSize:     "11px",
                    padding:      "4px 9px",
                    cursor:       "pointer",
                    fontWeight:   "700",
                  }}>Drop</button>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Modal */}
        {showModal && (
          <div style={{
            position:       "fixed",
            inset:          0,
            background:     "rgba(0,0,0,0.75)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            zIndex:         50,
          }}>
            <div style={{
              background:   "#150028",
              border:       "1px solid rgba(255,110,180,0.35)",
              borderRadius: "16px",
              padding:      "1.5rem",
              maxWidth:     "300px",
              width:        "90%",
              boxShadow:    "0 0 30px rgba(192,132,252,0.2)",
              textAlign:    "center",
            }}>
              <div style={{ fontSize:"28px", marginBottom:"8px" }}>💔</div>
              <h2 style={{ color:"#fff", fontSize:"16px", fontWeight:"700", margin:"0 0 6px" }}>Drop this mission?</h2>
              <p style={{ color:"rgba(255,255,255,0.4)", fontSize:"12px", margin:"0 0 1.2rem" }}>
                This mission will be removed from your hunt list.
              </p>
              <div style={{ display:"flex", gap:"10px", justifyContent:"center" }}>
                <button onClick={() => setShowModal(false)} style={{
                  background:   "rgba(255,255,255,0.07)",
                  border:       "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "9px",
                  color:        "rgba(255,255,255,0.55)",
                  padding:      "8px 18px",
                  fontSize:     "13px",
                  cursor:       "pointer",
                  fontWeight:   "600",
                }}>Keep it</button>
                <button onClick={handleRemove} style={{
                  background:   "linear-gradient(135deg,#ff6eb4,#f87171)",
                  border:       "none",
                  borderRadius: "9px",
                  color:        "#fff",
                  padding:      "8px 18px",
                  fontSize:     "13px",
                  cursor:       "pointer",
                  fontWeight:   "800",
                }}>Drop it</button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick draggable pauseOnHover theme="dark" />
      </div>
    </div>
  );
};

export default Todo;
