# Principe UX — pas de « prestation sur mesure »

**Statut :** décision produit  
**Règle :** les tâches s’**incrustent** dans les étapes normales déjà présentes.  
**Interdit :** un produit / badge / CTA « Sur mesure » ou « Devis » qui fait croire à un second parcours.

---

## Ce que voit la cliente

Même flow qu’aujourd’hui :

```
Réserver → Prestations → Pro → Créneau → Contact → Paiement → Confirm
```

Si une presta a des règles salon (questions, durée variable, acompte) :
- **dans Prestations** : après le choix, 0–N questions (comme préciser la presta)
- **récap prix/durée** dans le même tunnel, puis **Continuer**
- le reste (pro, créneau, contact, paiement) = étapes existantes, enrichies si besoin

Pas de label « Sur mesure » sur la carte.  
Nom de presta = nom catalogue (ex. Knotless).  
Prix = « à partir de » si variable — langage catalogue, pas un type de produit.

---

## Où s’applique chaque chose (rappel)

| Besoin | Étape normale |
|---|---|
| Infos durée / prep | Prestations (carte + détail) |
| Questions / photo | Prestations (après sélection) |
| Prix & durée calculés | Prestations → récap, puis paiement / confirm |
| Match pro | Pro |
| Créneau long | Créneau (durée déjà calculée) |
| Acompte | Paiement |
| Checklist | Confirm + rappels |
| Question salon | Post-résa (inbox), pas une nouvelle étape cliente |

---

## Technique (interne, invisible)

`afroConfig` / `usesProjectFlow` restent des **flags salon** pour brancher des tâches —  
ce ne sont **pas** des libellés UI.

---

Aligné avec : `DECISION_RESERVATION_SANS_FRICTION.md` · `TACHES_PAR_ETAPE_WORKFLOW.md` · `STYLESEAT_LEARNINGS_PLAN.md`

**Note StyleSeat :** un Service **riche** (config + add-ons + prep) n’est **pas** un produit « Sur mesure ».  
C’est le même catalogue Knotless, avec des paramètres — comme StyleSeat braiders, sans second CTA.
