import React, { useEffect, useState, useCallback } from "react";
import Title from "../../extras/Title";
import { apiInstance, apiInstanceFetch } from "../../api/axiosApi";
import { toast } from "react-toastify";

const TOPIC_LABELS = {
  price: "Prix",
  booking: "Réservation",
  cancel: "Annulation",
  technical: "Cheveux / technique",
  prep: "Préparation",
  payment: "Paiement",
  complaint: "Réclamation",
  other: "Autre",
};

const STATUS_LABELS = {
  available: "Disponible",
  with_client: "En RDV",
  offline: "Hors ligne",
};

const SK = {
  brand: "#c45c26",
  brandHover: "#a84d1f",
  brandBg: "#fdf6f0",
  brandBorder: "rgba(196, 92, 38, 0.2)",
  black: "#111111",
  muted: "rgba(17, 17, 17, 0.62)",
};

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [activeContext, setActiveContext] = useState(null);
  const [experts, setExperts] = useState([]);
  const [filterExpertList, setFilterExpertList] = useState([]);
  const [filter, setFilter] = useState("all"); // all | unassigned | expertId
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      let url = "salon/messaging/conversations";
      if (filter === "unassigned") url += "?unassigned=1";
      else if (filter && filter !== "all") {
        url += `?assignedExpertId=${encodeURIComponent(filter)}`;
      }
      const res = await apiInstanceFetch.get(url);
      setConversations(res?.conversations || []);
    } catch (e) {
      toast.error("Impossible de charger les conversations");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiInstanceFetch.get("salon/messaging/experts");
        setFilterExpertList(res?.experts || []);
      } catch (_) {
        /* optional */
      }
    })();
  }, []);

  const openConversation = async (id) => {
    setActiveId(id);
    setMessages([]);
    setActiveContext(null);
    setExperts([]);
    try {
      const res = await apiInstanceFetch.get(
        `salon/messaging/messages?conversationId=${id}`
      );
      setMessages(res?.messages || []);
      setActiveUser(res?.user || null);
      setActiveContext(res?.context || res?.conversation || null);
      setExperts(res?.experts || []);
      loadConversations();
    } catch (e) {
      toast.error("Impossible d'ouvrir la conversation");
    }
  };

  const assignExpert = async (expertId) => {
    if (!activeId || assigning) return;
    setAssigning(true);
    try {
      const res = await apiInstance.post("salon/messaging/assign", {
        conversationId: activeId,
        expertId: expertId || null,
      });
      if (!res?.status) throw new Error(res?.message || "Erreur");
      setActiveContext(res.context || res.conversation || null);
      toast.success(
        expertId ? "Conversation attribuée à l’expert" : "Attribution retirée"
      );
      await openConversation(activeId);
    } catch (e) {
      toast.error(e.message || "Attribution impossible");
    } finally {
      setAssigning(false);
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

  const filterExperts = filterExpertList.length ? filterExpertList : experts;

  return (
    <div className="mainAdminProfile">
      <div className="p-3">
        <Title name="Messagerie Skedisy" />
        <p style={{ color: SK.muted, marginBottom: 12, maxWidth: 640, lineHeight: 1.45 }}>
          Inbox salon → attribuez à une experte. Questions presta, préparation,
          technique : la cliente écrit ici plutôt que sur Instagram. Si l’experte
          est en RDV ou hors ligne, un accusé part automatiquement.
        </p>
        <div className="d-flex gap-2 flex-wrap mb-3 align-items-center">
          <label style={{ fontSize: 13, color: SK.muted }}>Filtrer</label>
          <select
            className="form-select form-select-sm"
            style={{ maxWidth: 260 }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Toutes les conversations</option>
            <option value="unassigned">Non attribuées</option>
            {filterExperts
              .filter((ex) => ex._id)
              .map((ex) => (
                <option key={String(ex._id)} value={String(ex._id)}>
                  Assignées · {ex.name}
                </option>
              ))}
          </select>
        </div>
        <div
          className="card"
          style={{
            border: `1px solid ${SK.brandBorder}`,
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div className="card-body p-0">
            <div className="row g-0" style={{ minHeight: 480 }}>
              <div
                className="col-md-4"
                style={{
                  borderRight: `1px solid ${SK.brandBorder}`,
                  maxHeight: 560,
                  overflowY: "auto",
                  background: "#fff",
                }}
              >
                {loading && <p className="p-3">Chargement…</p>}
                {!loading && !conversations.length && (
                  <p className="p-3" style={{ color: SK.muted }}>
                    Aucune conversation pour l’instant. Les clientes vous
                    écrivent depuis votre fiche Skedisy.
                  </p>
                )}
                {conversations.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => openConversation(c._id)}
                    className="w-100 text-start border-0"
                    style={{
                      padding: "14px 16px",
                      background: activeId === c._id ? SK.brandBg : "#fff",
                      borderBottom: "1px solid rgba(17,17,17,0.06)",
                      borderLeft:
                        activeId === c._id
                          ? `3px solid ${SK.brand}`
                          : "3px solid transparent",
                      cursor: "pointer",
                    }}
                  >
                    <div className="d-flex justify-content-between">
                      <strong>{c.user?.name || "Cliente"}</strong>
                      {c.unreadSalon > 0 && (
                        <span
                          style={{
                            background: SK.brand,
                            color: "#fff",
                            borderRadius: 12,
                            padding: "0 8px",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {c.unreadSalon}
                        </span>
                      )}
                    </div>
                    {(c.serviceName || c.serviceId) && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#111",
                          fontWeight: 600,
                          marginTop: 2,
                        }}
                        className="text-truncate"
                      >
                        {c.serviceName || "Prestation"}
                        {c.topic && TOPIC_LABELS[c.topic]
                          ? ` · ${TOPIC_LABELS[c.topic]}`
                          : ""}
                      </div>
                    )}
                    {c.assignedExpertName ? (
                      <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
                        → {c.assignedExpertName}
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                        Non attribuée
                      </div>
                    )}
                    <div style={{ fontSize: 13, color: "#666" }} className="text-truncate">
                      {c.lastPreview || "—"}
                    </div>
                  </button>
                ))}
              </div>
              <div className="col-md-8 d-flex flex-column" style={{ minHeight: 480 }}>
                {!activeId && (
                  <div className="p-4" style={{ color: SK.muted }}>
                    Sélectionnez une conversation pour répondre à la cliente.
                  </div>
                )}
                {activeId && (
                  <>
                    <div
                      style={{
                        padding: "12px 16px",
                        borderBottom: `1px solid ${SK.brandBorder}`,
                        background: SK.brandBg,
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
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
                      {activeContext?.serviceName || activeContext?.serviceId ? (
                        <div
                          style={{
                            marginTop: 8,
                            padding: "8px 10px",
                            background: "#fff",
                            border: `1px solid ${SK.brandBorder}`,
                            borderRadius: 8,
                            fontSize: 13,
                          }}
                        >
                          <strong>Prestation :</strong>{" "}
                          {activeContext.serviceName || "—"}
                          {activeContext.servicePrice != null
                            ? ` · ${activeContext.servicePrice}`
                            : ""}
                          {activeContext.serviceDuration != null
                            ? ` · ${activeContext.serviceDuration} min`
                            : ""}
                          {activeContext.topic && TOPIC_LABELS[activeContext.topic] ? (
                            <span style={{ marginLeft: 8, color: "#666" }}>
                              ({TOPIC_LABELS[activeContext.topic]})
                            </span>
                          ) : null}
                        </div>
                      ) : null}

                      {activeContext?.topic ? (
                        <div style={{ marginTop: 6, fontSize: 12, color: "#555" }}>
                          Sujet :{" "}
                          <strong>
                            {TOPIC_LABELS[activeContext.topic] || activeContext.topic}
                          </strong>
                          {activeContext.topicSource
                            ? ` (${activeContext.topicSource === "client" ? "choisi" : "détecté"})`
                            : ""}
                        </div>
                      ) : null}

                      <div
                        style={{
                          marginTop: 10,
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <label style={{ fontSize: 13, margin: 0 }}>
                          Assigner à un expert
                        </label>
                        <select
                          className="form-select form-select-sm"
                          style={{ maxWidth: 280 }}
                          disabled={assigning}
                          value={activeContext?.assignedExpertId || ""}
                          onChange={(e) => assignExpert(e.target.value || null)}
                        >
                          <option value="">— Salon (non attribué) —</option>
                          {experts.map((ex) => (
                            <option key={String(ex._id)} value={String(ex._id)}>
                              {ex.name}{" "}
                              {STATUS_LABELS[ex.messagingStatus] || ""}
                            </option>
                          ))}
                        </select>
                        {activeContext?.assignedExpert?.messagingStatus ? (
                          <span style={{ fontSize: 12, color: "#555" }}>
                            {STATUS_LABELS[
                              activeContext.assignedExpert.messagingStatus
                            ] || activeContext.assignedExpert.messagingStatus}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: 16,
                        background: "linear-gradient(180deg,#fff 0%,#fbf8f5 100%)",
                        maxHeight: 360,
                      }}
                    >
                      {messages.map((m) => {
                        const isSystem = m.sender === "system";
                        const isAuto = Boolean(m.isAutoReply);
                        const isSalonSide =
                          m.sender === "salon" || m.sender === "expert";
                        return (
                          <div
                            key={m._id}
                            style={{
                              marginBottom: 10,
                              display: "flex",
                              justifyContent: isSystem
                                ? "center"
                                : isSalonSide
                                  ? "flex-end"
                                  : "flex-start",
                            }}
                          >
                            <div
                              style={{
                                maxWidth: isSystem ? "92%" : "75%",
                                background: isAuto
                                  ? "#fff"
                                  : isSystem
                                    ? SK.brandBg
                                    : isSalonSide
                                      ? SK.black
                                      : "#fff",
                                color: isAuto
                                  ? "#3d2a20"
                                  : isSystem
                                    ? "#5c3d2e"
                                    : isSalonSide
                                      ? "#fff"
                                      : SK.black,
                                padding: "10px 14px",
                                borderRadius: 14,
                                border: isAuto
                                  ? `1px solid ${SK.brandBorder}`
                                  : isSystem
                                    ? `1px solid ${SK.brandBorder}`
                                    : isSalonSide
                                      ? "none"
                                      : `1px solid ${SK.brandBorder}`,
                                fontSize: isSystem ? 13 : undefined,
                                textAlign: isAuto ? "left" : isSystem ? "center" : "left",
                                whiteSpace: isAuto ? "pre-wrap" : undefined,
                              }}
                            >
                              {isAuto ? (
                                <div
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    marginBottom: 4,
                                    color: SK.brand,
                                    letterSpacing: "0.04em",
                                  }}
                                >
                                  RÉPONSE AUTO
                                  {m.autoReplyTopic
                                    ? ` · ${TOPIC_LABELS[m.autoReplyTopic] || m.autoReplyTopic}`
                                    : ""}
                                </div>
                              ) : null}
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
                        );
                      })}
                    </div>
                    <div
                      style={{
                        padding: 12,
                        borderTop: `1px solid ${SK.brandBorder}`,
                        background: "#fff",
                      }}
                    >
                      {photos.length > 0 && (
                        <div style={{ fontSize: 12, marginBottom: 6, color: SK.muted }}>
                          {photos.length} photo(s) sélectionnée(s)
                        </div>
                      )}
                      <div className="d-flex gap-2 align-items-end">
                        <label
                          className="btn btn-sm mb-0"
                          style={{
                            cursor: "pointer",
                            border: `1px dashed ${SK.brand}`,
                            color: SK.brandHover,
                            background: SK.brandBg,
                          }}
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
                          placeholder="Répondez à la cliente…"
                          onChange={(e) => setBody(e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn"
                          disabled={sending}
                          onClick={send}
                          style={{
                            background: SK.brand,
                            borderColor: SK.brand,
                            color: "#fff",
                            fontWeight: 600,
                            minWidth: 96,
                          }}
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
