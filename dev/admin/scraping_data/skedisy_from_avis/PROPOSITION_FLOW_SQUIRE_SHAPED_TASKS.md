# Proposition — Flow SQUIRE-shaped · tâches Afro branchées · extensible

**Statut :** proposition produit — **pas d’implémentation**  
**Décision UX :** même **squelette** que SQUIRE (peu d’étapes, une réservation) ; les actions anti-friction Afro sont des **tâches** à l’intérieur des étapes, pas un second parcours.  
**Ouverture :** chaque étape a des *hooks* pour rajouter des tâches plus tard sans casser le flow.

---

## 1. Principe

| | Approche |
|---|---|
| **Garder** | Entrée → Salon → Service → Pro → Créneau → Contact → Paiement → Confirm |
| **Adapter** | À certaines étapes, exécuter 0–N **tâches** selon le service (tier / règles salon) |
| **Éviter** | Deux CTA, tunnel « devis » séparé, 13 écrans imposés à tout le monde |
| **Friction** | S0 = quasi SQUIRE ; S2/S3 = mêmes étapes, tâches en plus *dans* Service / Paiement / Confirm |

**Formule mentale cliente :** « Je réserve » (comme SQUIRE).  
**Formule système :** `étape + tasks[]` (pluggable).

---

## 2. Squelette commun (identique à SQUIRE)

```
E0  Entrée
E1  Salon
E2  Service          ← tâches Afro souvent ici
E3  Pro (barber)
E4  Créneau
E5  Contact
E6  Paiement         ← acompte / règles ici
E7  Confirm + suite  ← prep / rappels / mémoire ici
```

Même nombre d’étapes « visibles ». La profondeur change via les **tâches**, pas via de nouvelles étapes nommées « Devis » ou « Qualif ».

---

## 3. Proposition — tâches par étape

Légende tâche : **Core** = wedge V1 · **Ext** = branchable plus tard · **Skip** = 0 tâche si S0.

### E0 — Entrée
| Tâche | Rôle | Problèmes | Statut |
|---|---|---|---|
| T0.1 Lien unique (IG / Google / WA) | Remplacer le chaos DM comme OS | 5, 7, 15, 16, 27 | **Core** |
| T0.2 UTM / canal d’origine | Mesure acquisition | 15, 16 | Ext |
| T0.3 Deep link « reprendre config » | Retour cliente | 33, 39 | Ext |

### E1 — Salon
| Tâche | Rôle | Problèmes | Statut |
|---|---|---|---|
| T1.1 Afficher cadre confiance (prix+durée figés avant créneau) | Set mental projet | 1, 2, 23 | **Core** |
| T1.2 Horaires / adresse clairs | Friction info | 5 | Core léger |
| T1.3 Badge « acompte si presta longue » | Transparence | 9 | Ext |

### E2 — Service *(cœur d’adaptation Afro)*
| Tâche | Rôle | Problèmes | Statut |
|---|---|---|---|
| T2.1 Choisir service / famille guidée | Moins de liste plate | 14, 31 | **Core** |
| T2.2 **Qualif adaptive** (0–N questions) | Complexity Engine | 3, 6, 14 | **Core** |
| T2.3 Joindre **photo** inspiration (si règle service) | Alignement résultat | 21, 3, 34 | **Core** si S2+ |
| T2.4 Flag événement (mariage / shoot) | Garde-fou | 34 | Ext / Core soft |
| T2.5 **Calcul devis + durée** (inline, même écran ou sous-étape) | Verrouiller prix/temps | 4, 8, 17, 22, 30, 32 | **Core** |
| T2.6 Afficher breakdown + « accepter le devis » | Preuve / consentement | 8, 30 | **Core** |
| T2.7 Review salon si outlier | S3 | 3, 5, 34 | Ext / Core S3 |
| T2.8 Qui fournit les mèches / qualité | Supply | 6, 28 | **Core** S2+ |
| T2.9 … *(slot libre pour nouvelles tâches)* | — | futurs problèmes | **Ouvert** |

> UX : la cliente reste sur « Service ». Elle voit : choix → questions → **récap prix/durée** → Continuer. Pas un produit « Devis » séparé.

### E3 — Pro
| Tâche | Rôle | Problèmes | Statut |
|---|---|---|---|
| T3.1 Choisir pro / any | Comme SQUIRE | — | **Core** |
| T3.2 Filtrer pros capables du service **configuré** | Match skill | 35, 26 | **Core** |
| T3.3 Afficher niveau (junior/senior) si salon le renseigne | Transparence | 35 | Ext |
| T3.4 Notif si changement de pro plus tard | Confiance | 26 | Ext |

### E4 — Créneau
| Tâche | Rôle | Problèmes | Statut |
|---|---|---|---|
| T4.1 Afficher slots sur **durée du devis** (pas durée catalogue seule) | Anti-accordéon | 4, 10, 32 | **Core** |
| T4.2 Buffer salon optionnel | Retards | 10 | Ext |
| T4.3 Soft-hold TTL pendant checkout | Double book | 27 | Ext |

### E5 — Contact
| Tâche | Rôle | Problèmes | Statut |
|---|---|---|---|
| T5.1 OTP / infos légères (SQUIRE-like) | Faible friction | 5 | **Core** |
| T5.2 Lier fiche cliente existante | Mémoire | 19, 39 | Ext |
| T5.3 Prefill « dernière config » | Rebook | 33, 18 | Ext |

### E6 — Paiement
| Tâche | Rôle | Problèmes | Statut |
|---|---|---|---|
| T6.1 Montant = **acompte** si policy, sinon plein (comme SQUIRE) | Engagement | 9, 12 | **Core** |
| T6.2 Afficher **reste dû** | Anti-surprise | 17, 29 | **Core** |
| T6.3 Afficher règles annulation / report | Clarté | 24 | **Core** |
| T6.4 Appliquer promo **sur le devis** | Cohérence | 38 | Ext |
| T6.5 Reçu / preuve paiement + devis | Preuve | 30 | **Core** |

### E7 — Confirm + suite *(post-book, toujours dans le même flow)*
| Tâche | Rôle | Problèmes | Statut |
|---|---|---|---|
| T7.1 Récap figé (config + prix + durée + pro + slot) | Anti-oral | 23, 30, 1 | **Core** |
| T7.2 **Checklist prep** (mèches, lavage, arrivée) | Supply / qualité | 6, 28 | **Core** S2+ |
| T7.3 Rappels 24h / 2h (+ checklist) | Com / no-show | 11, 12, 10 | **Core** |
| T7.4 Push « salon en retard » / statut attente | Jour J | 25, 37 | Ext |
| T7.5 Jalons durée longue (optionnel) | Expérience 4–6h | 36 | Ext |
| T7.6 Check-in / durée réelle | Calibration | 4 | Ext |
| T7.7 Solde + reçu final | Pay lié devis | 17, 29 | **Core** |
| T7.8 Règle reprise (gratuite/payante) | Après-vente | 40 | Ext |
| T7.9 Sauver config + photos → « refaire la même » | CRM Afro | 18, 19, 33, 39 | Ext → Core V2 |
| T7.10 … *(ouvert)* | — | futurs | **Ouvert** |

**#20 Hygiène :** pas une tâche booking (process salon).

---

## 4. Vue « presque le même flow »

| Étape SQUIRE | Skedisy (même étape) | Delta visible cliente |
|---|---|---|
| Entrée | Entrée | Identique (lien) |
| Salon | Salon | 1 phrase de cadre |
| **Service** | **Service + qualif + devis inline** | Questions + prix/durée |
| Barber | Pro filtré | Souvent identique |
| Créneau | Créneau (durée devis) | Horaires un peu moins nombreux si longue |
| Contact | Contact | Identique |
| **Paiement** | **Acompte ou plein + reste dû** | Libellé montant |
| Confirm | Confirm + prep + rappels | Checklist si presta projet |

Friction évitée : **pas de nouveau parcours**, seulement des tâches conditionnelles.

---

## 5. Modèle d’ouverture (rajouter des tâches)

Chaque étape expose un **registre de tâches** :

```
StepDefinition {
  id: "service" | "payment" | ...
  tasks: Task[]   // ordonnées, filtrées par contexte
}

Task {
  id: string              // ex. "attach_inspiration_photo"
  when: Rule              // tier, service flags, salon config, A/B
  solves: ProblemId[]     // ex. [21, 3]
  ui: "inline" | "sheet" | "async"   // ne crée pas d’étape globale
  required: boolean
  version: number
}
```

**Règles d’extension :**
1. Nouveau problème → nouvelle **Task**, branchée sur une étape **existante** (E0–E7).
2. Interdit de créer une 8ᵉ étape « métier » sauf preuve terrain très forte.
3. `when` = false → tâche invisible (S0 reste SQUIRE-pur).
4. Panel salon active/désactive des tâches par service (`afroConfig.tasks[]` plus tard).
5. Toute tâche déclare `solves: [#…]` pour tracer couverture des 40 problèmes.

**Exemples futurs (pas encore Core) :**
- E2 : « texture cheveu » si le salon l’active  
- E4 : waitlist type SQUIRE  
- E7 : rappel « apportez le bon packing lace »  
- E6 : paiement groupé (mère/fille)

---

## 6. Mapping rapide 40 → étape (rappel)

| Étapes | Problèmes principalement couverts |
|---|---|
| E0 | 5, 7, 15, 16, 27 |
| E1 | 1, 2, 23 |
| E2 | 3, 4, 6, 8, 14, 17, 21, 22, 30–32, 34 |
| E3 | 26, 35 |
| E4 | 4, 5, 10, 32 |
| E5 | 5, 19, 33, 39 |
| E6 | 9, 12, 17, 24, 29, 30, 38 |
| E7 | 1, 6, 10–13, 18, 23, 25, 28, 33, 36, 37, 39, 40 |
| — | 20 hors scope |

---

## 7. Décision produit (à figer)

1. **Squelette = SQUIRE** (E0–E7).  
2. **Wedge = tâches Core sur E2 + E6 + E7.**  
3. **Extensibilité = registre de tâches** par étape, sans nouveau tunnel.  
4. Un seul CTA : **Réserver**.

Canvas : `skedisy-squire-shaped-tasks.canvas.tsx`
