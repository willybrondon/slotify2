# Product Strategy Audit — Le SQUIRE des salons Afro (Skedisy)

**Date :** 2026-09-11  
**Sources :** extract Places + Prompts 1–5 (`skedisy_from_avis/`)  
**Sample ancré :** 329 salons Afro pertinents IDF  
**Règle :** FACT / INFERENCE / HYPOTHESIS / UNKNOWN — jamais confondre

---

# RÉPONSE EN UNE PHRASE

> **Le SQUIRE des salons Afro, ce n’est pas « la réservation en ligne ». C’est le système qui convertit une demande (photo / inspiration / WA-IG) en prestation Afro *configurée* — prix, durée, engagement financier — avant de bloquer un créneau de plusieurs heures.**

Skedisy doit maîtriser le **workflow de *projet capillaire*** (qualification → configuration → devis dynamique → durée dynamique → acompte → confirmation), pas le calendrier générique.

---

# 1. Sources & discipline

| Source | Usage |
|---|---|
| Extract Google Places (IDF, avis ≤5/salon) | FACT sur présence, notes, thèmes avis |
| Prompt 1 classification | FACT sur typologie (329 pertinents) |
| Prompt 2 fiches / matrice | FACT crawl sites + thèmes problèmes |
| Prompt 3 SQUIRE TOP20 | Ranking WTP (modèle, pas vérité terrain) |
| Prompt 4 wedge | Thèse produit (à valider) |
| Prompt 5 audit | Limites de preuve |

**Exclus :** passwords, tokens, credentials, DM privés, inbox WA non consenties.

---

# 2. Rappel opportunités (statut épistémique)

| Opp | Statut | Commentaire |
|---|---|---|
| **O1** Qualif→devis→acompte | **HYPOTHESIS forte** | Structure observée ; douleur quotidienne & WTP non mesurés |
| **O2** Durée réelle | INFERENCE + HYPOTHESIS | Avis durée/attente = FACT ; estimateur = HYPOTHESIS |
| **O3** Prix imprévisible | FACT (litiges avis) + INFERENCE (devis non verrouillé) |
| **O4** WA/IG | INFERENCE marché ; **pas** « WA = OS » sans terrain |
| **O5** Acompte | FACT absence politique visible ; no-show fréquence = UNKNOWN |
| **O6** Mèches/qualité | FACT thème avis #1 ; cause logiciel vs exécution = UNKNOWN |
| **O7** Underfit Planity | INFERENCE ; intention de switch = UNKNOWN |

---

# 3. Mécanisme SQUIRE (à reproduire, pas à copier)

| Mécanisme SQUIRE | Équivalent Skedisy |
|---|---|
| 1. Verticalisation (barbershops ≠ salons coupe) | Afro ≠ beauté européenne 30 min |
| 2. Immersion métier | Comprendre demande→qualif→mèches→durée→acompte |
| 3. Problème pro ($ / temps / ops) | Protéger créneaux 3–6h + réduire litiges |
| 4. Backend avant marketplace | Devenir indispensable au *flux de demandes*, pas seulement au listing |
| 5. ROI explicite | Heures sauvées, créneaux tenus, litiges évités — pas « pratique » |

**Pourquoi les barbershops étaient différents :** durée courte, catalogue simple, walk-in/chair time, tip culture, staffing.  
**Pourquoi l’Afro est différent (INFERENCE ancrée) :** prestations longues, variables cheveu/mèches, devis souvent « à partir de », confirmation rarement 2 clics.

---

# 4. Question centrale — réponse

**Quel système métier manque ?**

Un **moteur de configuration de prestation Afro** (complexity / pricing / duration) branché sur les canaux d’entrée réels (lien depuis WA/IG), qui produit un **engagement** (acompte) avant le calendrier.

Pas : un meilleur Google Calendar.  
Pas : plus de salons sur une marketplace.

---

# 5. Workflow prestation Afro — cartographie

```
Demande (IG/WA/Google/tél)
→ Inspiration / photo          [PROBABLE]
→ Qualification                [PROBABLE — HYPOTHESIS volume]
→ Choix / config service       [FACT complexité catégories]
→ Prix                         [FACT litiges avis]
→ Durée                        [FACT avis durée/attente]
→ Disponibilité                [MIXTE — UNKNOWN canal]
→ Acompte                      [FACT rare sur sites ; pratique UNKNOWN]
→ Confirmation                 [PROBABLE manuelle]
→ Préparation / mèches         [FACT plaintes qualité ; process UNKNOWN]
→ Prestation
→ Paiement final
→ Historique
→ Relance                      [UNKNOWN automation]
```

| Étape | Confirmé (FACT) | Probable (INFERENCE) | Hypothétique | Manque |
|---|---|---|---|---|
| Demande multi-canal | Fiches Google + sites | WA/IG majeurs | % par canal | Mesure canal |
| Photo | Mentions sites/avis | Quasi-systématique tresses | — | Observation |
| Qualif multi-variables | Catalogues complexes | Requis avant confirm | — | Checklist réelle |
| Prix dynamique | Avis écart/supplément | Variables longueur/mèches | Règles exactes | Grilles salon |
| Durée dynamique | Avis trop long/attente | Déborde créneau | Modèle prédictif | Logs prévu/réel |
| Acompte | Rarement publié | Oral / irrégulier | Réduit no-show de X% | Taux no-show |
| Prep mèches | Avis qualité | Friction supply | Module software utile | Qui fournit quoi |

---

# 6. Friction cliente — Approche A vs B

| | Approche A — formulaire 15 champs | Approche B — friction minimale |
|---|---|---|
| Idée | Cliente renseigne tout | « Je veux ça » + questions **minimales** selon complexité |
| Risque | Abandon ; Skedisy = pire que WA | Qualif insuffisante → devis faux |
| Principe | Complexité sur la cliente | **Complexité absorbée par Skedisy** |

**Choix stratégique : Approche B + Complexity Engine (section 7).**

**FACT :** les clientes abandonnent les tunnels longs (règle UX générale — pas mesuré ici sur Afro).  
**INFERENCE :** un DM « je veux des knotless » ne survivra pas à 15 champs.  
**HYPOTHESIS :** 3–6 questions adaptées + photo suffisent pour un devis engageant dans 80% des cas.

---

# 7. Complexity Engine

| Service (ex.) | Questions indispensables *avant* engagement | Après réservation OK | Mémorisable | Déductible |
|---|---|---|---|---|
| Coupe homme simple | Service + créneau | — | Historique | — |
| Retwist / entretien | Type + taille approx | Détails produits | Oui | Dernière presta |
| Box / Knotless | Photo ou style + longueur + taille + mèches (salon/cliente) | Couleur exacte si simple | Oui | — |
| Lace / perruque | Photo + type pose | Marque unité | Oui | — |
| Tissage | Photo + longueur + mèches | Technique fine | Oui | — |

**Règle MVP :**  
nombre de questions = f(complexité service).  
Jamais un formulaire unique maximaliste.

**Confiance variables :** voir §9–10 — ne pas inventer « densité » sans preuve salon.

---

# 8. Beauty CRM — données à mémoriser (avantage)

| Donnée | Utilité | Moat potentiel | Confiance besoin |
|---|---|---|---|
| Photos avant/après | Reprise « comme la dernière » | Fort | Haute |
| Style (knotless medium…) | Rebook 1 clic | Fort | Haute |
| Longueur / taille | Prix + durée | Fort | Moyenne-haute |
| Mèches (qui / type) | Litiges | Fort | Haute (avis O6) |
| Durée réelle | Planning | Fort | À construire |
| Prix accepté | Devis suivant | Moyen | Haute |
| Canal d’origine | Ops | Faible | — |
| Points fidélité génériques | Retention vanity | Faible | Distraction |

**CRM générique (nom/tél/RDV) = commodité.**  
**CRM Afro (historique coiffure + photo + mèches + durée) = dépendance.**

---

# 9. Pricing Engine — variables

| Variable | Preuve | Impact prix | Impact durée | Confiance |
|---|---|---|---|---|
| Type de service (tresses/locks/tissage…) | FACT catégories + sites | Élevé | Élevé | Haute |
| Longueur | FACT suppléments catalogues / avis | Élevé | Élevé | Haute |
| Taille / volume (ex. medium/large) | FACT catalogues Planity-like | Élevé | Élevé | Moyenne-haute |
| Mèches fournies par cliente vs salon | FACT avis qualité + mentions sites | Élevé | Moyen | Haute |
| Couleur / multi-couleurs | FACT catalogues | Moyen | Moyen | Moyenne |
| Densité / texture cheveu naturel | INFERENCE métier | Moyen | Élevé | **Faible sans terrain** |
| « Complexité » subjective | — | — | — | Ne pas inventer en V1 |

**V1 pricing :** règles salon configurables (pas ML).  
**V2 :** apprentissage depuis devis acceptés + durée réelle.

---

# 10. Duration Engine

**Boucle défendable (HYPOTHESIS de plateforme) :**

1. Estimer durée à partir config  
2. Mesurer durée réelle post-presta (input pro 1 tap)  
3. Recaler estimateur par salon / par service  

**FACT :** plaintes durée/attente existent.  
**UNKNOWN :** écart médian prévu/réel.  
**Moat :** oui *si* volume de couples (config → durée réelle) — sinon Feature.

---

# 11. Supply / préparation

| Signal | Statut |
|---|---|
| Plaintes mèches/qualité | FACT (90 salons) |
| Process commande mèches / stock | UNKNOWN |
| Module supply software utile | HYPOTHESIS — distinguer exécution vs process |

**MVP :** checklist « qui apporte les mèches » + photo validation — **pas** un ERP stock.  
**Later :** prep list J-1.  
**Distraction :** marketplace mèches V1.

---

# 12. CRM métier vs générique

Voir §8.  
**Dépendance =** historique presta + photos + paramètres + durée réelle + devis.  
Sans ça, Skedisy = lien de paiement jetable.

---

# 13. WhatsApp / Instagram — 3 scénarios

| Scénario | Verdict |
|---|---|
| **A — Remplacer WA** | **Rejeté** pour V1 — UNKNOWN adoption ; friction culturelle FR |
| **B — Compléter WA** | Compatible |
| **C — WA/IG = entrée → lien Skedisy** | **CHOIX** (cohérent preuves + audit) |

**FACT :** pas d’audit inbox.  
**INFERENCE :** lien dans le chat = adoption minimale.  
**HYPOTHESIS :** le salon accepte de coller un lien s’il réduit les allers-retours.

---

# 14. SQUIRE Stack — ordre des couches

Ordre **challengé** (wedge first) :

| Priorité | Layer | Pourquoi |
|---|---|---|
| **1 (WEDGE)** | Service configuration + Pricing + Duration (léger) + Payment acompte | Cœur différenciant |
| **2** | Booking / créneau (minimal ou sync) | Nécessaire mais commoditisé |
| **3** | Prep checklist mèches | Réduit litiges O6 |
| **4** | CRM historique | Lock-in positif |
| **5** | Scheduling multi-staff avancé | OS later |
| **6** | Analytics | After usage |
| **7** | AI | Après data — pas gadget V1 |
| **✗** | Marketplace / social | Distraction |

**Ne pas commencer par Layer « Booking générique ».**

---

# 15. Ranking fonctionnalités (1–10)

| Feature | Ev | Sev | Freq | Eco | Diff | Adopt | Friction cliente | WTP | Moat | **Score*** |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Lien qualif→devis→acompte | 7 | 9 | 8 | 9 | 9 | 7 | 8 | 9 | 8 | **8.3** |
| Complexity engine (questions adaptatives) | 6 | 8 | 8 | 8 | 9 | 6 | 9 | 8 | 8 | **7.8** |
| Pricing rules salon | 7 | 8 | 7 | 8 | 8 | 7 | 7 | 8 | 7 | **7.5** |
| Duration estimate + capture réelle | 6 | 8 | 7 | 8 | 8 | 6 | 8 | 8 | 9 | **7.6** |
| Acompte / politique claire | 6 | 8 | 7 | 9 | 7 | 6 | 6 | 9 | 5 | **7.0** |
| CRM photos + dernière presta | 5 | 6 | 6 | 6 | 7 | 7 | 9 | 6 | 8 | **6.7** |
| Sync calendrier / créneaux | 8 | 6 | 8 | 6 | 3 | 8 | 8 | 5 | 2 | **5.5** |
| Checklist mèches | 7 | 7 | 6 | 6 | 6 | 7 | 7 | 6 | 5 | **6.3** |
| Inbox WA unifiée | 3 | 7 | 7 | 6 | 4 | 4 | 5 | 5 | 3 | **4.9** |
| Marketplace salons | 2 | 3 | 3 | 4 | 2 | 3 | 5 | 3 | 2 | **3.0** |
| Fidélité points | 2 | 3 | 3 | 3 | 2 | 5 | 6 | 3 | 1 | **2.8** |
| Chatbot IA générique | 2 | 2 | 3 | 2 | 2 | 4 | 4 | 2 | 1 | **2.4** |

\*Score ≈ moyenne pondérée (Ev+WTP+Eco+Moat+Diff − friction inverse)/… — indicatif stratégique.

---

# 16. MUST / LATER / DISTRACTION

### A — MUST HAVE (wedge)
1. Lien public de demande  
2. Complexity engine (min questions)  
3. Photo optionnelle selon service  
4. Devis + durée estimée  
5. Acompte  
6. Confirmation créneau (manuel OK au début)  
7. Vue pro « demandes → payées »

### B — IMPORTANT LATER
- Capture durée réelle  
- CRM reprise « comme la dernière »  
- Sync Planity/Google Calendar  
- Rappels + politique annulation  
- Multi-staff  
- Analytics no-show / panier  

### C — DISTRACTION
- Marketplace grand public  
- Réseau social  
- Fidélité générique  
- Chatbot IA gadget  
- Parité feature Planity  
- ERP stock mèches V1  
- Remplacer WhatsApp de force  

---

# 17. MVP SQUIRE — « 20 salons l’utilisent tous les jours »

### Côté cliente (≤7 étapes)
1. Ouvre le lien (depuis WA/IG/bio)  
2. Choisit une famille de service *ou* envoie une photo « je veux ça »  
3. Répond 2–5 questions (selon complexité)  
4. Voit **prix estimé + durée estimée**  
5. Choisit un créneau (ou « à confirmer »)  
6. Paie l’acompte  
7. Reçoit confirmation  

### Côté professionnel
1. Configure services + règles prix/durée (setup 30–60 min)  
2. Colle le lien dans WA/IG  
3. Dashboard : nouvelles demandes / en attente / payées  
4. Confirme ou ajuste devis si outlier  
5. Jour J : marque durée réelle (1 tap) — optionnel V1.1  

### Données
Services, règles, photos, réponses, devis, paiements, créneaux, (durée réelle).

### Automatisations V1
- Message confirmation  
- Rappel J-1  
- Lien de reprise (plus tard)

### Dashboard
Kanban demandes + montant acomptes du mois.

### Paiement
Acompte Stripe/Payplug → solde en salon (V1).

### CRM V1
Fiche = coordonnées + dernier devis + photo + service.

### Notifications
SMS/email/WA template « votre devis est prêt » (lien).

---

# 18. Vision 3 niveaux

| | |
|---|---|
| **V1 WEDGE** | Convertir demande → config Afro → devis/durée → acompte |
| **V2 OS** | Planning sur durées apprises + CRM reprise + prep mèches + multi-coiffeuses |
| **V3 PLATFORM** | Dataset durée/prix Afro IDF ; éventuellement expansion niches « projet beauté long » |

---

# 19. Matrice concurrents (une chose qu’ils ne comprennent pas)

**Ce que les généralistes ne modélisent pas naturellement :**  
une prestation Afro comme **projet configurable** (photo + variables → prix/durée/engagement), pas comme ligne de catalogue fixe.

| Problème métier | Planity | Fresha | Booksy | Google | WhatsApp | **Skedisy** |
|---|---|---|---|---|---|---|
| Config prestation Afro (photo/variables) | Faible | Faible | Faible | Non | Manuel chaos | **Cœur** |
| Prix dynamique métier | Catalogue | Catalogue | Catalogue | Non | Oral | **Règles** |
| Durée dynamique | Fixe | Fixe | Fixe | Non | Au feeling | **Estim. + apprentissage** |
| Acompte lié au devis | Option / partiel | Option | Option | Non | Lien Pay bricolé | **Natif funnel** |
| Agenda créneaux | Fort | Fort | Fort | Moyen | Non | Minimal puis sync |
| Acquisition listing | Moyen | Moyen | Moyen | Fort | Non | Non (pas V1) |
| Conversation humaine | Non | Non | Non | Non | Fort | Entrée seulement |

---

# 20. Pourquoi installer / rester / migrer

| Question | Réponse métier |
|---|---|
| Pourquoi installer (avec Planity+WA+Google) ? | Parce que Planity ne sort pas un devis/durée/acompte depuis une photo DM — Skedisy colle *devant* l’agenda |
| Pourquoi payer à 6 mois ? | Moins d’allers-retours, créneaux longs mieux engagés, historique « reprendre ma coiffure », litiges prix en baisse (à mesurer) |
| Migration inverse pénible ? | Perte de l’historique config/photos/durées réelles + tunnel acompte déjà adopté par les clientes — lock-in **par valeur**, pas par contrat |

---

# 21. Test de vérité — conclusions clés

| Conclusion | Tag |
|---|---|
| Prestations Afro souvent plus complexes qu’une coupe 30 min | **FACT** (catégories + catalogues + avis) |
| Beaucoup de salons sans widget booking classique | **FACT** (249/329) |
| Acompte rarement visible sur site | **FACT** (161/329) |
| Litiges prix / qualité / durée dans avis | **FACT** |
| WA/IG = canal principal de demande | **INFERENCE** (à valider H1) |
| Funnel Skedisy réduira no-show de X% | **HYPOTHESIS** |
| Salons paieront Y€/mois | **HYPOTHESIS** |
| Density hair = variable prix universelle | **UNKNOWN** |
| Intention de quitter Planity | **UNKNOWN** |

---

# 22. 10 questions terrain (seuils)

| # | Question | Hypothèse | Signal + | Signal − | Seuil validation |
|---|---|---|---|---|---|
| 1 | Montrez les 5 dernières demandes tresses/locks/tissage et leur canal | H1 multi-canal / WA-IG | ≥3/5 hors Planity | Tout vient du widget | ≥60% hors agenda self-serve |
| 2 | Parcours d’une demande jusqu’au « confirmé » | H2 allers-retours | ≥3 étapes / photo | Confirm en 1 message | Médiane ≥3 touches |
| 3 | Dernier débordement durée : prévu vs réel | H3 | Écart ≥30–45 min | Rare / <15 min | ≥1/semaine ou ≥20% long RDV |
| 4 | Quand le prix devient définitif | H4 | Après voir cheveux/mèches | Prix fixe à la résa | Variables post-contact |
| 5 | Dernière no-show : garantie avant ? | H5 | Souvent 0€ | Acompte systématique | Acompte <50% des longs RDV |
| 6 | RDV complexe dans l’outil : hors-outil ? | H6 underfit | Contournement systématique | Tout dans l’outil | Contournement sur complex |
| 7 | Temps hier sur demandes RDV/devis | H7 coût temps | ≥45–60 min | <15 min | Médiane ≥40 min |
| 8 | Dernière mécontente : alignement amont ? | H8 | Attente ≠ brief | Exécution pure | Malentendu amont fréquent |
| 9 | Pour payer un abo, que doit changer ? | H9 WTP | Cite temps/no-show/litiges | « Rien / gratuit » | ≥5/10 citent $ ou temps |
| 10 | Interdiction WA 1 semaine : casse quoi ? | H10 | Chaos total | Contournement facile | WA critique ops |

---

# 23. DÉCISION FINALE

## 1. CE QUE SKEDISY DEVRAIT ÊTRE
Le système d’engagement des prestations Afro complexes — de la demande au créneau payé et configuré.

## 2. LE WEDGE
Qualif minimale intelligente → devis + durée → acompte, depuis un lien (WA/IG), sans remplacer l’agenda du jour 1.

## 3. LE PROBLÈME N°1
Les salons ne peuvent pas sécuriser économiquement et opérationnellement un créneau de plusieurs heures à partir d’une demande floue (photo/DM).

## 4. LE PRODUIT À CONSTRUIRE (≤8)
1. Lien de demande  
2. Complexity engine  
3. Photo  
4. Pricing rules  
5. Duration estimate  
6. Acompte  
7. Confirmation créneau (légère)  
8. Dashboard demandes  

## 5. CE QU’IL NE FAUT PAS CONSTRUIRE
Marketplace · Planity-clone · Fidélité points · Chatbot IA gadget · Remplacer WA · Réseau social · ERP mèches V1 · App cliente lourde · Acquisition ads scale · Parité POS

## 6. POURQUOI ÇA PEUT ÊTRE AUSSI IMPORTANT QUE SQUIRE
SQUIRE a verticalisé un workflow *différent* (barber). L’Afro a un workflow *différent* (projet multi-heures + supply + devis). Qui possède la config→prix→durée→engagement possède le backend du salon — l’agenda devient secondaire.

## 7. CE QUI EST PROUVÉ
Complexité verticale · sous-équipement booking · litiges prix/qualité/durée dans avis · acompte rarement transparent en public · underfit plausible des catalogues fixes

## 8. CE QUI RESTE À VALIDER
Canal mix réel · temps inbox · no-show chiffré · WTP · contournement Planity · écart durée prévu/réel · règles prix exactes

## 9. MVP 90 JOURS
- J0–30 : design rules + 5 salons design partners · prototype lien  
- J30–60 : acompte live · 10–15 salons · mesurer % demande→acompte  
- J60–90 : dashboard + durée réelle 1-tap · 20 salons actifs hebdo · go/no-go WTP  

## 10. VISION 3 ANS
Wedge engagement → CRM Afro (reprise 1 clic) → OS planning sur durées apprises → plateforme data prestations Afro (expansion géo / niches projet long) — **sans** devenir un Planity générique.

---

# RÈGLE FONDAMENTALE (rappel)

> La plus petite quantité de produit pour que le salon dise : **« Je ne peux plus travailler sans ça. »**

Ce n’est pas le nombre de features.  
C’est la maîtrise du **workflow projet Afro** — l’équivalent métier de ce que SQUIRE a fait pour le barbershop.
