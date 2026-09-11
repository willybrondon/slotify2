# SQUIRE Blueprint — Skedisy pour les salons Afro (Île-de-France)

**Date :** 2026-09-11  
**Statut :** décision produit initiale (sans interviews terrain)  
**Source de vérité initiale :** avis Google + crawl public + Prompts 1–6  
**Sample ancré :** 329 salons Afro pertinents IDF · ≤5 avis API/salon  
**Règle :** FACT · PATTERN · INFERENCE · HYPOTHESIS — jamais confondre

---

## Positionnement de cette phase

Nous **décidons volontairement** de construire le blueprint à partir des données publiques déjà extraites.  
Les réseaux sociaux serviront ensuite à **commercialiser**, observer les réactions, et créer une boucle d’amélioration — pas à retarder le design du wedge.

**Ce que Skedisy ne sera pas :** clone Planity / Fresha / Booksy · simple agenda · marketplace · CRM générique · IA gadget.

**Ce que Skedisy doit devenir :** le système métier quotidien qui convertit une demande Afro complexe en **prestation configurée + prix + durée + acompte**, puis en créneau tenu.

---

# 1. Source de vérité & discipline

| Niveau | Définition | Exemple |
|---|---|---|
| **FACT** | Observable dans les données | 90/329 salons avec thème avis qualité/mèches |
| **PATTERN** | Récurrence multi-salons / multi-avis | Prix imprévisible (78), durée (57), malentendu (54) |
| **INFERENCE** | Interprétation raisonnable | Le catalogue plat ne verrouille pas prix/durée |
| **HYPOTHESIS** | Non prouvé ops | Le salon « perd des heures/jour » dans WhatsApp |

**Limites assumées :** pas d’inbox WA/IG privées · pas de logs durée prévue/réelle · pas de taux no-show mesuré · avis API biaisés (extrêmes, ≤5).

---

# 2. Synthèse unique (ne pas recommencer l’analyse)

| Livrable | Apport |
|---|---|
| Extract Places IDF | Établissements, notes, avis, contacts publics |
| Prompt 1 | 329 Afro pertinents (104 braids, 72 afro, 54 locks, 46 extensions…) |
| Prompt 2 | Parcours public, outils détectés, matrice 763 rows |
| Prompt 3 | TOP20 SQUIRE + scores WTP |
| Prompt 4 | Wedge fondateur : Qualif → devis/durée → acompte |
| Prompt 5 | Cartographie épistémique O1–O7 |
| Prompt 6 | Thèse produit / engines / MVP |

### Snapshot FACT (Prompt 2 patterns)

| Signal | Valeur |
|---|---|
| Sans widget booking classique | **249/329** |
| Planity détecté | 39 |
| Acompte non visible (site) | **161/329** |
| Thème avis qualité/mèches | **90** |
| Prix / écart | **78** |
| Durée prestation | **57** |
| Malentendu prestation | **54** |
| Réservation difficile | **44** |
| Communication | **43** |
| Attente / retard | **41** |
| Annulation / no-show (avis) | **5** (signal faible) |

---

# 3. Carte des problèmes (avis Google)

Comptage = **salons** avec ≥1 avis touchant le thème (pas volume absolu d’avis du marché).

| # | Problème apparent | Salons | Catégorie | Gravité | Impact € (pot.) | Satisfaction | Résolvable logiciel ? | Confiance signal |
|---|---|---:|---|---:|---|---|---|---|
| 1 | Qualité / mèches / cheveux | 90 | Supply + exécution | 9 | Élevé (reprises, litiges) | Fort | Partiel (process amont) | Haute (thème) / Faible (cause) |
| 2 | Prix final ≠ annoncé | 78 | Devis | 8 | Élevé (litige, note) | Fort | Oui (devis verrouillé) | Haute |
| 3 | Prestation trop longue | 57 | Durée / planning | 8 | Élevé (créneaux brûlés) | Fort | Oui (durée dynamique) | Haute |
| 4 | Malentendu prestation | 54 | Qualification | 9 | Élevé | Fort | Oui (config + photo) | Haute |
| 5 | Réservation difficile | 44 | Accès / friction | 7 | Moyen-élevé | Moyen | Oui (lien self-serve) | Moyenne-haute |
| 6 | Communication / flou | 43 | Ops canal | 7 | Moyen | Moyen | Partiel (statut + notifs) | Moyenne |
| 7 | Attente / retard | 41 | Planning | 7 | Moyen | Fort | Oui (durée + buffer) | Haute |
| 8 | Hygiène / accueil | 32 | Ops salon | 6 | Moyen | Fort | Non (hors scope) | Haute |
| 9 | Annulation / no-show | 5 | Engagement | 9 | Élevé *si fréquent* | — | Oui (acompte) | **Faible** (avis) |
| 10 | Acompte mentionné | 3 | Paiement | — | — | — | — | Très faible en avis |

**Structure marché (FACT complémentaire) :** majorité sans booking classique → confirmation souvent manuelle (**INFERENCE**).

---

# 4. Problèmes profonds (derrière l’avis)

| Avis apparent | Problème structurel | Formulation produit |
|---|---|---|
| « J’ai payé plus cher » | Pas de **définition partagée** de la prestation avant le jour J | Service Engine + Pricing Engine → devis accepté |
| « Ce n’était pas ce que j’avais demandé » | Inspiration ≠ config formalisée | Photo + paramètres minimaux + confirmation visuelle |
| « Ça a duré 6h au lieu de 4h » | Durée catalogue ≠ durée **configurée** | Duration Engine + buffer + capture réelle |
| « Les mèches étaient moches / pas les bons » | Supply & attentes non alignées amont | Preparation Engine (checklist + qui fournit) |
| « Difficile de réserver / pas de réponse » | Demande dans un canal sans **workflow** | Lien Skedisy depuis WA/IG (scénario C) |
| « J’ai attendu 1h » | Planning en accordéon (durée + retards chaînés) | Durée dynamique + politique créneau |
| « No-show » (rare dans avis) | Créneau long **non engagé** financièrement | Acompte lié au devis (**HYPOTHESIS** fréquence) |

**Problème profond unifié (INFERENCE ancrée) :**

> Le salon et la cliente ne partagent pas une définition suffisamment précise de la prestation (quoi / combien / combien de temps / qui apporte quoi) **avant** de bloquer un créneau de plusieurs heures.

---

# 5. Moments de vérité (où l’expérience se dégrade)

Concentration des plaintes → moments à protéger en priorité :

```
Découverte ─────────────── faible dans avis (acquisition OK souvent)
Choix / inspiration ────── PATTERN malentendu (54)
« Réservation » ─────────── PATTERN friction (44) + absence outil (249)
Qualification / prix ────── PATTERN prix (78) + comprehension (54)  ← MOMENT CRITIQUE
Préparation / mèches ────── PATTERN qualité (90)                    ← MOMENT CRITIQUE
Arrivée / attente ───────── PATTERN retard (41)
Prestation / durée ──────── PATTERN durée (57)
Paiement final ──────────── PATTERN écart prix (78)
Résultat / après-vente ──── QUALITÉ (90) + note Google
```

**Verdict :** le « moment de vérité » n’est pas le clic calendrier.  
C’est la **fenêtre amont** : qualification → prix/durée → préparation → engagement.

---

# 6. Workflow métier dynamique (pas un tunnel unique)

| Tier | Exemple | Processus |
|---|---|---|
| **S0 Simple** | Coupe homme courte | Service → créneau → (acompte optionnel) → confirm |
| **S1 Moyen** | Retwist / entretien locks | Service + 1–3 params → prix/durée → créneau → acompte soft |
| **S2 Complexe** | Box / Knotless | Style/photo + longueur + taille + mèches → devis → durée → acompte → prep |
| **S3 Très complexe** | Photo perso / multi-couleurs / lace custom | Photo obligatoire + questions ciblées → devis (validation pro possible) → acompte → checklist prep |

**Règle :** le booking est la **conséquence** du tier, pas le produit entier.

---

# 7. Règle UX absolue

> **La complexité est absorbée par Skedisy, pas transférée à la cliente.**

- Interdit : formulaire unique de 15 champs.
- Obligatoire : **Complexity Engine** — nombre de questions = f(tier service).
- Photo = raccourci de qualification quand le style est custom.
- Après 1ère prestation : « Reprendre ma config » (Client Memory).

---

# 8. Skedisy Service Engine

Chaque prestation = **objet configurable** (pas une ligne catalogue plate).

| Variable | Preuve | Importance | Impact prix | Impact durée | Obligatoire ? |
|---|---|---:|---|---|---|
| Famille de service | FACT catégories + sites | 10 | Élevé | Élevé | Oui |
| Style / nom presta | FACT catalogues | 9 | Élevé | Élevé | Oui (S1+) |
| Photo inspiration | PATTERN malentendu + sites | 9 | Indirect | Indirect | S3 oui / S2 reco |
| Longueur | FACT suppléments / avis | 9 | Élevé | Élevé | S2+ |
| Taille / volume (S/M/L…) | FACT catalogues | 8 | Élevé | Élevé | S2+ |
| Qui fournit les mèches | FACT avis qualité (90) | 9 | Élevé | Moyen | S2+ |
| Type / qualité mèches (si salon) | PATTERN qualité | 7 | Moyen | Faible | Facultatif V1 |
| Couleur / multi-couleurs | FACT catalogues | 7 | Moyen | Moyen | Si applicable |
| Densité / texture naturelle | Métier (peu dans data) | — | — | — | **Ne pas imposer V1** |

**V1 :** le pro définit quelles variables existent pour *ses* services. Skedisy n’impose pas une taxonomie universelle figée.

---

# 9. Pricing Engine

Objectif : finir les situations « prix annoncé ≠ prix final ».

| Élément | Comportement |
|---|---|
| Prix de base | Défini par le salon |
| Suppléments | Règles (longueur, taille, mèches salon, multi-couleur…) |
| Prix final affiché | Calculé **avant** acompte |
| Acompte | % ou montant fixe par famille / durée |
| Override | Pro peut ajuster un devis outlier |

**Skedisy n’impose pas les tarifs** — il structure les règles du salon.  
**FACT :** litiges prix existent. **HYPOTHESIS :** devis digital accepté ↓ litiges.

---

# 10. Duration Engine

| Élément | V1 | V2+ |
|---|---|---|
| Durée de base | Règle salon | Idem |
| Modificateurs | Longueur, taille, options | + historique |
| Buffer sécurité | Option pro | Calibré |
| Durée réelle | Capture 1 tap post-presta | Recalage estimateur |
| Préparation | Temps prep checklist | — |

Objectif : éviter « 4h prévues → 6h réelles ».  
**Moat futur (HYPOTHESIS plateforme) :** couples (config → durée réelle) par salon / service.

---

# 11. Booking Engine

Séquence obligatoire :

1. Quel service ?  
2. Quelle configuration ?  
3. Quel prix ?  
4. Quelle durée ?  
5. Quel pro ? (simple V1 ; multi-staff later)  
6. Quel créneau ?  
7. Quel acompte ?  
8. **CONFIRMER**

Le calendrier sans 2–4–7 = Planity.  
Avec 2–4–7 = Skedisy.

---

# 12. Preparation Engine

Ancré sur le thème #1 avis (qualité/mèches).

**Avant le RDV, afficher :**

- Qui apporte les mèches (cliente / salon)  
- Quantité / couleur indicatives (si renseignées)  
- Instructions cliente (cheveux propres, détachés, etc. — texte salon)  
- Photo de référence validée  
- Rappels J-2 / J-1  

**Pas en V1 :** ERP stock, marketplace mèches, commandes fournisseurs.  
**Distinction critique :** problème logiciel (alignement) ≠ skill / formation / supply marché.

---

# 13. Beauty CRM (métier, pas générique)

| Donnée | Utile ? | Pourquoi |
|---|---|---|
| Nom / tél | Oui | Base |
| Historique prestations | **Oui** | Rebook |
| Config (longueur, taille, couleur) | **Oui** | Devis suivant |
| Photos | **Oui** | « Comme la dernière » |
| Qui / type mèches | **Oui** | Litiges |
| Prix & durée réels | **Oui** | Planning + CA |
| Préférences notes | Oui | Ops |
| Points fidélité génériques | Non V1 | Distraction |
| Feed social | Non | Distraction |

**Dépendance produit =** historique coiffure + photos + configs, pas le calendrier.

---

# 14. Client Memory

Réutilisation auto :

> « Reprendre ma dernière configuration » → prérempli → cliente ne change que le delta.

Réduit la friction *et* augmente la précision devis/durée.  
**V1.5 / Phase 3** après que le wedge collecte déjà des configs.

---

# 15. WhatsApp / Instagram — décision

| Modèle | Verdict |
|---|---|
| **A** Remplacer WA | **Non** (V1) — adoption non prouvée ; friction culturelle |
| **B** WA complète Skedisy | Compatible |
| **C** WA/IG = découverte → lien Skedisy = moteur qualif+devis+acompte | **CHOIX** |

**PATTERN :** 249 sans booking classique + canaux publics tél/WA.  
**INFERENCE :** le lien dans le chat est le plus petit pas d’adoption.  
**Ne pas conclure :** « WhatsApp est l’OS » (HYPOTHESIS non mesurée).

**Rôle des réseaux ensuite :** acquisition, preuve sociale, feedback produit — pas source de vérité ops pour cette phase.

---

# 16. SQUIRE Test (filtre features)

| Feature | Q1 Afro? | Q2 Douloureux? | Q3 Régulier? | Q4 € pro? | Q5 Difficile concurrents? | Q6 Data moat? | Q7 WTP? | Priorité |
|---|---|---|---|---|---|---|---|---|
| Config + devis + durée + acompte | Oui | Oui | Oui | Oui | Oui | Oui | Oui | **MUST** |
| Complexity engine | Oui | Oui | Oui | Oui | Oui | Oui | Oui | **MUST** |
| Prep checklist mèches | Oui | Oui | Oui | Moyen | Moyen | Moyen | Moyen | Early OS |
| Client Memory | Oui | Moyen | Oui | Moyen | Moyen | **Oui** | Moyen | Phase 3 |
| Agenda multi-staff | Non | Moyen | Oui | Moyen | Non | Non | Moyen | Later |
| Marketplace | Non | Non | — | Faible | Non | Faible | Non | **NON** |
| Chatbot IA | Non | Non | — | Faible | Non | Non | Non | **NON** |
| Fidélité points | Non | Non | — | Faible | Non | Non | Non | **NON** |

---

# 17. Skedisy Moat (capacité future — pas data actuelle)

Données à accumuler progressivement :

| Data | Moat potentiel |
|---|---|
| Configs × prix acceptés | Pricing intelligence verticale |
| Configs × durées réelles | Duration moat défendable |
| Photos ↔ styles ↔ outcomes | Qualité matching |
| Prep / mèches / litiges | Réduction risque |
| Fréquence rebook / panier | LTV salon |
| Annulations / acomptes | Politiques optimales |

**Aujourd’hui :** nous n’avons **pas** cette data propriétaire.  
**Demain :** chaque réservation Skedisy en produit.

---

# 18. MVP — 5 fonctionnalités max

| # | Feature | Problème | Preuve avis / data | User | Workflow | Écran | Donnée | KPI |
|---|---|---|---|---|---|---|---|---|
| **1** | Lien de demande public | Friction résa / chaos canal | 249 sans booking ; 44 résa difficile | Cliente + pro | Ouvre lien → demande | Landing salon | Salon ID, canal | Demandes / semaine |
| **2** | Complexity Engine | Malentendu presta | 54 comprehension ; catégories S2 | Cliente | Questions min selon tier | Flow adaptatif | Réponses + photo | % demandes complètes |
| **3** | Devis + durée estimés | Prix & durée imprévisibles | 78 prix ; 57 durée | Les deux | Config → devis affiché | Écran devis | Règles salon | % devis acceptés |
| **4** | Acompte lié au devis | Créneau long non engagé | 161 sans politique visible ; no-show UNKNOWN | Cliente | Paiement → confirm | Checkout | Montant, status | % acomptes / devis |
| **5** | Dashboard demandes pro | Charge mentale confirmation | 43 com ; wedge O1 | Pro | Inbox structurée | Liste status | Status pipeline | Demandes traitées / j |

**Hors MVP volontairement :** CRM complet, sync Planity, multi-staff, AI, marketplace, ERP mèches.

---

# 19. Ne pas construire (discipline)

- Réseau social / feed communautaire  
- Marketplace massive de salons  
- Chatbot généraliste / IA gadget  
- Parité calendrier Planity  
- Fidélité points générique  
- Remplacement forcé de WhatsApp  
- ERP stock mèches V1  
- Recommandations beauté génériques  
- Features « impressionnantes » sans ROI pro  

---

# 20. Stratégie de construction

### Phase 1 — Wedge (0–3 mois)
**Quoi :** 5 features MVP (§18)  
**Objectif :** 20 salons utilisent le lien chaque semaine  
**KPI :** demandes → acomptes ; salons actifs / sem  
**Pourquoi avant :** seule couche différenciante vs Planity

### Phase 2 — Operating system léger (3–6 mois)
**Quoi :** prep checklist, rappels, capture durée réelle, créneaux plus solides / sync soft  
**Objectif :** Skedisy gère le jour J, pas seulement le lead  
**KPI :** % RDV avec checklist complétée ; écart durée prévu/réel  
**Dépend de :** volume de configs Phase 1

### Phase 3 — Beauty CRM + Client Memory (6–9 mois)
**Quoi :** historique, photos, « reprendre ma presta »  
**Objectif :** dépendance + rebook 1 clic  
**KPI :** % rebook via memory ; rétention salons  
**Dépend de :** historique réel Phase 1–2

### Phase 4 — Data / intelligence (9–12 mois)
**Quoi :** meilleure estimation durée/prix *par salon*, analytics ops  
**Objectif :** avantage data  
**KPI :** erreur durée ↓ ; litiges prix ↓ (proxy avis / tickets)  
**Dépend de :** volume couples config→outcome

### Phase 5 — Platform (12+ mois)
**Quoi :** effets de réseau prudents (pro tips, benchmarks anonymes, éventuellement supply)  
**Objectif :** élargir sans perdre le wedge  
**KPI :** multi-site, LTV, expansion services  
**Dépend de :** OS adopté quotidiennement

---

# 21. Définition du succès

**Métrique ultime :**

> Combien de salons utilisent Skedisy **quotidiennement** pour gérer leurs demandes / prestations complexes ?

| Niveau | Métriques |
|---|---|
| Usage | Salons actifs hebdo ; demandes / salon / sem |
| Conversion | Demande → devis → acompte → RDV honoré |
| Rétention | Salons M1 / M3 / M6 |
| Dépendance | % demandes complexes passées par Skedisy (vs WA seul) — **à estimer** |
| Économie | Acomptes collectés ; créneaux ≥Xh protégés ; (later) litiges ↓ |
| Qualité ops | Écart durée ; % configs complètes avant J |

**Pas la métrique vanité :** volume brut de réservations marketplace.

---

# 22. SI NOUS DEVIONS CONSTRUIRE SKEDISY À PARTIR DE ZÉRO AUJOURD’HUI

### 1. Vision
Le système d’exploitation des **prestations Afro complexes** en Île-de-France — de la demande à l’engagement, puis à la mémoire cliente.

### 2. Problème principal
Salon et cliente ne verrouillent pas ensemble **quoi / prix / durée / préparation** avant un créneau de plusieurs heures.

### 3. Wedge
**Qualif adaptative → devis + durée → acompte**, via un lien depuis WhatsApp / Instagram / Google.

### 4. 5 fonctionnalités MVP
1. Lien de demande  
2. Complexity Engine  
3. Devis + durée  
4. Acompte  
5. Dashboard pro des demandes  

### 5. Workflow cliente
Lien → service ou photo → 2–5 questions → prix + durée → créneau → acompte → confirmation.

### 6. Workflow professionnel
Configure règles → colle le lien → traite / valide outliers → reçoit acomptes → (plus tard) prep + durée réelle.

### 7. Différence vs Planity
Planity = agenda + catalogue.  
Skedisy = **moteur de projet capillaire** (config, prix, durée, engagement) *avant* l’agenda.

### 8. Différence vs SQUIRE
SQUIRE = OS barbershop (chair time, walk-in, tip, retail…).  
Skedisy = OS **projet Afro** (variables cheveu/mèches, devis, durée longue, prep). Même *logique* stratégique, vertical différent.

### 9. Moat futur
Base de couples **configuration ↔ prix accepté ↔ durée réelle ↔ photos ↔ outcomes**, impossible à recréer dans un agenda généraliste sans ce workflow.

### 10. Roadmap 12 mois
- **M0–3 :** wedge live · 20 salons design partners · KPI acompte  
- **M3–6 :** prep + durée réelle + rappels  
- **M6–9 :** Beauty CRM + « reprendre ma presta »  
- **M9–12 :** intelligence durée/prix par salon · analytics dépendance  

---

## Décision fondatrice (gelée pour build)

> **Skedisy = le SQUIRE des salons Afro n’est pas « mieux réserver ». C’est mieux *définir, chiffrer, enganger et préparer* la prestation Afro — chaque jour.**

Prochaine étape opérationnelle : construire le MVP §18.  
Les réseaux sociaux : commercialiser + boucle d’amélioration, sans attendre des interviews pour démarrer.
