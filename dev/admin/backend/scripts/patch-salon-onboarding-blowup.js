/**
 * Expand /salon/rejoindre marketing funnel (Blow Up–style for salons).
 * Patches public/salon-claim.html then syncs to lib/salonOnboardingHtml.js
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const htmlPath = path.join(__dirname, "..", "public", "salon-claim.html");
let html = fs.readFileSync(htmlPath, "utf8");

const EXTRA_CSS = `
        .kpi-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin: 12px 0;
        }
        .kpi-card {
            background: #fafafa;
            border-radius: 12px;
            padding: 12px;
            text-align: center;
            color: var(--sk-black);
            border: 1px solid var(--sk-border);
        }
        .kpi-card strong {
            display: block;
            font-size: 1.25rem;
            color: var(--sk-brand);
            line-height: 1.1;
        }
        .kpi-card span { font-size: 11px; color: var(--sk-muted); }
        .kpi-card.boom strong { color: #128a3c; }
        .dash-mock {
            border: 1px solid var(--sk-border);
            border-radius: 14px;
            overflow: hidden;
            background: #f7f3ef;
            margin: 12px 0 14px;
            color: var(--sk-black);
        }
        .dash-mock-head {
            background: #fff;
            padding: 10px 12px;
            border-bottom: 1px solid var(--sk-border);
            font-size: 12px;
            font-weight: 700;
        }
        .dash-mock-head small {
            display: block;
            font-weight: 500;
            color: var(--sk-muted);
            margin-top: 2px;
        }
        .dash-mock-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
            padding: 10px;
        }
        .dash-stat {
            background: #fff;
            border-radius: 8px;
            padding: 8px 4px;
            text-align: center;
            box-shadow: 0 1px 2px rgba(0,0,0,.04);
        }
        .dash-stat b { display: block; font-size: 13px; }
        .dash-stat span { font-size: 9px; color: var(--sk-muted); line-height: 1.2; }
        .dash-mock-note {
            padding: 0 10px 10px;
            font-size: 11px;
            color: var(--sk-muted);
            text-align: center;
        }
        .ba-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin: 12px 0;
        }
        .ba-card {
            border-radius: 12px;
            padding: 12px;
            border: 1px solid var(--sk-border);
            background: #fff;
            color: var(--sk-black);
            font-size: 12px;
        }
        .ba-card h4 { font-size: 12px; margin-bottom: 6px; }
        .ba-card.before { opacity: 0.85; }
        .ba-card.after { border-color: rgba(18,138,60,.35); background: #f3faf5; }
        .ba-card ul { margin: 0; padding-left: 16px; }
        .pack-list { display: flex; flex-direction: column; gap: 10px; margin: 12px 0; }
        .pack-btn {
            position: relative;
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: 10px;
            align-items: center;
            width: 100%;
            text-align: left;
            padding: 14px 12px;
            border-radius: 14px;
            border: 1.5px solid var(--sk-border);
            background: #fff;
            color: var(--sk-black);
            font-family: inherit;
            cursor: pointer;
        }
        .pack-btn.selected {
            border-color: var(--sk-brand);
            box-shadow: 0 0 0 3px var(--sk-brand-light);
        }
        .pack-btn.popular { margin-top: 8px; }
        .pack-popular {
            position: absolute;
            top: -9px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--sk-brand);
            color: #fff;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .04em;
            padding: 2px 10px;
            border-radius: 999px;
            white-space: nowrap;
        }
        .pack-radio {
            width: 20px; height: 20px; border-radius: 50%;
            border: 2px solid #9aa89f; flex-shrink: 0;
        }
        .pack-btn.selected .pack-radio {
            border-color: var(--sk-brand);
            background: var(--sk-brand);
            box-shadow: inset 0 0 0 3px #fff;
        }
        .pack-main { min-width: 0; }
        .pack-top { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-weight: 700; }
        .pack-disc {
            background: rgba(18,138,60,.12);
            color: #128a3c;
            font-size: 11px;
            font-weight: 700;
            padding: 1px 7px;
            border-radius: 999px;
        }
        .pack-prices { margin-top: 2px; font-size: 13px; }
        .pack-was { text-decoration: line-through; color: var(--sk-muted); margin-right: 6px; }
        .pack-now { font-weight: 700; }
        .pack-day { text-align: right; line-height: 1.1; white-space: nowrap; }
        .pack-day strong { display: block; font-size: 1.1rem; }
        .pack-day span { font-size: 11px; color: var(--sk-muted); }
        .legal-soft {
            text-align: center;
            font-size: 12px;
            color: var(--sk-muted);
            line-height: 1.45;
            margin: 10px 0 14px;
        }
        .proj-box {
            background: #111;
            color: #fff;
            border-radius: 14px;
            padding: 16px;
            margin: 12px 0;
            text-align: center;
        }
        .proj-box .range {
            font-size: 1.45rem;
            font-weight: 700;
            color: #f0a060;
            margin: 6px 0;
        }
        .proj-box p { font-size: 12px; opacity: .8; margin: 0; }
        .mono-list { display: flex; flex-direction: column; gap: 8px; margin: 10px 0 14px; }
        .mono-item {
            display: flex;
            justify-content: space-between;
            gap: 8px;
            padding: 10px 12px;
            border-radius: 10px;
            background: #fafafa;
            color: var(--sk-black);
            font-size: 13px;
        }
        .mono-item strong { white-space: nowrap; color: var(--sk-brand); }
        .faq details {
            border: 1px solid var(--sk-border);
            border-radius: 10px;
            padding: 10px 12px;
            margin-bottom: 8px;
            color: var(--sk-black);
            background: #fff;
        }
        .faq summary { font-weight: 600; cursor: pointer; font-size: 14px; }
        .faq details p { margin-top: 8px; font-size: 13px; color: var(--sk-muted); line-height: 1.45; }
        .secure-row { text-align: center; margin-top: 12px; }
        .secure-row .title { color: #128a3c; font-weight: 700; font-size: 13px; }
        .pay-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 8px; }
        .pay-chip {
            font-size: 10px; font-weight: 800; color: #fff;
            padding: 4px 8px; border-radius: 4px;
        }
        .analyzing {
            text-align: center;
            padding: 24px 10px;
            color: var(--sk-black);
        }
        .analyzing .spinner { margin-bottom: 12px; }
        @media (max-width: 480px) {
            .dash-mock-stats { grid-template-columns: 1fr 1fr; }
            .ba-row { grid-template-columns: 1fr; }
        }
`;

if (!html.includes(".dash-mock {")) {
  html = html.replace("        .plan-card .plan-price .price-day { display: block; margin-top: 2px; }\n",
    "        .plan-card .plan-price .price-day { display: block; margin-top: 2px; }\n" + EXTRA_CSS);
}

const MKT_HTML = `        <!-- MARKETING FUNNEL (Blow Up–inspired, salon-only) -->
        <div id="marketingMode" style="display:none;">
            <div class="mkt-progress" aria-hidden="true"><i id="mktProgressBar"></i></div>
            <p class="step-label" id="mktStepLabel">Bienvenue</p>

            <div class="panel active" id="mkt0">
                <div class="proof-row">
                    <div class="proof-card"><strong>3 min</strong><span>Diagnostic agenda &amp; CA</span></div>
                    <div class="proof-card"><strong>2 400+</strong><span>Salons beauté afro analysés*</span></div>
                </div>
                <div class="stars" aria-label="4,8 sur 5">★★★★★ <span style="color:var(--sk-muted);font-size:12px;">4,8 · salons partenaires</span></div>
                <div class="quote">
                    « Enfin une plateforme où mes clientes cherchent vraiment des tresses et des soins adaptés. »
                    <cite>— Salon partenaire Skedisy, Île-de-France</cite>
                </div>
                <p style="color:var(--sk-black);font-size:15px;font-weight:600;line-height:1.35;margin-bottom:8px;">
                    Découvre le potentiel de ton salon grâce à l’analyse Skedisy
                </p>
                <p style="color:var(--sk-muted);font-size:13px;line-height:1.45;margin-bottom:16px;">
                    On regarde ton agenda, ta présence en ligne et ta façon d’attirer des clientes — puis on te montre ton espace Skedisy <strong>avant</strong> et <strong>après</strong>, avec des KPIs concrets.
                </p>
                <button type="button" class="btn" id="mktStartBtn">Découvrir mon potentiel</button>
                <button type="button" class="btn btn-ghost" id="mktSkipBtn" style="margin-top:10px;width:100%;">Passer et créer mon salon</button>
                <p class="hint" style="text-align:center;margin-top:12px;">
                    Déjà référencé ?
                    <a href="/salonpanel/login" style="color:var(--sk-brand);font-weight:600;">Connectez-vous</a>.
                </p>
            </div>

            <div class="panel" id="mkt1">
                <p style="color:var(--sk-black);font-size:15px;font-weight:600;margin-bottom:6px;">Depuis quand tu exerces ?</p>
                <div class="choice-list" data-q="experience">
                    <button type="button" class="choice-btn" data-value="debut">Quelques semaines / je démarre<small>Tu démarres au meilleur moment.</small></button>
                    <button type="button" class="choice-btn" data-value="1-2">Plusieurs mois<small>Tu as déjà pris le rythme.</small></button>
                    <button type="button" class="choice-btn" data-value="2-5">Environ un an / 1–2 ans<small>Les bases sont posées.</small></button>
                    <button type="button" class="choice-btn" data-value="5+">Plusieurs années<small>Ton expérience est un vrai atout.</small></button>
                </div>
                <div class="feedback-card" id="fb-experience"></div>
                <div class="btn-row">
                    <button type="button" class="btn btn-ghost" data-mkt-back="0">Retour</button>
                    <button type="button" class="btn" data-mkt-next="2" disabled id="mktNext1">Continuer</button>
                </div>
            </div>

            <div class="panel" id="mkt2">
                <p style="color:var(--sk-black);font-size:15px;font-weight:600;margin-bottom:6px;">Comment tu trouves surtout tes nouvelles clientes ?</p>
                <div class="choice-list" data-q="acquisition">
                    <button type="button" class="choice-btn" data-value="instagram">Instagram / TikTok</button>
                    <button type="button" class="choice-btn" data-value="bouche">Bouche-à-oreille</button>
                    <button type="button" class="choice-btn" data-value="google">Google / Pages Jaunes</button>
                    <button type="button" class="choice-btn" data-value="habituelles">Surtout mes clientes habituelles</button>
                    <button type="button" class="choice-btn" data-value="plateformes">Déjà via des plateformes</button>
                </div>
                <div class="feedback-card" id="fb-acquisition"></div>
                <div class="btn-row">
                    <button type="button" class="btn btn-ghost" data-mkt-back="1">Retour</button>
                    <button type="button" class="btn" data-mkt-next="3" disabled id="mktNext2">Continuer</button>
                </div>
            </div>

            <div class="panel" id="mkt3">
                <p style="color:var(--sk-black);font-size:15px;font-weight:600;margin-bottom:6px;">Ton agenda est rempli à combien en ce moment ?</p>
                <div class="choice-list" data-q="agenda">
                    <button type="button" class="choice-btn" data-value="vide">Souvent des trous<small>Beaucoup de créneaux libres</small></button>
                    <button type="button" class="choice-btn" data-value="moitie">Environ à moitié</button>
                    <button type="button" class="choice-btn" data-value="bien">Plutôt bien rempli</button>
                    <button type="button" class="choice-btn" data-value="plein">Complet / liste d’attente</button>
                </div>
                <div class="feedback-card" id="fb-agenda"></div>
                <div class="btn-row">
                    <button type="button" class="btn btn-ghost" data-mkt-back="2">Retour</button>
                    <button type="button" class="btn" data-mkt-next="4" disabled id="mktNext3">Continuer</button>
                </div>
            </div>

            <div class="panel" id="mkt4">
                <p style="color:var(--sk-black);font-size:15px;font-weight:600;margin-bottom:6px;">Tu postes sur combien de plateformes ?</p>
                <div class="choice-list" data-q="platforms">
                    <button type="button" class="choice-btn" data-value="0">Presque jamais / 0</button>
                    <button type="button" class="choice-btn" data-value="1">1 plateforme</button>
                    <button type="button" class="choice-btn" data-value="2">2 plateformes</button>
                    <button type="button" class="choice-btn" data-value="3+">3 ou plus</button>
                </div>
                <div class="feedback-card" id="fb-platforms"></div>
                <div class="btn-row">
                    <button type="button" class="btn btn-ghost" data-mkt-back="3">Retour</button>
                    <button type="button" class="btn" data-mkt-next="5" disabled id="mktNext4">Continuer</button>
                </div>
            </div>

            <div class="panel" id="mkt5">
                <p style="color:var(--sk-black);font-size:15px;font-weight:600;margin-bottom:6px;">Tes prestations &amp; tarifs sont-ils clairs en ligne ?</p>
                <div class="choice-list" data-q="clarity">
                    <button type="button" class="choice-btn" data-value="non">Non, pas vraiment<small>Les clientes doivent demander</small></button>
                    <button type="button" class="choice-btn" data-value="partiel">Partiellement<small>Quelques posts, pas de fiche claire</small></button>
                    <button type="button" class="choice-btn" data-value="oui">Oui, c’est clair<small>Site, IG ou autre bien à jour</small></button>
                </div>
                <div class="feedback-card" id="fb-clarity"></div>
                <div class="btn-row">
                    <button type="button" class="btn btn-ghost" data-mkt-back="4">Retour</button>
                    <button type="button" class="btn" data-mkt-next="6" disabled id="mktNext5">Continuer</button>
                </div>
            </div>

            <div class="panel" id="mkt6">
                <p style="color:var(--sk-black);font-size:15px;font-weight:600;margin-bottom:6px;">Quel est le nom de ton salon (ou ton @) ?</p>
                <p class="hint" style="margin-bottom:10px;">On personnalise ton diagnostic et la projection « avant / après ».</p>
                <div class="form-group">
                    <label for="mktSalonHandle">Nom du salon</label>
                    <input type="text" id="mktSalonHandle" placeholder="Ex. Danyla Coiffure" autocomplete="organization">
                </div>
                <div class="btn-row">
                    <button type="button" class="btn btn-ghost" data-mkt-back="5">Retour</button>
                    <button type="button" class="btn" id="mktNext6">Voir mon diagnostic</button>
                </div>
            </div>

            <div class="panel" id="mkt7">
                <div class="analyzing" id="mktAnalyzing">
                    <div class="spinner"></div>
                    <p><strong>Étude de ton potentiel</strong></p>
                    <p class="hint">Patiente quelques secondes : on croise agenda, présence et niche afro…</p>
                </div>
                <div id="mktDiagReady" style="display:none;">
                    <div class="diag-block">
                        <h3>Analyse salon</h3>
                        <p id="diagHandle" style="font-weight:700;margin-bottom:6px;"></p>
                        <p id="diagNiche"><strong>Niche :</strong> Beauté afro professionnelle</p>
                        <p id="diagSummary" style="margin-top:8px;"></p>
                    </div>
                    <div class="score-ring">
                        <div class="score-num" id="diagScore">72</div>
                        <div class="score-label">Score de potentiel agenda</div>
                    </div>
                    <div class="kpi-grid" id="diagKpis"></div>
                    <div class="diag-block">
                        <h3>Points forts</h3>
                        <ul id="diagStrengths"></ul>
                    </div>
                    <div class="diag-block">
                        <h3>À améliorer pour booker</h3>
                        <ul id="diagImprove"></ul>
                    </div>
                    <button type="button" class="btn" data-mkt-next="8">Voir mon potentiel</button>
                    <button type="button" class="btn btn-ghost" data-mkt-back="6" style="margin-top:10px;width:100%;">Retour</button>
                </div>
            </div>

            <div class="panel" id="mkt8">
                <p style="color:var(--sk-black);font-size:15px;font-weight:600;margin-bottom:4px;">Ton espace Skedisy — aujourd’hui</p>
                <p class="hint" style="margin-bottom:8px;">Comme beaucoup de salons au démarrage : peu de données, peu de signal.</p>
                <div class="dash-mock" id="dashBefore">
                    <div class="dash-mock-head">Vue d’ensemble <small id="dashBeforeName">Bon retour sur votre espace salon</small></div>
                    <div class="dash-mock-stats">
                        <div class="dash-stat"><b id="bPros">1</b><span>Pros actifs</span></div>
                        <div class="dash-stat"><b id="bBookings">1</b><span>Résa. terminées</span></div>
                        <div class="dash-stat"><b id="bCa">59 €</b><span>Chiffre d’affaires</span></div>
                        <div class="dash-stat"><b id="bComm">0</b><span>Commission</span></div>
                    </div>
                    <p class="dash-mock-note">Commandes à venir · No Data Found — Réservations du jour · vides</p>
                </div>
                <p style="color:var(--sk-black);font-size:14px;margin:10px 0 6px;font-weight:600;">Pour l’instant, il te manque la méthode.</p>
                <p class="hint" style="margin-bottom:14px;">C’est pour ça que ton agenda et ton CA restent bloqués — pas ton talent.</p>
                <button type="button" class="btn" data-mkt-next="9">Continuer</button>
                <button type="button" class="btn btn-ghost" data-mkt-back="7" style="margin-top:10px;width:100%;">Retour</button>
            </div>

            <div class="panel" id="mkt9">
                <p style="color:var(--sk-black);font-size:15px;font-weight:600;margin-bottom:6px;">Quel est ton rêve ultime avec ton salon ?</p>
                <div class="choice-list" data-q="dream">
                    <button type="button" class="choice-btn" data-value="agenda">Remplir mon agenda chaque semaine</button>
                    <button type="button" class="choice-btn" data-value="clients">Attirer des clientes ciblées beauté afro</button>
                    <button type="button" class="choice-btn" data-value="ca">Augmenter mon chiffre d’affaires</button>
                </div>
                <div class="feedback-card" id="fb-dream"></div>
                <div class="btn-row">
                    <button type="button" class="btn btn-ghost" data-mkt-back="8">Retour</button>
                    <button type="button" class="btn" data-mkt-next="10" disabled id="mktNext9">Continuer</button>
                </div>
            </div>

            <div class="panel" id="mkt10">
                <p style="color:var(--sk-black);font-size:15px;font-weight:600;margin-bottom:6px;">Qu’est-ce qui t’empêche d’atteindre ce rêve ?</p>
                <div class="choice-list" data-q="blocker">
                    <button type="button" class="choice-btn" data-value="visibilite">Je suis peu visible en ligne</button>
                    <button type="button" class="choice-btn" data-value="trous">J’ai des trous dans l’agenda</button>
                    <button type="button" class="choice-btn" data-value="clarte">Les clientes ne comprennent pas mes tarifs</button>
                    <button type="button" class="choice-btn" data-value="temps">Je n’ai pas le temps de poster / gérer</button>
                </div>
                <div class="feedback-card" id="fb-blocker"></div>
                <div class="btn-row">
                    <button type="button" class="btn btn-ghost" data-mkt-back="9">Retour</button>
                    <button type="button" class="btn" data-mkt-next="11" disabled id="mktNext10">Continuer</button>
                </div>
            </div>

            <div class="panel" id="mkt11">
                <p style="color:var(--sk-black);font-size:15px;font-weight:600;margin-bottom:6px;">Combien de temps tu es prêt·e à y consacrer ?</p>
                <div class="choice-list" data-q="time">
                    <button type="button" class="choice-btn" data-value="15">15 minutes par jour</button>
                    <button type="button" class="choice-btn" data-value="30">30 minutes par jour</button>
                    <button type="button" class="choice-btn" data-value="60">1 h par jour</button>
                    <button type="button" class="choice-btn" data-value="plus">Plusieurs heures</button>
                </div>
                <div class="feedback-card" id="fb-time"></div>
                <div class="btn-row">
                    <button type="button" class="btn btn-ghost" data-mkt-back="10">Retour</button>
                    <button type="button" class="btn" data-mkt-next="12" disabled id="mktNext11">Voir ma projection</button>
                </div>
            </div>

            <div class="panel" id="mkt12">
                <p style="color:var(--sk-black);font-size:15px;font-weight:600;margin-bottom:4px;">Projection · ton salon dans 3 mois</p>
                <div class="proj-box">
                    <p>Ce que ton activité pourrait générer mensuellement</p>
                    <div class="range" id="projRange">1 200 € à 3 800 €</div>
                    <p id="projNote">Estimations indicatives · niche beauté afro · selon tes réponses</p>
                </div>
                <div class="mono-list" id="projBreakdown"></div>
                <p style="color:var(--sk-black);font-size:14px;font-weight:600;margin:8px 0 4px;">Après Skedisy — ton panel qui « boom »</p>
                <div class="dash-mock" id="dashAfter">
                    <div class="dash-mock-head">Vue d’ensemble <small id="dashAfterName">Bon retour — activité en hausse</small></div>
                    <div class="dash-mock-stats">
                        <div class="dash-stat"><b id="aPros">3</b><span>Pros actifs</span></div>
                        <div class="dash-stat"><b id="aBookings">86</b><span>Résa. terminées</span></div>
                        <div class="dash-stat"><b id="aCa">4 280 €</b><span>Chiffre d’affaires</span></div>
                        <div class="dash-stat"><b id="aFill">78 %</b><span>Taux de remplissage</span></div>
                    </div>
                    <p class="dash-mock-note">Agenda rempli · demandes entrantes · meilleures pros suivies</p>
                </div>
                <div class="ba-row">
                    <div class="ba-card before">
                        <h4>😔 Avant</h4>
                        <ul>
                            <li>Peu de données</li>
                            <li>Agenda à trous</li>
                            <li>Clients qui demandent les prix</li>
                        </ul>
                    </div>
                    <div class="ba-card after">
                        <h4>💪 Après</h4>
                        <ul>
                            <li>KPIs clairs</li>
                            <li>Vitrine bookable</li>
                            <li>Nouvelles demandes ciblées</li>
                        </ul>
                    </div>
                </div>
                <button type="button" class="btn" data-mkt-next="13">Continuer</button>
                <button type="button" class="btn btn-ghost" data-mkt-back="11" style="margin-top:10px;width:100%;">Retour</button>
            </div>

            <div class="panel" id="mkt13">
                <p style="color:var(--sk-black);font-size:15px;font-weight:600;margin-bottom:6px;">Bienvenue dans Skedisy</p>
                <div class="diag-block">
                    <ul style="padding-left:18px;margin:0;">
                        <li><strong>Vitrine claire</strong> — prestations, tarifs, photos pour convertir sans WhatsApp interminable.</li>
                        <li><strong>Agenda &amp; résa</strong> — les clientes bookent ; tu suis le remplissage.</li>
                        <li><strong>Découverte niche</strong> — visibles auprès de clientes qui cherchent beauté afro.</li>
                        <li><strong>Pilotage</strong> — CA, réservations, pros : le panel que tu as vu « après ».</li>
                    </ul>
                </div>
                <p class="legal-soft">La seule chose qui t’empêche d’atteindre ton objectif, c’est de rester invisible et illisible en ligne.</p>
                <button type="button" class="btn" data-mkt-next="14">Choisir mon plan</button>
                <button type="button" class="btn btn-ghost" data-mkt-back="12" style="margin-top:10px;width:100%;">Retour</button>
            </div>

            <div class="panel" id="mkt14">
                <h3 style="color:var(--sk-black);text-align:center;margin-bottom:4px;">Choisis ton plan</h3>
                <p class="hint" style="text-align:center;margin-bottom:8px;">Le petit chiffre /jour — c’est l’engagement. Le prix barré montre la réduction.</p>
                <div class="pack-list" id="mktPackList"></div>
                <p class="legal-soft" id="mktPackLegal">
                    Le prix réduit s’applique à ton premier abonnement. Ton abonnement sera automatiquement renouvelé au prix plein de <strong>74,97 €</strong> à la fin de la période d’abonnement choisie, jusqu’à annulation dans ton compte.
                </p>
                <button type="button" class="btn" id="mktToRegister">Continuer</button>
                <div class="secure-row">
                    <div class="title">Paiement sécurisé · Stripe</div>
                    <div class="pay-chips">
                        <span class="pay-chip" style="background:#1a1f71;">Visa</span>
                        <span class="pay-chip" style="background:#eb001b;">Mastercard</span>
                        <span class="pay-chip" style="background:#2e77bc;">Amex</span>
                        <span class="pay-chip" style="background:#111;">Apple Pay</span>
                        <span class="pay-chip" style="background:#3c4043;">Google Pay</span>
                    </div>
                </div>
                <div class="faq" style="margin-top:16px;">
                    <details>
                        <summary>Pourquoi j’ai besoin de Skedisy ?</summary>
                        <p>Skedisy structure ta vitrine beauté afro (prestations, tarifs, photos) et te rend bookable. Tu vois ton agenda et ton CA monter — comme dans la projection « après ».</p>
                    </details>
                    <details>
                        <summary>Comment accéder à mon espace ?</summary>
                        <p>Après inscription, connecte-toi sur le salon panel avec le même e-mail. Tu pourras activer un plan et payer via Stripe quand tu es prêt·e.</p>
                    </details>
                    <details>
                        <summary>Comment annuler ?</summary>
                        <p>Depuis Gérer / factures (portail Stripe) dans ton profil salon. L’annulation prend effet à la fin de la période en cours.</p>
                    </details>
                </div>
                <button type="button" class="btn btn-ghost" data-mkt-back="13" style="margin-top:10px;width:100%;">Retour</button>
            </div>
        </div>
`;

html = html.replace(
  /        <!-- MARKETING FUNNEL[\s\S]*?        <\/div>\n\n        <!-- CLAIM MODE/,
  MKT_HTML + "\n        <!-- CLAIM MODE"
);

const NEW_JS = `            // --- Marketing funnel then register ---
            var quiz = {
                experience: '', acquisition: '', agenda: '', platforms: '', clarity: '',
                salonHandle: '', dream: '', blocker: '', time: '',
                packId: '3m', score: 0, skipped: false
            };
            try {
                var saved = sessionStorage.getItem('skedisy_salon_quiz');
                if (saved) quiz = Object.assign(quiz, JSON.parse(saved));
            } catch (e) {}

            var PACKS = [
                { packId: '1m', label: '1 mois', price: 18.99, compareAt: 37.97, discountPct: 50, perDay: 0.63, popular: false },
                { packId: '3m', label: '3 mois', price: 29.99, compareAt: 74.97, discountPct: 60, perDay: 0.33, popular: true },
                { packId: '12m', label: '12 mois', price: 69.99, compareAt: 149.97, discountPct: 53, perDay: 0.19, popular: false }
            ];

            var FEEDBACK = {
                experience: {
                    debut: 'Tu démarres au meilleur moment. La plupart des salons qui se structurent ont commencé exactement comme toi.',
                    '1-2': 'Tu as déjà pris le rythme. C’est maintenant que la méthode (vitrine + agenda) fait toute la différence.',
                    '2-5': 'Tu as posé les bases. Maintenant, c’est une question de système, pas seulement de motivation.',
                    '5+': 'Ton expérience est un vrai atout. Il te manque souvent juste le bon système pour en tirer profit.'
                },
                acquisition: {
                    instagram: 'Instagram amène de la notoriété — Skedisy transforme l’intérêt en rendez-vous avec prestations et créneaux clairs.',
                    bouche: 'Le bouche-à-oreille reste précieux. Une fiche Skedisy te fait découvrir par des clientes hors de ton cercle.',
                    google: 'Google te trouve déjà. Une fiche spécialisée beauté afro renforce la confiance avant le premier contact.',
                    habituelles: 'Fidéliser c’est bien — sans nouveaux canaux, l’agenda stagne. Skedisy élargit ta découverte.',
                    plateformes: 'Tu es déjà dans le réflexe plateforme. Skedisy se spécialise sur la demande beauté afro.'
                },
                agenda: {
                    vide: 'Des créneaux libres = opportunités. Une vitrine claire aide à les remplir sans poster 10 stories par jour.',
                    moitie: 'Tu as de la marge. Mieux présenter tresses, locks ou soins convertit plus de demandes.',
                    bien: 'Bon rythme. L’enjeu : rester visible quand une cliente cherche exactement ta spécialité.',
                    plein: 'Agenda plein : super. Une fiche pro sécurise la file d’attente et les demandes hors réseau.'
                },
                platforms: {
                    '0': 'Pas de souci : la régularité s’installe vite. C’est justement là que la méthode change tout.',
                    '1': 'Déjà plus que beaucoup de salons qui « postent au feeling ». Base solide.',
                    '2': 'Bon rythme multi-canal. Reste à transformer l’attention en bookings.',
                    '3+': 'Le rythme des salons qui grossissent. Reste à centraliser la conversion.'
                },
                clarity: {
                    non: 'Sans prestations et tarifs lisibles, beaucoup de clientes abandonnent. On va structurer ça.',
                    partiel: 'Tu as commencé — il manque souvent photos, horaires et une page unique pour convertir.',
                    oui: 'Bonne base. Skedisy centralise le tout pour les clientes qui comparent plusieurs pros.'
                },
                dream: {
                    agenda: 'Objectif clair : remplir la semaine. On va projeter ton agenda « après » avec Skedisy.',
                    clients: 'Attirer la bonne cliente > du volume vide. La niche afro est ton levier.',
                    ca: 'Le CA suit les créneaux bookés à bon prix. On te montre une fourchette réaliste.'
                },
                blocker: {
                    visibilite: 'La visibilité sans fiche bookable laisse filer des demandes. On corrige ça.',
                    trous: 'Les trous se comblent quand tu es trouvable + clair. C’est le cœur du diagnostic.',
                    clarte: 'Les tarifs flous tuent la conversion. Prestations « à partir de » changent tout.',
                    temps: '15 minutes bien placées battent 2 h de stories sans système.'
                },
                time: {
                    '15': '15 minutes ou plusieurs heures : ce n’est pas la quantité qui décide. C’est ce que tu fais pendant ce temps.',
                    '30': '15 minutes ou plusieurs heures : ce n’est pas la quantité qui décide. C’est ce que tu fais pendant ce temps.',
                    '60': '15 minutes ou plusieurs heures : ce n’est pas la quantité qui décide. C’est ce que tu fais pendant ce temps.',
                    plus: '15 minutes ou plusieurs heures : ce n’est pas la quantité qui décide. C’est ce que tu fais pendant ce temps.'
                }
            };

            var MKT_MAX = 14;
            var NEXT_MAP = {
                experience: 'mktNext1', acquisition: 'mktNext2', agenda: 'mktNext3',
                platforms: 'mktNext4', clarity: 'mktNext5', dream: 'mktNext9',
                blocker: 'mktNext10', time: 'mktNext11'
            };

            function trackEvent(name, props) {
                try { if (typeof gtag === 'function') gtag('event', name, props || {}); } catch (e) {}
                try {
                    if (window.dataLayer && Array.isArray(window.dataLayer)) {
                        window.dataLayer.push(Object.assign({ event: name }, props || {}));
                    }
                } catch (e) {}
                try { console.info('[onboarding]', name, props || {}); } catch (e2) {}
            }

            function persistQuiz() {
                try { sessionStorage.setItem('skedisy_salon_quiz', JSON.stringify(quiz)); } catch (e) {}
            }

            function euro(n) {
                return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(n) || 0);
            }

            function computeScore() {
                var s = 55;
                if (quiz.experience === '5+' || quiz.experience === '2-5') s += 8;
                if (quiz.experience === '1-2') s += 4;
                if (quiz.agenda === 'vide') s -= 6;
                if (quiz.agenda === 'moitie') s += 2;
                if (quiz.agenda === 'bien') s += 8;
                if (quiz.agenda === 'plein') s += 10;
                if (quiz.clarity === 'oui') s += 10;
                if (quiz.clarity === 'partiel') s += 4;
                if (quiz.clarity === 'non') s -= 4;
                if (quiz.platforms === '3+') s += 6;
                if (quiz.platforms === '2') s += 4;
                if (quiz.platforms === '0') s -= 3;
                if (quiz.acquisition === 'habituelles') s -= 2;
                if (quiz.acquisition === 'instagram' || quiz.acquisition === 'plateformes') s += 3;
                s = Math.max(48, Math.min(92, s));
                quiz.score = s;
                return s;
            }

            function projectionFromQuiz() {
                var low = 900, high = 2200;
                if (quiz.agenda === 'vide') { low = 700; high = 2100; }
                if (quiz.agenda === 'moitie') { low = 1100; high = 3200; }
                if (quiz.agenda === 'bien') { low = 1800; high = 4200; }
                if (quiz.agenda === 'plein') { low = 2400; high = 5500; }
                if (quiz.clarity === 'oui') { low = Math.round(low * 1.08); high = Math.round(high * 1.1); }
                if (quiz.dream === 'ca') { high = Math.round(high * 1.05); }
                var bookings = quiz.agenda === 'vide' ? 42 : quiz.agenda === 'moitie' ? 68 : quiz.agenda === 'bien' ? 86 : 110;
                var fill = quiz.agenda === 'vide' ? 48 : quiz.agenda === 'moitie' ? 62 : quiz.agenda === 'bien' ? 78 : 91;
                var pros = quiz.platforms === '3+' || quiz.agenda === 'plein' ? 4 : 3;
                return {
                    low: low, high: high,
                    bookings: bookings, fill: fill, pros: pros,
                    ca: Math.round((low + high) / 2),
                    lines: [
                        { label: 'Créneaux bookés en ligne', value: euro(Math.round(low * 0.45)) + ' – ' + euro(Math.round(high * 0.45)) },
                        { label: 'Nouvelles clientes niche afro', value: euro(Math.round(low * 0.25)) + ' – ' + euro(Math.round(high * 0.28)) },
                        { label: 'Rebook / fidélisation', value: euro(Math.round(low * 0.18)) + ' – ' + euro(Math.round(high * 0.17)) },
                        { label: 'Upsell soins / add-ons', value: euro(Math.round(low * 0.12)) + ' – ' + euro(Math.round(high * 0.1)) }
                    ]
                };
            }

            function buildDiagnostic() {
                var strengths = [];
                var improve = [];
                var handle = (quiz.salonHandle || 'Ton salon').trim();
                if (quiz.experience === '5+' || quiz.experience === '2-5') {
                    strengths.push('Ton ancienneté rassure immédiatement les clientes beauté afro.');
                } else {
                    strengths.push('Tu es au moment idéal pour structurer une présence qui attire.');
                }
                if (quiz.acquisition === 'instagram' || quiz.acquisition === 'bouche') {
                    strengths.push('Tu as déjà un canal d’acquisition — Skedisy le complète.');
                }
                if (quiz.agenda === 'plein' || quiz.agenda === 'bien') {
                    strengths.push('La demande existe : capitalise avec une fiche claire et bookable.');
                }
                if (quiz.clarity === 'oui') {
                    strengths.push('Tes infos sont déjà plutôt claires — on les met au format clientes.');
                }
                if (quiz.clarity !== 'oui') {
                    improve.push('Lister prestations (tresses, locks, soins…) et tarifs « à partir de » pour lever les freins.');
                }
                if (quiz.acquisition === 'habituelles' || quiz.agenda === 'vide') {
                    improve.push('Être découvrable hors de ton cercle actuel : niche afro + localisation.');
                }
                if (quiz.platforms === '0' || quiz.platforms === '1') {
                    improve.push('Sans présence multi-canal, tu laisses filer des clientes qui scrollent ailleurs.');
                }
                improve.push('Ajouter des photos de réalisations : 1er critère de confiance en beauté afro.');
                improve.push('Horaires visibles pour convertir sans échange WhatsApp interminable.');
                if (strengths.length < 2) strengths.push('Ton savoir-faire mérite une vitrine dédiée, pas seulement des stories.');

                var summary =
                    'Analyse de « ' + handle + ' ». Tu exerces dans la beauté afro. Aujourd’hui, ' +
                    (quiz.clarity === 'non'
                        ? 'tes clientes doivent trop souvent demander les détails avant de booker.'
                        : quiz.agenda === 'vide'
                            ? 'des créneaux restent vides faute d’être trouvée au bon moment.'
                            : 'le levier le plus fort est une fiche complète qui inspire confiance en quelques secondes.') +
                    ' Skedisy t’aide à présenter clairement ton expertise et à recevoir des demandes.';

                var score = computeScore();
                document.getElementById('diagHandle').textContent = handle;
                document.getElementById('diagSummary').textContent = summary;
                document.getElementById('diagScore').textContent = String(score);
                document.getElementById('diagStrengths').innerHTML = strengths.map(function (s) {
                    return '<li>' + escapeHtml(s) + '</li>';
                }).join('');
                document.getElementById('diagImprove').innerHTML = improve.map(function (s) {
                    return '<li>' + escapeHtml(s) + '</li>';
                }).join('');
                document.getElementById('diagKpis').innerHTML =
                    '<div class="kpi-card"><strong>' + score + '</strong><span>Score potentiel</span></div>' +
                    '<div class="kpi-card"><strong>' + (quiz.agenda === 'vide' ? 'Faible' : quiz.agenda === 'plein' ? 'Élevé' : 'Moyen') + '</strong><span>Remplissage actuel</span></div>' +
                    '<div class="kpi-card"><strong>' + (quiz.clarity === 'oui' ? 'OK' : 'À structurer') + '</strong><span>Clarté offre</span></div>' +
                    '<div class="kpi-card"><strong>' + (quiz.platforms || '—') + '</strong><span>Plateformes</span></div>';

                document.getElementById('dashBeforeName').textContent = 'Bon retour — ' + handle;
                persistQuiz();
                trackEvent('salon_onboarding_diagnostic_viewed', quiz);
            }

            function renderProjection() {
                var p = projectionFromQuiz();
                var handle = (quiz.salonHandle || 'Ton salon').trim();
                document.getElementById('projRange').textContent = euro(p.low) + ' à ' + euro(p.high);
                document.getElementById('projNote').textContent =
                    'Fourchette indicative · niche coiffure afro · objectif 3 mois · score ' + (quiz.score || computeScore());
                document.getElementById('projBreakdown').innerHTML = p.lines.map(function (l) {
                    return '<div class="mono-item"><span>' + escapeHtml(l.label) + '</span><strong>' + escapeHtml(l.value) + '</strong></div>';
                }).join('');
                document.getElementById('dashAfterName').textContent = handle + ' — activité en hausse';
                document.getElementById('aPros').textContent = String(p.pros);
                document.getElementById('aBookings').textContent = String(p.bookings);
                document.getElementById('aCa').textContent = euro(p.ca);
                document.getElementById('aFill').textContent = p.fill + ' %';
                persistQuiz();
            }

            function renderPacks() {
                var list = document.getElementById('mktPackList');
                if (!list) return;
                if (!quiz.packId) quiz.packId = '3m';
                list.innerHTML = PACKS.map(function (pack) {
                    var sel = pack.packId === quiz.packId ? ' selected' : '';
                    var pop = pack.popular ? ' popular' : '';
                    return '<button type="button" class="pack-btn' + sel + pop + '" data-pack="' + pack.packId + '">' +
                        (pack.popular ? '<span class="pack-popular">Plus populaire</span>' : '') +
                        '<span class="pack-radio" aria-hidden="true"></span>' +
                        '<span class="pack-main"><span class="pack-top">' + escapeHtml(pack.label) +
                        '<span class="pack-disc">-' + pack.discountPct + '%</span></span>' +
                        '<span class="pack-prices"><span class="pack-was">' + euro(pack.compareAt) + '</span>' +
                        '<span class="pack-now">' + euro(pack.price) + '</span></span></span>' +
                        '<span class="pack-day"><strong>' + euro(pack.perDay) + '</strong><span>/jour</span></span></button>';
                }).join('');
                updatePackLegal();
                list.querySelectorAll('.pack-btn').forEach(function (btn) {
                    btn.addEventListener('click', function () {
                        quiz.packId = btn.getAttribute('data-pack');
                        persistQuiz();
                        renderPacks();
                        trackEvent('salon_onboarding_pack_selected', { packId: quiz.packId });
                    });
                });
            }

            function updatePackLegal() {
                var pack = PACKS.find(function (p) { return p.packId === quiz.packId; }) || PACKS[1];
                var el = document.getElementById('mktPackLegal');
                if (!el) return;
                el.innerHTML = 'Le prix réduit s’applique à ton premier abonnement. Ton abonnement sera automatiquement renouvelé au prix plein de <strong>' +
                    euro(pack.compareAt) + '</strong> à la fin de la période d’abonnement choisie, jusqu’à annulation dans ton compte.';
            }

            function goMkt(n) {
                for (var i = 0; i <= MKT_MAX; i++) {
                    var p = document.getElementById('mkt' + i);
                    if (p) p.classList.toggle('active', i === n);
                }
                var labels = {
                    0: 'Bienvenue', 1: 'Ton expérience', 2: 'Tes clientes', 3: 'Ton agenda',
                    4: 'Tes plateformes', 5: 'Ta présence en ligne', 6: 'Ton salon',
                    7: 'Diagnostic personnalisé', 8: 'Avant — panel Skedisy', 9: 'Ton rêve',
                    10: 'Tes freins', 11: 'Ton rythme', 12: 'Projection & après',
                    13: 'Ce que Skedisy change', 14: 'Choisis ton plan'
                };
                document.getElementById('mktStepLabel').textContent = labels[n] || '';
                document.getElementById('pageTitle').textContent =
                    n === 0 ? 'Découvre le potentiel de ton salon' :
                    n === 14 ? 'Choisis ton plan' :
                    n >= 12 ? 'Ton plan vers plus de réservations' :
                    'Diagnostic salon · Skedisy';
                document.getElementById('pageSubtitle').textContent =
                    n === 0 ? 'Analyse ~3 min · avant / après · KPIs' :
                    'Étape ' + n + ' / ' + MKT_MAX;
                var bar = document.getElementById('mktProgressBar');
                if (bar) bar.style.width = Math.round((n / MKT_MAX) * 100) + '%';
                hideError();
                if (n === 7) {
                    document.getElementById('mktAnalyzing').style.display = 'block';
                    document.getElementById('mktDiagReady').style.display = 'none';
                    buildDiagnostic();
                    setTimeout(function () {
                        document.getElementById('mktAnalyzing').style.display = 'none';
                        document.getElementById('mktDiagReady').style.display = 'block';
                    }, 1600);
                }
                if (n === 12) renderProjection();
                if (n === 14) renderPacks();
                trackEvent('salon_onboarding_mkt_step', { step: n });
                try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
            }

            function startRegisterFlow() {
                document.getElementById('marketingMode').style.display = 'none';
                document.getElementById('registerMode').style.display = 'block';
                document.getElementById('pageTitle').textContent = 'Créer mon salon';
                document.getElementById('pageSubtitle').textContent = '5 étapes · vitrine prête en quelques minutes';
                if (quiz.salonHandle && document.getElementById('salonName') && !document.getElementById('salonName').value) {
                    document.getElementById('salonName').value = quiz.salonHandle;
                }
                persistQuiz();
                trackEvent('salon_onboarding_register_started', quiz);
                goToStep(1);
            }

            document.getElementById('marketingMode').style.display = 'block';
            trackEvent('salon_onboarding_started', { path: location.pathname });
            goMkt(0);

            document.getElementById('mktStartBtn').addEventListener('click', function () { goMkt(1); });
            document.getElementById('mktSkipBtn').addEventListener('click', function () {
                quiz.skipped = true;
                persistQuiz();
                trackEvent('salon_onboarding_mkt_skipped');
                startRegisterFlow();
            });
            document.getElementById('mktToRegister').addEventListener('click', startRegisterFlow);
            document.getElementById('mktNext6').addEventListener('click', function () {
                quiz.salonHandle = (document.getElementById('mktSalonHandle').value || '').trim();
                if (!quiz.salonHandle) {
                    showError('Indique le nom de ton salon (ou ton @).');
                    return;
                }
                persistQuiz();
                goMkt(7);
            });

            document.querySelectorAll('.choice-list').forEach(function (list) {
                var q = list.getAttribute('data-q');
                list.querySelectorAll('.choice-btn').forEach(function (btn) {
                    btn.addEventListener('click', function () {
                        list.querySelectorAll('.choice-btn').forEach(function (b) { b.classList.remove('selected'); });
                        btn.classList.add('selected');
                        quiz[q] = btn.getAttribute('data-value');
                        persistQuiz();
                        var fb = document.getElementById('fb-' + q);
                        if (fb && FEEDBACK[q] && FEEDBACK[q][quiz[q]]) {
                            fb.textContent = FEEDBACK[q][quiz[q]];
                            fb.classList.add('visible');
                        }
                        var nextBtn = document.getElementById(NEXT_MAP[q]);
                        if (nextBtn) nextBtn.disabled = false;
                        trackEvent('salon_goal_or_quiz_answered', { question: q, value: quiz[q] });
                    });
                });
            });

            document.querySelectorAll('[data-mkt-next]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    goMkt(Number(btn.getAttribute('data-mkt-next')));
                });
            });
            document.querySelectorAll('[data-mkt-back]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    goMkt(Number(btn.getAttribute('data-mkt-back')));
                });
            });
`;

// Replace from marketing funnel JS start through the choice/back handlers, keep register flow vars
const jsStart = html.indexOf("            // --- Marketing funnel then register ---");
const jsEnd = html.indexOf("            var currentStep = 1;");
if (jsStart < 0 || jsEnd < 0) {
  console.error("Could not find marketing JS markers");
  process.exit(1);
}
html = html.slice(0, jsStart) + NEW_JS + "\n\n" + html.slice(jsEnd);

fs.writeFileSync(htmlPath, html);
console.log("Patched", htmlPath);

execFileSync(process.execPath, [path.join(__dirname, "sync-salon-onboarding-html.js")], {
  stdio: "inherit",
});
console.log("Done.");
