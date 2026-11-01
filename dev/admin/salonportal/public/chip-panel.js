/**
 * Panneau Position / Date — ancré sous le chip (style Adencer), sans scroll page.
 */
(function () {
  let lockCount = 0;
  let repositionHandler = null;

  function lockPage() {
    if (lockCount === 0) {
      const y = window.scrollY || window.pageYOffset || 0;
      document.body.dataset.chipScrollY = String(y);
      document.body.classList.add("sq-chip-panel-open");
      document.body.style.position = "fixed";
      document.body.style.top = `-${y}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    }
    lockCount += 1;
  }

  function unlockPage() {
    if (lockCount === 0) return;
    lockCount -= 1;
    if (lockCount > 0) return;
    const y = parseInt(document.body.dataset.chipScrollY || "0", 10) || 0;
    document.body.classList.remove("sq-chip-panel-open");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    delete document.body.dataset.chipScrollY;
    window.scrollTo(0, y);
  }

  function ensureBackdrop() {
    let el = document.getElementById("sqChipPanelBackdrop");
    if (!el) {
      el = document.createElement("div");
      el.id = "sqChipPanelBackdrop";
      el.className = "sq-chip-panel-backdrop";
      el.hidden = true;
      el.addEventListener("click", () => {
        window.SkedisyChipPanel?.closeAll?.();
      });
      document.body.appendChild(el);
    }
    return el;
  }

  function showBackdrop() {
    const el = ensureBackdrop();
    el.hidden = false;
  }

  function hideBackdrop() {
    const el = document.getElementById("sqChipPanelBackdrop");
    if (el) el.hidden = true;
  }

  const anchors = new WeakMap();

  function mountPanel(popover) {
    if (!popover || popover.parentElement === document.body) return;
    anchors.set(popover, {
      parent: popover.parentElement,
      next: popover.nextSibling,
    });
    document.body.appendChild(popover);
  }

  function restorePanel(popover) {
    if (!popover) return;
    const anchor = anchors.get(popover);
    if (!anchor || !anchor.parent) return;
    if (anchor.next && anchor.next.parentNode === anchor.parent) {
      anchor.parent.insertBefore(popover, anchor.next);
    } else {
      anchor.parent.appendChild(popover);
    }
    anchors.delete(popover);
    popover.style.top = "";
    popover.style.left = "";
    popover.style.width = "";
    popover.style.transform = "";
    popover.style.maxWidth = "";
  }

  /**
   * Aligne le panneau sous le chip (pas au centre de la page).
   */
  function positionUnder(popover, anchorEl, opts) {
    if (!popover || !anchorEl) return;
    const preferWidth = Number(opts?.minWidth) || 280;
    const r = anchorEl.getBoundingClientRect();
    const maxW = Math.min(Math.max(preferWidth, r.width), window.innerWidth - 16);
    let left = r.left;
    if (left + maxW > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - maxW - 8);
    }
    if (left < 8) left = 8;

    popover.style.position = "fixed";
    popover.style.transform = "none";
    popover.style.width = `${maxW}px`;
    popover.style.maxWidth = `${maxW}px`;
    popover.style.left = `${left}px`;
    popover.style.top = `${r.bottom + 8}px`;
    popover.style.zIndex = "100110";

    requestAnimationFrame(() => {
      const pr = popover.getBoundingClientRect();
      if (pr.bottom > window.innerHeight - 8) {
        const above = r.top - pr.height - 8;
        popover.style.top = `${Math.max(8, above)}px`;
      }
    });
  }

  function bindReposition(popover, anchorEl, opts) {
    unbindReposition();
    repositionHandler = () => positionUnder(popover, anchorEl, opts);
    window.addEventListener("resize", repositionHandler);
    window.addEventListener("orientationchange", repositionHandler);
  }

  function unbindReposition() {
    if (!repositionHandler) return;
    window.removeEventListener("resize", repositionHandler);
    window.removeEventListener("orientationchange", repositionHandler);
    repositionHandler = null;
  }

  function closeAll() {
    unbindReposition();
    const locPop = document.getElementById("homeLocationPopover");
    const datePop = document.getElementById("homeDatePopover");
    if (locPop) {
      locPop.hidden = true;
      restorePanel(locPop);
    }
    if (datePop) {
      datePop.hidden = true;
      restorePanel(datePop);
    }
    document.getElementById("homeLocationChip")?.setAttribute("aria-expanded", "false");
    document.getElementById("homeDateChip")?.setAttribute("aria-expanded", "false");
    document.querySelector(".sq-location-chip-wrap")?.classList.remove("is-open");
    document.querySelector(".sq-date-chip-wrap")?.classList.remove("is-open");
    while (lockCount > 0) unlockPage();
    hideBackdrop();
  }

  window.SkedisyChipPanel = {
    lockPage,
    unlockPage,
    showBackdrop,
    hideBackdrop,
    mountPanel,
    restorePanel,
    positionUnder,
    bindReposition,
    unbindReposition,
    closeAll,
  };
})();
