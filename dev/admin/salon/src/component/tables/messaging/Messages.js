import React, { useEffect, useState, useCallback } from "react";
import Title from "../../extras/Title";
import { apiInstance, apiInstanceFetch } from "../../api/axiosApi";
import { toast } from "react-toastify";

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const res = await apiInstanceFetch.get("salon/messaging/conversations");
      setConversations(res?.conversations || []);
    } catch (e) {
      toast.error("Impossible de charger les conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const openConversation = async (id) => {
    setActiveId(id);
    setMessages([]);
    try {
      const res = await apiInstanceFetch.get(
        `salon/messaging/messages?conversationId=${id}`
      );
      setMessages(res?.messages || []);
      setActiveUser(res?.user || null);
      loadConversations();
    } catch (e) {
      toast.error("Impossible d'ouvrir la conversation");
    }
  };

  const send = async () => {
    if (!activeId || (!body.trim() && !photos.length) || sending) return;
    setSending(true);
    try {
      const fd = new FormData();
      fd.append("conversationId", activeId);
      fd.append("body", body);
      photos.forEach((f) => fd.append("photos", f));
      const res = await apiInstance.post("salon/messaging/send", fd);
      if (!res?.status) throw new Error(res?.message || "Erreur");
      setBody("");
      setPhotos([]);
      await openConversation(activeId);
    } catch (e) {
      toast.error(e.message || "Envoi impossible");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mainAdminProfile">
      <div className="p-3">
        <Title name="Messages clientes" />
        <p style={{ color: "#666", marginBottom: 16 }}>
          Répondez aux messages envoyés depuis votre fiche publique. Les clientes
          reçoivent une notification. Pour une question urgente, elles peuvent
          aussi appeler le numéro de votre profil.
        </p>
        <div className="card">
          <div className="card-body p-0">
            <div className="row g-0" style={{ minHeight: 480 }}>
              <div
                className="col-md-4"
                style={{ borderRight: "1px solid #eee", maxHeight: 560, overflowY: "auto" }}
              >
                {loading && <p className="p-3">Chargement…</p>}
                {!loading && !conversations.length && (
                  <p className="p-3 text-muted">Aucun message pour l'instant.</p>
                )}
                {conversations.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => openConversation(c._id)}
                    className="w-100 text-start border-0"
                    style={{
                      padding: "14px 16px",
                      background: activeId === c._id ? "#f3f4f6" : "#fff",
                      borderBottom: "1px solid #f0f0f0",
                      cursor: "pointer",
                    }}
                  >
                    <div className="d-flex justify-content-between">
                      <strong>{c.user?.name || "Cliente"}</strong>
                      {c.unreadSalon > 0 && (
                        <span
                          style={{
                            background: "#1ebc1e",
                            color: "#fff",
                            borderRadius: 12,
                            padding: "0 8px",
                            fontSize: 12,
                          }}
                        >
                          {c.unreadSalon}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: "#666" }} className="text-truncate">
                      {c.lastPreview || "—"}
                    </div>
                  </button>
                ))}
              </div>
              <div className="col-md-8 d-flex flex-column" style={{ minHeight: 480 }}>
                {!activeId && (
                  <div className="p-4 text-muted">Sélectionnez une conversation.</div>
                )}
                {activeId && (
                  <>
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #eee",
                        fontWeight: 600,
                      }}
                    >
                      {activeUser?.name || "Cliente"}
                      {activeUser?.mobile ? (
                        <a
                          href={`tel:${String(activeUser.mobile).replace(/\s+/g, "")}`}
                          style={{ marginLeft: 12, fontWeight: 400, fontSize: 14 }}
                        >
                          Appeler
                        </a>
                      ) : null}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: 16,
                        background: "#fafafa",
                        maxHeight: 360,
                      }}
                    >
                      {messages.map((m) => (
                        <div
                          key={m._id}
                          style={{
                            marginBottom: 10,
                            display: "flex",
                            justifyContent:
                              m.sender === "salon" ? "flex-end" : "flex-start",
                          }}
                        >
                          <div
                            style={{
                              maxWidth: "75%",
                              background: m.sender === "salon" ? "#1ebc1e" : "#fff",
                              color: m.sender === "salon" ? "#fff" : "#111",
                              padding: "8px 12px",
                              borderRadius: 12,
                              border: m.sender === "salon" ? "none" : "1px solid #e5e5e5",
                            }}
                          >
                            {m.body ? <div>{m.body}</div> : null}
                            {(m.photoUrls || []).map((u) => (
                              <a key={u} href={u} target="_blank" rel="noreferrer">
                                <img
                                  src={u}
                                  alt=""
                                  style={{
                                    maxWidth: 140,
                                    borderRadius: 8,
                                    marginTop: 6,
                                    display: "block",
                                  }}
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: 12, borderTop: "1px solid #eee" }}>
                      {photos.length > 0 && (
                        <div style={{ fontSize: 12, marginBottom: 6 }}>
                          {photos.length} photo(s) sélectionnée(s)
                        </div>
                      )}
                      <div className="d-flex gap-2 align-items-end">
                        <label
                          className="btn btn-sm btn-outline-secondary mb-0"
                          style={{ cursor: "pointer" }}
                        >
                          Photo
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={(e) =>
                              setPhotos(Array.from(e.target.files || []).slice(0, 4))
                            }
                          />
                        </label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={body}
                          placeholder="Votre réponse…"
                          onChange={(e) => setBody(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn btn-success"
                          disabled={sending}
                          onClick={send}
                        >
                          {sending ? "…" : "Envoyer"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
