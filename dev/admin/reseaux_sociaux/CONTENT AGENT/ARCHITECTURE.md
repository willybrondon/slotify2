# Skedisy Content Agent — automation cible

Vision long terme : un agent qui propose, produit et apprend — **avec validation humaine** avant publication.

> Pas encore à coder aujourd’hui. Spec d’architecture pour quand on reprend la partie contenus.

---

## Pipeline

```
                 SKEDISY DATABASE
                       │
                       ↓
             ┌───────────────────┐
             │   CONTENT AGENT   │
             └───────────────────┘
                       │
             What should we post?
                       │
          ┌────────────┴────────────┐
          ↓                         ↓
   REAL SALON DATA             TREND DATA
          │                         │
          └────────────┬────────────┘
                       ↓
                   SCRIPT
                       ↓
                  STORYBOARD
                       ↓
             RUNWAY WORKFLOW
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
     REFERENCES      VIDEO         EDITING
        ↓              ↓              ↓
        └──────────────┼──────────────┘
                       ↓
                 FINAL VIDEO
                       ↓
              CAPTION + HASHTAGS
                       ↓
              HUMAN APPROVAL        ← obligatoire
                       ↓
              INSTAGRAM / TIKTOK
                       ↓
                  ANALYTICS
                       ↓
                CONTENT AGENT
                       ↓
              "WHAT WORKED?"
```

---

## Étapes (détail)

| Étape | Entrée | Sortie | Règles |
|-------|--------|--------|--------|
| **Content Agent** | DB salons + perf posts | Brief du jour (« quoi poster ») | IDF, pas de claim inventé |
| **Real salon data** | Mongo / API Skedisy | Nom, service, prix, ⭐, créneau, adresse | **Uniquement** données live |
| **Trend data** | IG/TikTok / calendrier éditorial | Angle, hook, hashtags tendance | Filtrer hors afro/beauté IDF |
| **Script** | Brief + data + trends | VO / textes on-screen | Ton authentique (`AUTHENTICITE_SKEDISY`) |
| **Storyboard** | Script | 6 shots type reel 20 s | Mix réel / Runway (`REELS/`) |
| **Runway Workflow** | Storyboard + assets | Graphe sauvé / Agent Runway | `WORKFLOWS/` + `AGENT.md` |
| **References** | Girl/Boy + salon photo | Inputs Gen-4 | Skedisy Girl / Boy **uniques** |
| **Video** | Workflow | Clips IA | Pas d’UI app générée |
| **Editing** | Clips + map + recording + data card | Master 9:16 | UI = `APP UI RECORDINGS/` |
| **Caption + hashtags** | Script + trends + salon | Texte post + CTA bio/app | Claim : *Trouve. Compare. Réserve.* |
| **Human approval** | Draft complet | OK / retouches / kill | **Jamais de publish auto** |
| **Publish** | Version approuvée | IG / TikTok (@skedisy) | Scheduling OK |
| **Analytics** | Reach, saves, clics bio, installs, RDV | Metrics | KPI business > likes seuls |
| **Feedback** | Analytics | « What worked? » → priorise prochains briefs | Boucle fermée |

---

## Sources de vérité

| Donnée | Source |
|--------|--------|
| Salons, prix, notes, créneaux | **Skedisy database / app** |
| Personnages | `CHARACTERS/Skedisy Girl\|Boy/` |
| Photos salon | `SALONS/<salon>/` |
| UI | `APP UI RECORDINGS/` |
| Brand | `SKEDISY BRAND/` |
| Briefs / workflows | `REELS/`, `WORKFLOWS/` |
| Ligne éditoriale | `scraping_data/authenticite/` |

---

## Garde-fous (non négociables)

1. **Human approval** avant chaque publication  
2. **Vraies données** Skedisy — zéro prix / note / créneau inventés  
3. **Deux personnages** marque seulement (Girl / Boy)  
4. **Pas d’UI IA** — recording réel  
5. KPI : clics bio / installs / RDV, pas vanity likes seuls  

---

## Phases de build (plus tard)

| Phase | Scope |
|-------|--------|
| **0** | Lib assets + briefs + Workflows manuels *(en cours)* |
| **1** | Script + storyboard semi-auto à partir d’une fiche salon API |
| **2** | Trigger Runway Workflow / Agent avec assets joints |
| **3** | Assemblage montage (slots map / UI / outro) |
| **4** | Queue d’approbation (Notion / Slack / admin) |
| **5** | Publish + analytics ingest → feedback Agent |

---

## Lien local

- Prompt Agent Runway : [`../WORKFLOWS/AGENT.md`](../WORKFLOWS/AGENT.md)  
- Reel 20 s : [`../REELS/20s-knotless-18e/BRIEF.md`](../REELS/20s-knotless-18e/BRIEF.md)  
- Libracie : [`../README.md`](../README.md)
