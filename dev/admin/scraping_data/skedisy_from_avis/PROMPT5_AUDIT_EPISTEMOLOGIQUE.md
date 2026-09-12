# Audit épistémologique — conclusions Skedisy (Prompts 1–4)

**But :** ne pas confondre commentaires Internet / crawl sites avec la réalité opérationnelle du salon.  
**Sample :** **458** salons afro pertinents IDF (re-run 2026-09-11 sur extract 2973) · avis Google Places API (≤5/salon) · HTML sites publics · **pas** de DM IG/WA privés · **pas** d’interviews terrain encore.

> **Refresh chiffres :** prompts 1–3 rejoués après extract `180628`. Ordre des thèmes avis **inchangé** (qualité → prix → durée → compréhension…). Thèse O1–O7 et wedge **confirmés** — seuls les N sont mis à jour.

---

## 1. Cartographie des opportunités majeures

### O1 — Qualif → devis/durée → acompte (wedge choisi)

| Dimension | Contenu |
|---|---|
| **Observé directement** | 343/458 sans widget booking classique détecté ; 230/458 sans politique d’acompte visible sur site ; présence fréquente de téléphone / liens WA publics ; catégories prestations complexes (tresses/locks/extensions) ; avis API sur malentendu prestation (63), prix (96), durée (73), qualité/mèches (118) |
| **Déduit** | Beaucoup de demandes passent par un canal manuel (tél/WA/IG) avant confirmation ; le catalogue seul ne suffit pas à verrouiller durée/prix |
| **Hypothétique** | Le owner « perd des heures par jour » dans WhatsApp ; l’acompte via Skedisy réduira le no-show de X% ; les salons paieront Y€/mois pour ce funnel |
| **Qualité preuve** | **Moyenne-haute** sur la *structure* (absence d’outil + complexité verticale) ; **moyenne** sur la *douleur quotidienne* (avis ≠ log ops) |
| **Biais** | Collecte via requêtes « afro » ; avis API biaisés (≤5, souvent extrêmes) ; absence sur site ≠ absence en pratique (acompte peut exister en WA) |
| **Manque** | Temps réel passé en inbox ; taux no-show réel ; % demandes qui aboutissent ; usage réel Planity vs WA |
| **Question terrain** | « Montrez-moi comment vous gérez une nouvelle demande qui arrive aujourd’hui sur Instagram ou WhatsApp, du premier message jusqu’au moment où le créneau est vraiment bloqué. » |

### O2 — Durée réelle vs créneau catalogue

| Dimension | Contenu |
|---|---|
| **Observé** | 73 salons avec avis évoquant durée/trop long ; 50 attente/retard ; durées longues typiques dans le discours public (hors mesure chrono salon) |
| **Déduit** | Le planning « dérape » quand la durée estimée est fausse |
| **Hypothétique** | Un estimateur ML/règles réduira les retards de façon mesurable |
| **Qualité preuve** | **Moyenne** — thème avis réel, mais pas de logs de planning |
| **Biais** | Cliente frustrée sur-représente la durée ; les journées « qui passent bien » ne génèrent pas d’avis |
| **Manque** | Durée prévue vs réelle sur N prestations ; causes (mèches, density, skill) |
| **Question** | « Prenez le dernier RDV de tresses ou locks qui a débordé : qu’est-ce qui était prévu, qu’est-ce qui s’est passé, et comment vous avez géré les clientes suivantes ? » |

### O3 — Prix final imprévisible

| Dimension | Contenu |
|---|---|
| **Observé** | 96 salons avec avis prix/écart/supplément ; sites/Planity souvent « à partir de » (quand crawl OK) |
| **Déduit** | Le devis n’est pas verrouillé avant le jour J |
| **Hypothétique** | Un devis digital signé réduira les litiges et améliorera la note Google |
| **Qualité preuve** | **Moyenne-haute** sur existence du litige prix ; **faible** sur fréquence ops |
| **Biais** | Avis 1★ prix = sélection négative ; « cher » ≠ « écart annoncé/final » |
| **Manque** | Grille tarifaire réelle + cas où le prix change en salon |
| **Question** | « La dernière fois qu’une cliente a contesté le prix en fin de prestation : qu’est-ce qui avait été dit avant, et comment ça s’est terminé ? » |

### O4 — WhatsApp/DM comme « OS »

| Dimension | Contenu |
|---|---|
| **Observé** | Liens WA publics sur une minorité de sites ; 54 salons avis communication ; 343 sans booking détecté |
| **Déduit** | WA/IG sont des canaux majeurs de prise de RDV en France beauté |
| **Hypothétique** | Volume DM élevé et chaotique chez la majorité des salons afro IDF ; Skedisy sera adopté *à la place* de WA |
| **Qualité preuve** | **Faible-moyenne** — on n’a **pas** lu d’inbox ; sous-détection des liens WA |
| **Biais** | Projection « SMB FR = WA » (souvent vraie mais non mesurée ici) ; TikTok/IG non crawlés |
| **Manque** | Capture d’écran / parcours réel d’une demande ; outils parallèles (notes, Excel) |
| **Question** | « Ouvrez WhatsApp (ou Instagram) et montrez-moi les 5 dernières conversations liées à une demande de RDV — comment vous vous y retrouvez ? » |

### O5 — Acompte / anti-no-show

| Dimension | Contenu |
|---|---|
| **Observé** | 230 sites sans politique acompte visible ; **seulement 9** salons avec avis API annulation/no-show ; 3 avis mentionnant acompte |
| **Déduit** | L’acompte est souvent oral / non publié |
| **Hypothétique** | Le no-show est un problème économique majeur et fréquent ; l’acompte le résout |
| **Qualité preuve** | **Faible** sur la fréquence no-show ; **moyenne** sur l’absence de politique écrite |
| **Biais** | No-show rarement raconté dans un avis Google cliente ; silence ≠ absence du problème |
| **Manque** | Taux no-show / mois ; montant moyen perdu ; politique réelle (même orale) |
| **Question** | « Sur les quatre dernières semaines, combien de créneaux de plus de 2 heures ont été réservés puis non honorés — et qu’avez-vous fait concrètement ? » |

### O6 — Mèches / qualité / supply

| Dimension | Contenu |
|---|---|
| **Observé** | 118 salons avec avis qualité/cheveux/mèches (thème #1 avis) |
| **Déduit** | La supply (qui apporte les mèches, quelle qualité) est un point de friction |
| **Hypothétique** | Un module « validation mèches + photo » réduira les reprises |
| **Qualité preuve** | **Moyenne** — plaintes qualité réelles ; lien causal « process amont » non prouvé |
| **Biais** | Qualité artisanale ≠ problème logiciel ; peut être skill/formation |
| **Manque** | Part des litiges dus à mèches cliente vs exécution salon |
| **Question** | « Quand une cliente amène ses propres mèches, quelle est votre procédure exacte avant de commencer — et qu’est-ce qui a déjà mal tourné ? » |

### O7 — « Pas un Planity » / underfit vertical

| Dimension | Contenu |
|---|---|
| **Observé** | 64 salons avec Planity détecté ; une partie a encore des thèmes avis douleur ; majorité sans Planity |
| **Déduit** | Agenda généraliste n’élimine pas qualif/prix/durée |
| **Hypothétique** | Les salons Planity *voudraient* quitter ou compléter Planity avec Skedisy |
| **Qualité preuve** | **Moyenne** sur underfit ; **faible** sur intention de switch |
| **Biais** | On n’a pas interviewé d’owners Planity ; marketing anti-Planity facile |
| **Manque** | Ce qu’ils aiment/détestent dans Planity au quotidien |
| **Question** | « Si vous utilisez déjà un outil de réservation, montrez-moi un RDV afro complexe pris dedans — qu’est-ce que l’outil ne gère pas, et comment vous le contournez ? » |

---

## 2. Conclusions à risque (sources fragiles)

| Conclusion | Repose surtout sur | Risque |
|---|---|---|
| « WhatsApp est l’OS du salon afro » | Inférence marché FR + absence booking + quelques liens WA | **Élevé** sans observation inbox |
| « No-show massif » | Peu d’avis API + intuition métier | **Très élevé** |
| « Les salons paieront pour Skedisy » | WTP score interne SQUIRE | **Élevé** — non testé |
| « Planity ne marche pas pour l’afro » | Douleurs avis malgré Planity + raisonnement produit | **Moyen** — peut marcher « assez » pour eux |
| « Instagram DM = réservation » | URLs IG + culture verticale | **Élevé** — contenu IG/TikTok **non audité** dans cette étude |
| « TikTok génère la demande » | Non collecté ici | **Non fondé** dans ce dossier |
| Thèmes avis = fréquence ops | Avis Google isolés (≤5, extrêmes) | **Moyen-élevé** |
| Absence acompte sur site = pas d’acompte | Crawl HTML | **Moyen** — peut exister en pratique |
| Marketing plateformes (Planity/Fresha « tout-en-un ») | Sites concurrents / positionnement | **Ne pas prendre pour réalité salon** |
| Témoignages isolés dans avis | 1 extrait ≠ pattern salon | Déjà mitigé par comptages multi-salons, mais **verbatim ≠ process** |

**Ce qu’on n’a presque pas :** contenu TikTok, commentaires Instagram, forums Reddit, interviews, observations shadowing, données caisse/no-show internes.

---

## 3. LES 10 HYPOTHÈSES À TESTER EN SALON

Méthode : comportements réels, **pas** « quelle feature voulez-vous ? ».

### H1 — Canal de prise de demande
**Hypothèse :** La majorité des nouvelles demandes afro arrivent encore par WhatsApp ou Instagram, même si un outil de réservation existe.  
**Question :** « Montrez-moi d’où sont venues les cinq dernières demandes de RDV pour tresses, locks ou tissage — et ouvrez le fil ou l’outil correspondant. »

### H2 — Étapes avant confirmation
**Hypothèse :** Entre le premier message et le créneau bloqué, il y a plusieurs allers-retours (photos, longueur, mèches, prix).  
**Question :** « Prenez une demande en cours (ou la dernière terminée) et racontez-moi chaque étape jusqu’à ce que vous considériez le RDV comme vraiment confirmé. »

### H3 — Estimation durée
**Hypothèse :** La durée annoncée diffère souvent de la durée réelle sur les prestations longues.  
**Question :** « Sur votre dernière journée avec au moins une prestation de plus de deux heures : qu’aviez-vous prévu comme durée, et à quelle heure ça s’est réellement terminé ? »

### H4 — Formation du prix
**Hypothèse :** Le prix final dépend de variables non fixées au premier contact (mèches, densité, longueur).  
**Question :** « Comment vous décidez du prix pour une box braids ou un tissage — à quel moment le montant devient définitif pour la cliente ? »

### H5 — Acompte / engagement
**Hypothèse :** Beaucoup de salons n’ont pas de règle d’acompte systématique écrite, ou l’appliquent de façon irrégulière.  
**Question :** « La dernière cliente qui n’est pas venue : qu’avait-elle payé ou garanti avant le RDV, s’il y avait quelque chose ? »

### H6 — Outil existant vs contournement
**Hypothèse :** Même avec Planity/Fresha/Booksy, les cas afro complexes sortent de l’outil (DM, téléphone).  
**Question :** « Montrez-moi un RDV afro complexe dans votre outil actuel — et dites-moi ce que vous avez dû gérer *en dehors* de l’outil pour ce même RDV. »

### H7 — Coût du chaos inbox
**Hypothèse :** Le temps owner passé à qualifier les demandes est un coût ops majeur (non mesuré ici).  
**Question :** « Hier, à peu près combien de temps avez-vous passé à répondre à des demandes de RDV ou de devis — et à quel moment de la journée ? »

### H8 — Litige qualité / mèches
**Hypothèse :** Une part des conflits vient d’un malentendu amont (attente visuelle / supply), pas seulement de l’exécution.  
**Question :** « Pensez à la dernière cliente mécontente du résultat : qu’avait-elle envoyé ou dit avant le RDV, et qu’est-ce qui n’avait pas été aligné ? »

### H9 — Willingness to pay
**Hypothèse :** Un salon paierait pour un lien qui sort devis + durée + acompte *avant* de bloquer un long créneau — s’il réduit les no-shows/litiges.  
**Question :** « Si demain un outil faisait X (décrire le comportement observé chez eux, pas une feature) — qu’est-ce qui devrait être vrai dans votre salon pour que vous acceptiez de payer chaque mois ? »  
*(Ne pas dire « Skedisy » ni « WhatsApp est le problème ».)*

### H10 — Remplaçabilité de WhatsApp
**Hypothèse :** WhatsApp ne sera pas abandonné ; Skedisy doit s’insérer *dans* le flux (lien dans le chat), pas le remplacer.  
**Question :** « Imaginez qu’on vous interdise WhatsApp pour les RDV pendant une semaine : que feriez-vous concrètement, et qu’est-ce qui casserait en premier ? »

---

## 4. Protocole d’interview recommandé (esprit SQUIRE)

1. **Shadowing léger** : assister 60–90 min aux réponses messages (avec accord).  
2. **Artefacts** : photos d’écran de conversations (anonymisées), export agenda d’une journée.  
3. **Compter** : demandes / confirmés / no-shows / débordements sur 2 semaines.  
4. **Interdire** en V1 d’interview : « Que devrait faire une app ? » / « Est-ce que WhatsApp est pénible ? »  
5. **Sample** : 8–12 salons (mix Planity / sans outil / gros volume avis / petit).

---

## 5. Verdict sur nos propres conclusions Prompt 4

| Affirmation Prompt 4 | Statut après audit |
|---|---|
| Wedge Qualif→devis→acompte est le meilleur pari | **Plausible et cohérent avec les données** — pas encore **validé terrain** |
| « Pas un autre Planity » | **Bien soutenu** comme stratégie ; ne pas en faire une guerre de features |
| Douleur WhatsApp quotidienne | **Sous-prouvé** → H1, H2, H7, H10 prioritaires |
| No-show comme douleur #1 marketing | **Dangereux** tant que H5 non mesurée — parler plutôt « engagement avant créneau long » |
| Data moat durée/prix afro | **Hypothèse de plateforme** — vraie seulement après usage réel |

**Phrase de discipline :**  
Les avis Google et les sites publics justifient d’**enquêter** et de **prototyper**. Ils ne justifient pas encore d’**affirmer** le ROI ni le comportement quotidien du salon.
