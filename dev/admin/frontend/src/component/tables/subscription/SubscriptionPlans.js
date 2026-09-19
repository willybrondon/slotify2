import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Title from "../../extras/Title";
import Button from "../../extras/Button";
import ToggleSwitch from "../../extras/ToggleSwitch";
import {
  getSubscriptionPlans,
  updateSubscriptionPlan,
  toggleSubscriptionPlan,
  createSubscriptionPlan,
  deleteSubscriptionPlan,
} from "../../../redux/slice/subscriptionSlice";
import { warning } from "../../../util/Alert";
import { SKEDISY_ADMIN_UI as ui } from "../../../constants/skedisyUiCopy";

/**
 * Admin control of SaaS plans + feature matrix (StyleSeat-inspired opt-ins).
 */
const SubscriptionPlans = () => {
  const dispatch = useDispatch();
  const { plans, featuresCatalog, isLoading } = useSelector(
    (s) => s.subscription
  );
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    planId: "",
    name: "",
    tier: "custom",
    priceMonthly: 0,
    tagline: "",
  });

  useEffect(() => {
    dispatch(getSubscriptionPlans());
  }, [dispatch]);

  const selected = useMemo(
    () => plans.find((p) => p._id === selectedId) || plans[0] || null,
    [plans, selectedId]
  );

  useEffect(() => {
    if (selected) {
      setSelectedId(selected._id);
      setDraft({
        name: selected.name || "",
        tagline: selected.tagline || "",
        tier: selected.tier || "custom",
        priceMonthly: selected.priceMonthly ?? 0,
        priceYearly: selected.priceYearly ?? 0,
        trialDays: selected.trialDays ?? 14,
        sortOrder: selected.sortOrder ?? 100,
        isDefault: Boolean(selected.isDefault),
        isHighlighted: Boolean(selected.isHighlighted),
        maxExperts: selected.limits?.maxExperts ?? 0,
        maxLocations: selected.limits?.maxLocations ?? 1,
        features: [...(selected.features || [])],
        notes: selected.notes || "",
      });
    }
  }, [selected?._id, plans]);

  const groupedFeatures = useMemo(() => {
    const groups = {};
    (featuresCatalog || []).forEach((f) => {
      const g = f.group || "other";
      if (!groups[g]) groups[g] = [];
      groups[g].push(f);
    });
    return groups;
  }, [featuresCatalog]);

  const toggleFeature = (key) => {
    if (!draft) return;
    const has = draft.features.includes(key);
    setDraft({
      ...draft,
      features: has
        ? draft.features.filter((k) => k !== key)
        : [...draft.features, key],
    });
  };

  const handleSave = () => {
    if (!selected || !draft) return;
    dispatch(
      updateSubscriptionPlan({
        id: selected._id,
        name: draft.name,
        tagline: draft.tagline,
        tier: draft.tier,
        priceMonthly: Number(draft.priceMonthly) || 0,
        priceYearly: Number(draft.priceYearly) || 0,
        trialDays: Number(draft.trialDays) || 0,
        sortOrder: Number(draft.sortOrder) || 0,
        isDefault: draft.isDefault,
        isHighlighted: draft.isHighlighted,
        features: draft.features,
        maxExperts: Number(draft.maxExperts) || 0,
        maxLocations: Number(draft.maxLocations) || 0,
        notes: draft.notes,
      })
    );
  };

  const handleCreate = () => {
    if (!createForm.planId || !createForm.name) return;
    dispatch(
      createSubscriptionPlan({
        ...createForm,
        features: [],
      })
    ).then(() => {
      setShowCreate(false);
      dispatch(getSubscriptionPlans());
    });
  };

  const handleDelete = (plan) => {
    const confirm = warning();
    confirm
      .then(async (ok) => {
        if (ok) {
          await dispatch(deleteSubscriptionPlan(plan._id));
          dispatch(getSubscriptionPlans());
        }
      })
      .catch(() => {});
  };

  return (
    <div className="mainSalon">
      <Title
        name={ui.nav.subscriptions || "Abonnements SaaS"}
        total={plans?.length}
      />

      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <p className="text-muted mb-0" style={{ maxWidth: 720 }}>
            StyleSeat = 1 plan Premium + opt-out features (leads, Smart Pricing).
            Skedisy = Free / Basic / Premium / Enterprise — features attribuées
            ici par l&apos;admin.
          </p>
          <Button
            text="Nouveau plan"
            bIcon="ri-add-line"
            className="bg-theme text-white"
            onClick={() => setShowCreate(!showCreate)}
          />
        </div>
      </div>

      {showCreate && (
        <div className="card p-3 mb-3">
          <div className="row g-2">
            <div className="col-md-2">
              <label className="form-label">planId</label>
              <input
                className="form-control"
                value={createForm.planId}
                onChange={(e) =>
                  setCreateForm({ ...createForm, planId: e.target.value })
                }
                placeholder="ex: pro_plus"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Nom</label>
              <input
                className="form-control"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Tier</label>
              <select
                className="form-select"
                value={createForm.tier}
                onChange={(e) =>
                  setCreateForm({ ...createForm, tier: e.target.value })
                }
              >
                <option value="custom">custom</option>
                <option value="basic">basic</option>
                <option value="premium">premium</option>
                <option value="enterprise">enterprise</option>
                <option value="free">free</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">€ / mois</label>
              <input
                type="number"
                className="form-control"
                value={createForm.priceMonthly}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    priceMonthly: e.target.value,
                  })
                }
              />
            </div>
            <div className="col-md-3 d-flex align-items-end gap-2">
              <Button
                text="Créer"
                className="bg-theme text-white"
                onClick={handleCreate}
              />
              <Button
                text="Annuler"
                className="bg-secondary text-white"
                onClick={() => setShowCreate(false)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-lg-4 mb-3">
          <div className="card p-0">
            <div className="list-group list-group-flush">
              {(plans || []).map((plan) => (
                <button
                  type="button"
                  key={plan._id}
                  className={`list-group-item list-group-item-action d-flex justify-content-between align-items-start ${
                    selected?._id === plan._id ? "active" : ""
                  }`}
                  onClick={() => setSelectedId(plan._id)}
                >
                  <div>
                    <div className="fw-bold">
                      {plan.name}
                      {plan.isHighlighted ? " ★" : ""}
                      {plan.isDefault ? " (défaut)" : ""}
                    </div>
                    <small>
                      {plan.tier} · {plan.priceMonthly}€/mo ·{" "}
                      {(plan.features || []).length} features
                    </small>
                  </div>
                  <span
                    className={`badge ${
                      plan.isActive ? "bg-success" : "bg-secondary"
                    }`}
                  >
                    {plan.isActive ? "ON" : "OFF"}
                  </span>
                </button>
              ))}
              {!plans?.length && !isLoading && (
                <div className="p-3 text-muted">Aucun plan</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-8 mb-3">
          {draft && selected ? (
            <div className="card p-3">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  {selected.planId} — éditer features
                </h5>
                <div className="d-flex gap-2 align-items-center">
                  <ToggleSwitch
                    value={selected.isActive}
                    onClick={() =>
                      dispatch(toggleSubscriptionPlan(selected._id))
                    }
                  />
                  <Button
                    text="Enregistrer"
                    className="bg-theme text-white"
                    onClick={handleSave}
                  />
                  {!["free", "basic", "premium"].includes(selected.planId) && (
                    <Button
                      text="Supprimer"
                      className="bg-danger text-white"
                      onClick={() => handleDelete(selected)}
                    />
                  )}
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-4">
                  <label className="form-label">Nom</label>
                  <input
                    className="form-control"
                    value={draft.name}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Tagline</label>
                  <input
                    className="form-control"
                    value={draft.tagline}
                    onChange={(e) =>
                      setDraft({ ...draft, tagline: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">€ / mois</label>
                  <input
                    type="number"
                    className="form-control"
                    value={draft.priceMonthly}
                    onChange={(e) =>
                      setDraft({ ...draft, priceMonthly: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">€ / an</label>
                  <input
                    type="number"
                    className="form-control"
                    value={draft.priceYearly}
                    onChange={(e) =>
                      setDraft({ ...draft, priceYearly: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Tier</label>
                  <select
                    className="form-select"
                    value={draft.tier}
                    onChange={(e) =>
                      setDraft({ ...draft, tier: e.target.value })
                    }
                  >
                    <option value="free">free</option>
                    <option value="basic">basic</option>
                    <option value="premium">premium</option>
                    <option value="enterprise">enterprise</option>
                    <option value="custom">custom</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label">Essai (j)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={draft.trialDays}
                    onChange={(e) =>
                      setDraft({ ...draft, trialDays: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Max pros</label>
                  <input
                    type="number"
                    className="form-control"
                    value={draft.maxExperts}
                    onChange={(e) =>
                      setDraft({ ...draft, maxExperts: e.target.value })
                    }
                    title="0 = illimité"
                  />
                </div>
                <div className="col-md-2 form-check mt-4 ms-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isDefault"
                    checked={draft.isDefault}
                    onChange={(e) =>
                      setDraft({ ...draft, isDefault: e.target.checked })
                    }
                  />
                  <label className="form-check-label" htmlFor="isDefault">
                    Défaut
                  </label>
                </div>
                <div className="col-md-2 form-check mt-4">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isHighlighted"
                    checked={draft.isHighlighted}
                    onChange={(e) =>
                      setDraft({ ...draft, isHighlighted: e.target.checked })
                    }
                  />
                  <label className="form-check-label" htmlFor="isHighlighted">
                    Mis en avant
                  </label>
                </div>
              </div>

              {Object.entries(groupedFeatures).map(([group, feats]) => (
                <div key={group} className="mb-3">
                  <h6 className="text-uppercase text-muted">{group}</h6>
                  <div className="row">
                    {feats.map((f) => {
                      const on = draft.features.includes(f.key);
                      return (
                        <div className="col-md-6 mb-2" key={f.key}>
                          <label
                            className={`d-flex align-items-start gap-2 p-2 rounded border ${
                              on ? "border-success bg-light" : ""
                            }`}
                            style={{ cursor: "pointer" }}
                          >
                            <input
                              type="checkbox"
                              className="mt-1"
                              checked={on}
                              onChange={() => toggleFeature(f.key)}
                            />
                            <span>
                              <strong>{f.label}</strong>
                              <br />
                              <small className="text-muted">
                                {f.key} — {f.description}
                              </small>
                            </span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-4 text-muted">Sélectionnez un plan</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
