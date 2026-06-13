/**
 * Mémoire capillaire Skedisy — localStorage (aligné app Flutter).
 */
(function (global) {
  const STORAGE_KEY = 'skedisy_hair_profile';
  const PROMPTED_KEY = 'skedisy_hair_profile_prompted';

  const FIELDS = {
    hairType: {
      questionKey: 'hairProfile.q1',
      options: ['hairType4c', 'hairType4b', 'hairType4a', 'hairType3c', 'hairTypeOther'],
    },
    hairCondition: {
      questionKey: 'hairProfile.q2',
      options: ['hairCondHealthy', 'hairCondDry', 'hairCondDamaged', 'hairCondTransition'],
    },
    styleInterest: {
      questionKey: 'hairProfile.q3',
      options: [
        'hairInterestBraids',
        'hairInterestLocks',
        'hairInterestNatural',
        'hairInterestWigs',
        'hairInterestMen',
        'hairInterestCare',
      ],
    },
    scalpSensitivity: {
      questionKey: 'hairProfile.q4',
      options: ['scalpNormal', 'scalpSensitive'],
    },
    bookingGoal: {
      questionKey: 'hairProfile.q5',
      options: ['goalEveryday', 'goalEvent', 'goalVacation', 'goalNewLook'],
    },
  };

  function t(key) {
    if (typeof getTranslation === 'function') return getTranslation(key);
    return key;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw) || {};
    } catch (_) {
      return {};
    }
  }

  function save(profile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  function isComplete(profile) {
    const p = profile || load();
    return Object.keys(FIELDS).every((k) => p[k] && String(p[k]).length > 0);
  }

  function hasBeenPrompted() {
    return localStorage.getItem(PROMPTED_KEY) === '1';
  }

  function markPrompted() {
    localStorage.setItem(PROMPTED_KEY, '1');
  }

  function getApiFields() {
    const p = load();
    const out = {};
    if (p.hairType) out.hairType = t('hairProfile.' + p.hairType);
    if (p.hairCondition) out.hairCondition = t('hairProfile.' + p.hairCondition);
    if (p.styleInterest) out.styleInterest = t('hairProfile.' + p.styleInterest);
    if (p.scalpSensitivity) out.scalpSensitivity = t('hairProfile.' + p.scalpSensitivity);
    if (p.bookingGoal) {
      out.bookingGoal = t('hairProfile.' + p.bookingGoal);
      out.occasion = out.bookingGoal;
    }
    return out;
  }

  function appendToFormData(formData) {
    const fields = getApiFields();
    Object.entries(fields).forEach(([k, v]) => {
      if (v) formData.append(k, v);
    });
  }

  function renderStrip(mountEl) {
    if (!mountEl) return;
    const profile = load();
    const editLabel = t('hairProfile.edit');

    if (!isComplete(profile)) {
      mountEl.innerHTML = `
        <a href="hair-profile.html" class="sq-hair-strip sq-hair-strip--incomplete">
          <i class="fas fa-spa" aria-hidden="true"></i>
          <span>${escapeHtml(t('hairProfile.incomplete'))}</span>
          <i class="fas fa-chevron-right" aria-hidden="true"></i>
        </a>`;
      return;
    }

    const summary = [profile.hairType, profile.styleInterest]
      .filter(Boolean)
      .map((id) => t('hairProfile.' + id))
      .join(' · ');

    mountEl.innerHTML = `
      <a href="hair-profile.html" class="sq-hair-strip sq-hair-strip--complete">
        <i class="fas fa-check-circle" aria-hidden="true"></i>
        <span><strong>${escapeHtml(t('hairProfile.summary'))}:</strong> ${escapeHtml(summary)}</span>
        <span class="sq-hair-strip__edit">${escapeHtml(editLabel)}</span>
      </a>`;
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function maybePromptOnHome() {
    if (isComplete() || hasBeenPrompted()) return;
    if (!document.body.classList.contains('sq-page') || document.body.dataset.page !== 'client') return;
    if (!document.getElementById('sqIntentHub')) return;

    markPrompted();
    window.location.href = 'hair-profile.html?return=' + encodeURIComponent(window.location.pathname.split('/').pop() || 'index.html');
  }

  function mountProfilePage(root) {
    if (!root) return;
    const profile = load();
    let html = `<p class="sq-hair-lead">${escapeHtml(t('hairProfile.lead'))}</p>`;

    Object.entries(FIELDS).forEach(([field, cfg]) => {
      html += `
        <div class="sq-hair-section" data-field="${field}">
          <h2 class="sq-hair-section__title">${escapeHtml(t(cfg.questionKey))}</h2>
          <div class="sq-hair-chips" role="group">`;
      cfg.options.forEach((optId) => {
        const selected = profile[field] === optId;
        html += `
          <button type="button" class="sq-hair-chip${selected ? ' sq-hair-chip--selected' : ''}"
            data-field="${field}" data-value="${optId}" aria-pressed="${selected}">
            ${escapeHtml(t('hairProfile.' + optId))}
          </button>`;
      });
      html += `</div></div>`;
    });

    html += `
      <div class="sq-hair-actions">
        <button type="button" class="sq-btn sq-btn-fill" id="hairProfileSaveBtn" disabled>
          ${escapeHtml(t('hairProfile.save'))}
        </button>
      </div>`;

    root.innerHTML = html;

    const state = { ...profile };

    function updateSaveBtn() {
      const btn = document.getElementById('hairProfileSaveBtn');
      if (!btn) return;
      btn.disabled = !isComplete(state);
    }

    root.querySelectorAll('.sq-hair-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const field = chip.dataset.field;
        const value = chip.dataset.value;
        state[field] = value;
        root.querySelectorAll(`.sq-hair-chip[data-field="${field}"]`).forEach((c) => {
          const on = c.dataset.value === value;
          c.classList.toggle('sq-hair-chip--selected', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        updateSaveBtn();
      });
    });

    document.getElementById('hairProfileSaveBtn')?.addEventListener('click', () => {
      if (!isComplete(state)) return;
      save(state);
      const back = new URLSearchParams(window.location.search).get('return') || 'index.html';
      window.location.href = back;
    });

    updateSaveBtn();
  }

  function refreshStrips() {
    document.querySelectorAll('[data-hair-profile-strip]').forEach((el) => renderStrip(el));
  }

  global.SkedisyHairProfile = {
    FIELDS,
    load,
    save,
    isComplete,
    hasBeenPrompted,
    markPrompted,
    getApiFields,
    appendToFormData,
    renderStrip,
    mountProfilePage,
    refreshStrips,
    maybePromptOnHome,
  };

  document.addEventListener('DOMContentLoaded', () => {
    refreshStrips();
    const pageRoot = document.getElementById('hairProfilePageRoot');
    if (pageRoot) mountProfilePage(pageRoot);
    maybePromptOnHome();
  });

  document.addEventListener('skedisy:language-changed', () => {
    refreshStrips();
    const pageRoot = document.getElementById('hairProfilePageRoot');
    if (pageRoot) mountProfilePage(pageRoot);
  });
})(typeof window !== 'undefined' ? window : globalThis);
