import React, { useCallback, useEffect, useState } from "react";
import Title from "../../extras/Title";
import { apiInstanceFetch } from "../../api/axiosApi";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const statusLabel = {
  ready: "Actif",
  partial: "Brouillons prêts",
  config: "À activer",
};

const Marketing = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [lastPromo, setLastPromo] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await apiInstanceFetch.get("salon/marketing/insights");
      if (res?.status) setData(res);
      else toast.error(res?.message || "Impossible de charger le marketing");
    } catch (e) {
      toast.error("Erreur marketing");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createPromo = async () => {
    if (!data?.occupancy) return;
    setBusy("promo");
    try {
      const res = await apiInstanceFetch.post("salon/marketing/promo", {
        discountPercent: data.occupancy.suggestedDiscount || 15,
        title: data.occupancy.suggestedPromoTitle,
        dateHint: data.occupancy.dayLabel,
        daysValid: 14,
      });
      if (!res?.status) throw new Error(res?.message || "Erreur");
      setLastPromo(res);
      toast.success(`Promo créée : ${res.coupon?.code}`);
      load();
    } catch (e) {
      toast.error(e.message || "Création promo impossible");
    } finally {
      setBusy("");
    }
  };

  const launchRebook = async () => {
    if (!window.confirm("Envoyer les SMS de rebooking aux clientes à échéance cette semaine ?")) {
      return;
    }
    setBusy("rebook");
    try {
      const res = await apiInstanceFetch.post("salon/marketing/rebook-campaign", {});
      if (!res?.status) throw new Error(res?.message || "Erreur");
      toast.success(res.message || "Campagne lancée");
      load();
    } catch (e) {
      toast.error(e.message || "Campagne impossible");
    } finally {
      setBusy("");
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copié");
    } catch {
      toast.info(text);
    }
  };

  if (loading) {
    return (
      <div className="p-3">
        <Title name="Marketing automatisé" />
        <p>Chargement…</p>
      </div>
    );
  }

  const occ = data?.occupancy;
  const rebook = data?.rebook;

  return (
    <div className="mainAdminProfile">
      <div className="p-3">
        <Title name="Marketing automatisé" />
        <p style={{ color: "#666", maxWidth: 640, marginBottom: 20 }}>
          StyleSeat-inspired : insights planning + rebooking, promos ciblées, posts
          prêts à coller, fiche publique et fidélité — sans campagne manuelle.
        </p>

        <div className="row g-3 mb-3">
          {(data?.roadmap || []).map((r) => (
            <div className="col-6 col-md" key={r.id}>
              <div
                className="card h-100"
                style={{ border: "1px solid #eee", borderRadius: 10 }}
              >
                <div className="card-body py-2 px-3">
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {statusLabel[r.status] || r.status}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-3">
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="mb-2">Planning</h5>
                <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.35 }}>
                  {occ?.headline || "—"}
                </p>
                {occ?.occupancyPercent != null && (
                  <p className="text-muted mb-3">
                    {occ.bookingHint} · {occ.expertCount} pro(s)
                  </p>
                )}
                {occ?.suggestPromo ? (
                  <button
                    type="button"
                    className="btn btn-success"
                    disabled={busy === "promo"}
                    onClick={createPromo}
                  >
                    {busy === "promo"
                      ? "Création…"
                      : `Créer promo −${occ.suggestedDiscount}%`}
                  </button>
                ) : (
                  <Link to="/salonpanel/teamCalendar" className="btn btn-outline-secondary">
                    Voir le planning
                  </Link>
                )}

                {occ?.socialPosts?.length > 0 && (
                  <div className="mt-4">
                    <h6>Posts prêts (à coller)</h6>
                    {occ.socialPosts.map((p, i) => (
                      <div
                        key={i}
                        className="p-2 mb-2"
                        style={{ background: "#f8f9fa", borderRadius: 8 }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            textTransform: "uppercase",
                            color: "#888",
                            marginBottom: 4,
                          }}
                        >
                          {p.channel}
                        </div>
                        <pre
                          style={{
                            whiteSpace: "pre-wrap",
                            margin: 0,
                            fontFamily: "inherit",
                            fontSize: 13,
                          }}
                        >
                          {p.body}
                        </pre>
                        <button
                          type="button"
                          className="btn btn-sm btn-link px-0"
                          onClick={() => copyText(p.body)}
                        >
                          Copier
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="mb-2">Rebooking</h5>
                <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.35 }}>
                  {rebook?.headline || "—"}
                </p>
                <p className="text-muted mb-3">
                  Semaine {rebook?.weekStart} → {rebook?.weekEnd}
                  {rebook?.alreadySent
                    ? ` · ${rebook.alreadySent} déjà relancée(s)`
                    : ""}
                </p>
                <button
                  type="button"
                  className="btn btn-dark"
                  disabled={!rebook?.suggestCampaign || busy === "rebook"}
                  onClick={launchRebook}
                >
                  {busy === "rebook" ? "Envoi…" : "Lancer la campagne SMS"}
                </button>

                {rebook?.clients?.length > 0 && (
                  <div className="mt-3" style={{ maxHeight: 240, overflowY: "auto" }}>
                    <table className="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>Cliente</th>
                          <th>Presta</th>
                          <th>SMS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rebook.clients.slice(0, 20).map((c) => (
                          <tr key={c.bookingId}>
                            <td>{c.name}</td>
                            <td>{c.serviceName}</td>
                            <td>{c.reminderSent ? "Envoyé" : "En attente"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-body">
                <h5>Fiche / mini-site</h5>
                <p className="text-muted">{data?.site?.hint}</p>
                {data?.site?.publicUrl && (
                  <a
                    href={data.site.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-dark btn-sm"
                  >
                    Ouvrir ma fiche publique
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-body">
                <h5>Fidélité</h5>
                <p className="text-muted">{data?.loyalty?.hint}</p>
                <Link to="/salonpanel/profile" className="btn btn-outline-secondary btn-sm">
                  Configurer dans Profil
                </Link>
              </div>
            </div>
          </div>
        </div>

        {(lastPromo || data?.recentPromos?.length > 0) && (
          <div className="card mt-3">
            <div className="card-body">
              <h5>Promotions salon</h5>
              {lastPromo?.coupon && (
                <div className="alert alert-success">
                  Code <strong>{lastPromo.coupon.code}</strong> (−
                  {lastPromo.coupon.discountPercent}%) jusqu&apos;au{" "}
                  {lastPromo.coupon.expiryDate}
                  <button
                    type="button"
                    className="btn btn-sm btn-link"
                    onClick={() => copyText(lastPromo.shareText)}
                  >
                    Copier le message de partage
                  </button>
                </div>
              )}
              <ul className="mb-0">
                {(data?.recentPromos || []).map((p) => (
                  <li key={p._id}>
                    <code>{p.code}</code> — {p.title} (−{p.discountPercent}%) · expire{" "}
                    {p.expiryDate}
                    {!p.isActive ? " (inactif)" : ""}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {data?.durationInsight && (
          <div className="card mt-3">
            <div className="card-body">
              <h5>Durée prévue vs réelle</h5>
              <p>{data.durationInsight.headline}</p>
            </div>
          </div>
        )}

        <div className="card mt-3">
          <div className="card-body">
            <h5>Packages multi-visites</h5>
            <p className="text-muted">
              Ex. Pack entretien : 1 pose + 1 entretien + 1 retouche. Affichés ici pour le
              salon (vente assistée) — pas encore de wallet prépayé.
            </p>
            {(data?.packages || []).length === 0 && (
              <p className="text-muted">Aucun pack. Ajoutez-en un ci-dessous.</p>
            )}
            <ul>
              {(data?.packages || []).map((p) => (
                <li key={p.id}>
                  <strong>{p.name}</strong> — {p.visitCount} visite(s)
                  {p.priceHint ? ` · ${p.priceHint}` : ""}
                  {p.description ? ` — ${p.description}` : ""}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn btn-outline-dark btn-sm"
              onClick={async () => {
                const name = window.prompt("Nom du pack", "Pack entretien");
                if (!name) return;
                const visitCount = Number(window.prompt("Nombre de visites", "3")) || 3;
                const priceHint = window.prompt("Prix indicatif (texte)", "sur devis") || "";
                const next = [
                  ...(data?.packages || []),
                  {
                    id: `pkg_${Date.now()}`,
                    name,
                    visitCount,
                    priceHint,
                    description: "",
                    active: true,
                  },
                ];
                try {
                  const res = await apiInstanceFetch.put("salon/marketing/packages", {
                    packages: next,
                  });
                  if (res?.status) {
                    toast.success("Pack enregistré");
                    load();
                  } else toast.error(res?.message || "Erreur");
                } catch (e) {
                  toast.error("Erreur pack");
                }
              }}
            >
              Ajouter un pack
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketing;
