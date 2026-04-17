import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Todo = () => {
  const [inputText, setInputText] = useState("");
  const [items, setItems] = useState([]);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [itemToEdit, setItemToEdit] = useState(null);

  useEffect(() => {
    const storedItems = JSON.parse(localStorage.getItem("todos"));
    if (storedItems) {
      setItems(storedItems);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(items));
  }, [items]);

  const handleRemove = () => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      newItems.splice(itemToRemove, 1);
      return newItems;
    });
    setShowModal(false);
    toast.error("Mission dropped! 💔");
  };

  const confirmRemove = (index) => {
    setItemToRemove(index);
    setShowModal(true);
  };

  const addItem = () => {
    if (inputText.trim() === "") {
      setError(true);
      return;
    }
    setError(false);
    if (itemToEdit !== null) {
      setItems((prevItems) => {
        const newItems = [...prevItems];
        newItems[itemToEdit].text = inputText;
        return newItems;
      });
      setItemToEdit(null);
    } else {
      setItems((prevItems) => [...prevItems, { text: inputText, completed: false }]);
    }
    setInputText("");
    toast.success("New mission unlocked! ✨");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addItem();
    }
  };

  const toggleCompletion = (index) => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      newItems[index].completed = !newItems[index].completed;
      return newItems;
    });
  };

  const editItem = (index) => {
    setInputText(items[index].text);
    setItemToEdit(index);
  };

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a0033 0%, #0d001a 40%, #1a0033 70%, #2d0050 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', sans-serif",
        padding: "2rem 1rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative stars */}
      {["10%,15%", "85%,10%", "5%,70%", "90%,65%", "50%,5%", "70%,85%", "25%,90%", "60%,20%"].map(
        (pos, i) => {
          const [left, top] = pos.split(",");
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left,
                top,
                width: i % 2 === 0 ? "6px" : "4px",
                height: i % 2 === 0 ? "6px" : "4px",
                borderRadius: "50%",
                background: i % 3 === 0 ? "#ff6eb4" : i % 3 === 1 ? "#c084fc" : "#818cf8",
                opacity: 0.7,
                pointerEvents: "none",
              }}
            />
          );
        }
      )}

      <div
        style={{
          maxWidth: "460px",
          width: "100%",
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,110,180,0.3)",
          borderRadius: "20px",
          padding: "2rem",
          boxShadow: "0 0 40px rgba(192,132,252,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "28px", marginBottom: "4px" }}>🎤</div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "800",
              background: "linear-gradient(90deg, #ff6eb4, #c084fc, #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: "0 0 4px",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            K-Pop Hunters
          </h1>
          <p style={{ color: "rgba(192,132,252,0.8)", fontSize: "13px", margin: 0 }}>
            Track your fandom missions ✦
          </p>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div style={{ marginTop: "14px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: "6px",
                }}
              >
                <span>MISSIONS CLEARED</span>
                <span>
                  {completedCount}/{totalCount}
                </span>
              </div>
              <div
                style={{
                  height: "5px",
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(completedCount / totalCount) * 100}%`,
                    background: "linear-gradient(90deg, #ff6eb4, #c084fc)",
                    borderRadius: "999px",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Input row */}
        <div style={{ display: "flex", gap: "8px", marginBottom: error ? "6px" : "1rem" }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (error) setError(false);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Add a new mission..."
            style={{
              flex: 1,
              padding: "10px 14px",
              background: "rgba(255,255,255,0.07)",
              border: `1.5px solid ${error ? "#f87171" : "rgba(192,132,252,0.35)"}`,
              borderRadius: "10px",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.2s",
            }}
          />
          <button
            onClick={addItem}
            style={{
              background: "linear-gradient(135deg, #ff6eb4, #c084fc)",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontSize: "13px",
              fontWeight: "700",
              padding: "10px 18px",
              cursor: "pointer",
              whiteSpace: "nowrap",
              letterSpacing: "0.5px",
            }}
          >
            {itemToEdit !== null ? "Update" : "+ Add"}
          </button>
        </div>

        {error && (
          <p style={{ color: "#f87171", fontSize: "12px", marginBottom: "12px" }}>
            Mission name can't be empty!
          </p>
        )}

        {/* Todo list */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
          {items.length === 0 && (
            <li
              style={{
                textAlign: "center",
                color: "rgba(255,255,255,0.3)",
                fontSize: "13px",
                padding: "2rem 0",
              }}
            >
              No missions yet. Start hunting! 🌟
            </li>
          )}
          {items.map((item, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: item.completed
                  ? "rgba(192,132,252,0.08)"
                  : "rgba(255,255,255,0.06)",
                border: `1px solid ${item.completed ? "rgba(192,132,252,0.25)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "10px",
                padding: "10px 14px",
                transition: "all 0.2s",
              }}
            >
              {/* Checkbox + text */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, cursor: "pointer" }}
                onClick={() => toggleCompletion(index)}
              >
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    border: `2px solid ${item.completed ? "#c084fc" : "rgba(255,255,255,0.3)"}`,
                    background: item.completed
                      ? "linear-gradient(135deg, #ff6eb4, #c084fc)"
                      : "transparent",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    color: "#fff",
                  }}
                >
                  {item.completed && "✓"}
                </div>
                <span
                  style={{
                    fontSize: "14px",
                    color: item.completed ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.9)",
                    textDecoration: item.completed ? "line-through" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  {item.text}
                </span>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "6px", flexShrink: 0, marginLeft: "8px" }}>
                <button
                  onClick={() => editItem(index)}
                  style={{
                    background: "rgba(129,140,248,0.2)",
                    border: "1px solid rgba(129,140,248,0.4)",
                    borderRadius: "7px",
                    color: "#a5b4fc",
                    fontSize: "12px",
                    padding: "4px 10px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => confirmRemove(index)}
                  style={{
                    background: "rgba(248,113,113,0.15)",
                    border: "1px solid rgba(248,113,113,0.35)",
                    borderRadius: "7px",
                    color: "#fca5a5",
                    fontSize: "12px",
                    padding: "4px 10px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Drop
                </button>
              </div>
            </li>
          ))}
        </ul>

        {/* Confirmation Modal */}
        {showModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
            }}
          >
            <div
              style={{
                background: "#1a0033",
                border: "1px solid rgba(255,110,180,0.4)",
                borderRadius: "16px",
                padding: "1.5rem",
                maxWidth: "320px",
                width: "90%",
                boxShadow: "0 0 30px rgba(192,132,252,0.25)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>💔</div>
              <h2
                style={{
                  color: "#fff",
                  fontSize: "17px",
                  fontWeight: "700",
                  margin: "0 0 8px",
                }}
              >
                Drop this mission?
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: "0 0 1.2rem" }}>
                This mission will be removed from your hunt list.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "9px",
                    color: "rgba(255,255,255,0.7)",
                    padding: "9px 20px",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Keep it
                </button>
                <button
                  onClick={handleRemove}
                  style={{
                    background: "linear-gradient(135deg, #ff6eb4, #f87171)",
                    border: "none",
                    borderRadius: "9px",
                    color: "#fff",
                    padding: "9px 20px",
                    fontSize: "13px",
                    cursor: "pointer",
                    fontWeight: "700",
                  }}
                >
                  Drop it
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>
    </div>
  );
};

export default Todo;
