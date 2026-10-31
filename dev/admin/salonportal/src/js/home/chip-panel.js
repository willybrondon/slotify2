/**
 * Panneau fixe au-dessus pour Position / Date — sans scroller la page.
 */
(function () {
  let lockCount = 0;

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
  }

  function closeAll() {
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
    closeAll,
  };
})();
