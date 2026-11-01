/* Nutrition — expériences interactives (utilisées par le parcours et l'atelier).
 * Chaque expérience reçoit un élément vide et le remplit. Les animations
 * s'arrêtent d'elles-mêmes quand l'élément quitte la page. */
window.Exp = (function () {
  "use strict";
  const { $, $$, aleatoire } = Nutri;

  let uid = 0;
  const nouvelId = (p) => p + "-" + (++uid);
  const fmt = (x, d = 1) => x.toFixed(d).replace(".", ",");
  const lerp = (a, b, t) => a + (b - a) * t;
  const borne = (x, a, b) => Math.max(a, Math.min(b, x));

  /* animation de durée fixe ; renvoie une fonction pour l'arrêter */
  function animer(el, duree, f, fin) {
    const t0 = performance.now();
    let id = 0;
    function pas() {
      if (!el.isConnected) return;
      const p = borne((performance.now() - t0) / duree, 0, 1);
      f(p);
      if (p < 1) id = requestAnimationFrame(pas);
      else if (fin) fin();
    }
    id = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(id);
  }
  /* boucle continue (bulles, particules) */
  function boucle(el, f) {
    let t0 = performance.now();
    function pas() {
      if (!el.isConnected) return;
      const t = performance.now();
      f(borne((t - t0) / 1000, 0, 0.05), t / 1000);
      t0 = t;
      requestAnimationFrame(pas);
    }
    requestAnimationFrame(pas);
  }
  function segment(titre, options, actif) {
    const nom = nouvelId("seg");
    return `<div class="segment" role="radiogroup" aria-label="${titre}">${options.map(([v, t]) =>
      `<label><input type="radio" name="${nom}" value="${v}"${v === actif ? " checked" : ""}><span>${t}</span></label>`).join("")}</div>`;
  }
  const valeur = (seg) => $("input:checked", seg).value;
  const marqueur = (id, couleur) => `<marker id="${id}" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${couleur}"/></marker>`;

  /* ======================================================================
   * I. PHOTOSYNTHÈSE
   * ==================================================================== */

  /* Le saule de Van Helmont : 5 ans en accéléré */
  function vanHelmont(el) {
    el.innerHTML = `<div class="deux-col">
      <svg viewBox="0 0 420 280" class="dessin" role="img" aria-label="Le saule de Van Helmont dans son bac de terre, et la comparaison des masses">
        <rect width="420" height="280" rx="14" fill="#f0f9ff"/>
        <g opacity=".9"><ellipse cx="62" cy="38" rx="30" ry="15" fill="#cbd5e1"/><ellipse cx="88" cy="32" rx="24" ry="16" fill="#cbd5e1"/><ellipse cx="40" cy="42" rx="18" ry="11" fill="#cbd5e1"/>
          <path d="M45,58 l-4,12 M62,58 l-4,12 M79,58 l-4,12 M96,52 l-4,12" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
          <text x="62" y="86" font-size="11" fill="#0369a1" text-anchor="middle">eau de pluie</text></g>
        <g class="vh-arbre"></g>
        <polygon points="40,200 280,200 262,262 58,262" fill="#a16207"/>
        <rect x="40" y="198" width="240" height="9" rx="3" fill="#713f12"/>
        <text x="160" y="240" font-size="13" fill="#fff" text-anchor="middle" class="vh-terre">Terre : 90,9 kg</text>
        <line x1="300" y1="242" x2="412" y2="242" stroke="#64748b"/>
        <rect class="vh-b1" x="312" y="242" width="38" height="0" rx="4" fill="#65a30d"/>
        <rect class="vh-b2" x="364" y="241" width="38" height="1" rx="1" fill="#a16207"/>
        <text class="vh-v1" x="331" y="236" font-size="11" font-weight="700" text-anchor="middle" fill="#3f6212"></text>
        <text class="vh-v2" x="383" y="236" font-size="11" font-weight="700" text-anchor="middle" fill="#713f12"></text>
        <text x="331" y="256" font-size="10.5" text-anchor="middle" fill="#334155">masse</text><text x="331" y="268" font-size="10.5" text-anchor="middle" fill="#334155">gagnée</text>
        <text x="331" y="279" font-size="10.5" text-anchor="middle" fill="#334155">(saule)</text>
        <text x="383" y="256" font-size="10.5" text-anchor="middle" fill="#334155">masse</text><text x="383" y="268" font-size="10.5" text-anchor="middle" fill="#334155">perdue</text>
        <text x="383" y="279" font-size="10.5" text-anchor="middle" fill="#334155">(terre)</text>
      </svg>
      <div>
        <div class="reglage"><span>Temps écoulé</span><input type="range" min="0" max="5" step="0.1" value="0" aria-label="Années écoulées"><b class="vh-annees">0 an</b></div>
        <div class="lecture"><span>Saule : <b class="vh-saule"></b></span><span>Terre séchée : <b class="vh-sol"></b></span></div>
        <div class="commandes"><button class="btn btn-principal vh-lancer" type="button">▶ Faire passer 5 ans</button></div>
        <p class="retour" aria-live="polite"></p>
      </div>
    </div>`;
    const curseur = $("input", el);
    function arbre(s) {
      let tombantes = "";
      for (let k = -54; k <= 54; k += 12) tombantes += `<path d="M${k},-128 q${k / 6},40 ${k / 3},${70 - Math.abs(k) / 3}" stroke="#4d7c0f" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      return `<g transform="translate(160,200) scale(${s})">
        <path d="M-8,0 C-6,-40 -5,-70 -4,-100 L4,-100 C5,-70 6,-40 8,0 Z" fill="#7c4a1e"/>
        <path d="M0,-65 L-30,-112 M0,-78 L30,-120 M0,-95 L-6,-150" stroke="#7c4a1e" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="0" cy="-138" rx="62" ry="40" fill="#84cc16"/><ellipse cx="-34" cy="-118" rx="34" ry="30" fill="#65a30d"/><ellipse cx="36" cy="-120" rx="34" ry="30" fill="#65a30d"/>
        ${tombantes}</g>`;
    }
    function maj() {
      const t = +curseur.value;
      const saule = 2.3 + 74.4 * Math.pow(t / 5, 1.6);
      const terre = 90.9 - 0.06 * (t / 5);
      $(".vh-arbre", el).innerHTML = arbre(0.18 + 0.66 * Math.sqrt((saule - 2.3) / 74.4));
      $(".vh-annees", el).textContent = t < 1.05 ? fmt(t) + " an" : fmt(t) + " ans";
      $(".vh-saule", el).textContent = fmt(saule) + " kg";
      $(".vh-sol", el).textContent = fmt(terre, 2) + " kg";
      $(".vh-terre", el).textContent = "Terre : " + fmt(terre, 2) + " kg";
      const h1 = 180 * (saule - 2.3) / 74.4;
      $(".vh-b1", el).setAttribute("y", 242 - h1);
      $(".vh-b1", el).setAttribute("height", h1);
      $(".vh-v1", el).setAttribute("y", 236 - h1);
      $(".vh-v1", el).textContent = "+" + fmt(saule - 2.3) + " kg";
      $(".vh-v2", el).textContent = t > 0 ? "−" + Math.round(60 * t / 5) + " g" : "";
      $(".retour", el).className = "retour" + (t >= 5 ? " ok" : "");
      $(".retour", el).textContent = t >= 5
        ? "En 5 ans, le saule a gagné 74,4 kg, mais la terre n'a perdu que 60 g. La matière du saule ne vient donc presque pas de la terre !"
        : "";
    }
    curseur.addEventListener("input", maj);
    $(".vh-lancer", el).addEventListener("click", () => {
      const depart = +curseur.value >= 5 ? 0 : +curseur.value;
      animer(el, 4000 * (1 - depart / 5), (p) => { curseur.value = lerp(depart, 5, p); maj(); });
    });
    maj();
  }

  /* L'expérience d'Ingenhousz : les élodées et les bulles de dioxygène */
  function elodee(el) {
    el.innerHTML = `<div class="deux-col">
      <svg viewBox="0 0 420 290" class="dessin" role="img" aria-label="Une élodée dans un bécher d'eau, éclairée par une lampe">
        <rect width="420" height="290" rx="14" class="el-fond" fill="#f8fafc"/>
        <circle class="el-halo" cx="70" cy="86" r="70" fill="#fde68a"/>
        <path d="M30,270 h70 M65,270 V140 L70,100" stroke="#475569" stroke-width="6" stroke-linecap="round" fill="none"/>
        <path d="M44,96 L96,72 L104,104 Z" fill="#334155"/>
        <circle class="el-ampoule" cx="94" cy="92" r="9" fill="#fde047"/>
        <rect x="150" y="70" width="210" height="200" rx="6" fill="none" stroke="#94a3b8" stroke-width="3"/>
        <rect x="152" y="96" width="206" height="172" fill="#dbeafe" opacity=".75"/>
        <line x1="152" y1="96" x2="358" y2="96" stroke="#60a5fa" stroke-width="2"/>
        <g class="el-plante"></g>
        <g class="el-bulles"></g>
        <text x="255" y="62" font-size="12" text-anchor="middle" fill="#0369a1" class="el-o2">bulles de dioxygène (O₂)</text>
      </svg>
      <div>
        <div class="reglage"><span>Lumière</span>${segment("Lumière", [["0", "Obscurité"], ["0.35", "Faible"], ["1", "Forte"]], "1")}</div>
        <div class="reglage"><span>Dioxyde de carbone dans l'eau</span>${segment("Dioxyde de carbone", [["1", "Oui"], ["0", "Non"]], "1")}</div>
        <div class="reglage"><span>Chlorophylle</span>${segment("Chlorophylle", [["1", "Plante verte"], ["0", "Plante sans chlorophylle"]], "1")}</div>
        <div class="commandes"><button class="btn btn-principal el-compter" type="button">⏱ Compter les bulles pendant 1 minute</button><b class="el-chrono" aria-live="polite"></b></div>
        <p class="retour" aria-live="polite"></p>
      </div>
    </div>
    <div class="defile"><table class="tableau tableau-mesures"><thead><tr><th>Lumière</th><th>Dioxyde de carbone</th><th>Chlorophylle</th><th>Bulles en 1 min</th></tr></thead>
      <tbody><tr class="vide"><td colspan="4">Pas encore de mesure : règle les conditions puis compte les bulles.</td></tr></tbody></table></div>`;
    const segs = $$(".segment", el);
    const noms = [{ 0: "Obscurité", 0.35: "Faible", 1: "Forte" }, { 1: "Oui", 0: "Non" }, { 1: "Oui", 0: "Non" }];
    // la plante : une tige et des feuilles alternées
    const pointes = [];
    function plante(verte) {
      const coul = verte ? "#16a34a" : "#e7e2b8";
      const bord = verte ? "#166534" : "#a8a27a";
      let f = `<path d="M255,268 C250,220 262,170 252,118" stroke="${bord}" stroke-width="4" fill="none"/>`;
      pointes.length = 0;
      for (let i = 0; i < 12; i++) {
        const y = 256 - i * 12;
        const x = 255 + Math.sin(i * 0.9) * 4;
        const cote = i % 2 ? 1 : -1;
        const a = cote * (55 - i * 2);
        f += `<ellipse cx="${x + cote * 13}" cy="${y - 6}" rx="15" ry="5" fill="${coul}" stroke="${bord}" stroke-width="1" transform="rotate(${-a / 2} ${x} ${y})"/>`;
        pointes.push([x + cote * 22, y - 12]);
      }
      $(".el-plante", el).innerHTML = f;
    }
    const bulles = [];
    let reste = 0;
    const taux = () => segs.reduce((p, s) => p * +valeur(s), 1);
    function majConditions() {
      const L = +valeur(segs[0]);
      $(".el-halo", el).setAttribute("opacity", L * 0.75);
      $(".el-ampoule", el).setAttribute("fill", L ? "#fde047" : "#64748b");
      $(".el-fond", el).setAttribute("fill", L ? "#f8fafc" : "#cbd5e1");
      plante(valeur(segs[2]) === "1");
      $(".el-o2", el).style.opacity = taux() > 0 ? 1 : 0;
    }
    segs.forEach((s) => s.addEventListener("change", majConditions));
    majConditions();
    const groupe = $(".el-bulles", el);
    boucle(el, (dt) => {
      reste += taux() * 6 * dt;
      while (reste >= 1) {
        reste -= 1;
        const [x, y] = pointes[Math.floor(Math.random() * pointes.length)];
        const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        c.setAttribute("class", "bulle");
        c.setAttribute("r", 2.5 + Math.random() * 2.5);
        groupe.append(c);
        bulles.push({ c, x, y, v: 45 + Math.random() * 25, ph: Math.random() * 6 });
      }
      for (let i = bulles.length - 1; i >= 0; i--) {
        const b = bulles[i];
        b.y -= b.v * dt;
        b.ph += dt * 5;
        if (b.y < 98) { b.c.remove(); bulles.splice(i, 1); continue; }
        b.c.setAttribute("cx", b.x + Math.sin(b.ph) * 2);
        b.c.setAttribute("cy", b.y);
      }
    });
    // comptage accéléré : 1 minute en 4 secondes
    const btn = $(".el-compter", el);
    btn.addEventListener("click", () => {
      btn.disabled = true;
      segs.forEach((s) => $$("input", s).forEach((i) => (i.disabled = true)));
      const t = taux();
      const total = t > 0 ? Math.max(1, Math.round(t * 30 + (Math.random() * 4 - 2))) : 0;
      animer(el, 4000, (p) => { $(".el-chrono", el).textContent = `${Math.round(p * 60)} s : ${Math.round(p * total)} bulles`; }, () => {
        btn.disabled = false;
        segs.forEach((s) => $$("input", s).forEach((i) => (i.disabled = false)));
        const v = segs.map((s) => valeur(s));
        const corps = $("tbody", el);
        const vide = $(".vide", corps);
        if (vide) vide.remove();
        corps.insertAdjacentHTML("beforeend", `<tr><td>${noms[0][v[0]]}</td><td>${noms[1][v[1]]}</td><td>${noms[2][v[2]]}</td><td><b>${total}</b></td></tr>`);
        while (corps.rows.length > 8) corps.deleteRow(0);
        const manque = [];
        if (v[0] === "0") manque.push("de lumière");
        if (v[1] === "0") manque.push("de dioxyde de carbone");
        if (v[2] === "0") manque.push("de chlorophylle");
        const r = $(".retour", el);
        r.className = "retour " + (total ? "ok" : "ko");
        r.textContent = total
          ? (v[0] === "0.35" ? `${total} bulles : avec peu de lumière, la plante produit moins de dioxygène.` : `${total} bulles de dioxygène en une minute.`)
          : `Aucune bulle : la plante ne fabrique pas de dioxygène sans ${manque.join(", ni sans ")}.`.replace("sans de", "sans");
      });
    });
  }

  /* Schéma de la cellule végétale chlorophyllienne à légender */
  function cellule(el, surFin) {
    let chloros = "";
    [[60, 150, 20], [78, 205, -10], [140, 222, 5], [215, 226, -5], [290, 222, 8], [352, 196, -25], [362, 120, 70], [330, 50, 15], [255, 44, -8], [175, 44, 6], [56, 82, 75]].forEach(([x, y, a]) => {
      chloros += `<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="15" ry="8" fill="#4ade80" stroke="#166534" stroke-width="1.5"/>
        <path d="M${x - 8},${y - 2} h16 M${x - 8},${y + 2} h16" stroke="#166534" stroke-width="1.2"/></g>`;
    });
    const num = (n, x, y, x2, y2) => `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="#1d2a24" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="11" fill="#1d2a24"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">${n}</text>`;
    el.innerHTML = `<svg viewBox="0 0 420 270" class="dessin" role="img" aria-label="Schéma d'une cellule végétale chlorophyllienne, avec 6 structures numérotées">
        <rect x="22" y="18" width="376" height="234" rx="34" fill="#d9f0bf" stroke="#65a30d" stroke-width="12"/>
        <rect x="32" y="28" width="356" height="214" rx="26" fill="#f2fae8" stroke="#3f6212" stroke-width="2"/>
        <path d="M120,80 C170,64 300,62 330,92 C352,118 345,180 318,196 C270,220 160,214 128,190 C104,170 98,100 120,80 Z" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="2"/>
        <circle cx="88" cy="196" r="28" fill="#e9d5ff" stroke="#7e22ce" stroke-width="2.5"/><circle cx="94" cy="190" r="8" fill="#c084fc"/>
        ${chloros}
        ${num(1, 14, 140, 22, 140)}${num(2, 412, 150, 388, 150)}${num(3, 60, 120, 60, 112)}${num(4, 150, 262, 106, 214)}${num(5, 300, 262, 290, 230)}${num(6, 228, 140, 228, 140)}
      </svg>
      <div class="zone-trous" style="margin-top:12px"></div>`;
    Nutri.trous($(".zone-trous", el), {
      consigne: "Légende le schéma : glisse chaque nom à côté du bon numéro (ou touche un nom, puis un trou).",
      html: `<ol class="etiq-liste">${["Paroi", "Membrane", "Cytoplasme", "Noyau", "Chloroplaste", "Vacuole"].map((m, i) => `<li><span class="num-rond">${i + 1}</span><b>${m}</b></li>`).join("")}</ol>`,
      fin: "Schéma légendé ✓ Les chloroplastes (5), verts grâce à la chlorophylle, sont le lieu de la photosynthèse. La paroi (1) n'existe pas chez les cellules animales.",
      surFin,
    });
  }

  /* L'équation de la photosynthèse à reconstruire */
  function equationPhoto(el, surFin) {
    Nutri.trous(el, {
      consigne: "Reconstitue l'équation de la photosynthèse avec les résultats des expériences.",
      html: `<p class="equation"><b data-groupe="r">dioxyde de carbone</b> + <b data-groupe="r">eau</b> + <b data-groupe="r">sels minéraux</b>
        <span class="fleche"><b>lumière</b><i>⟶</i><small>dans les chloroplastes</small></span>
        <b data-groupe="p">matière organique</b> + <b data-groupe="p">dioxygène</b></p>
        <p class="petit" style="display:flex;justify-content:space-between"><span>← réactifs (ce qui est utilisé)</span><span>produits (ce qui est fabriqué) →</span></p>`,
      pieges: ["énergie"],
      fin: "Équation complète ✓ Van Helmont avait en partie raison : l'eau compte, mais l'essentiel de la matière vient du dioxyde de carbone de l'air !",
      surFin,
    });
  }

  /* ======================================================================
   * II. RÉSEAUX TROPHIQUES
   * ==================================================================== */

  /* Construire un réseau : toucher l'être vivant mangé, puis celui qui le mange.
   * cfg : { noeuds: [{ id, nom, emoji, x, y }], liens: [[mangé, mangeur]], h, surFin } */
  function reseau(el, cfg) {
    const W = 420, H = cfg.h || 330, BW = 92, BH = 54;
    const idm = nouvelId("fl");
    const N = Object.fromEntries(cfg.noeuds.map((n) => [n.id, n]));
    const attendus = new Set(cfg.liens.map(([a, b]) => a + ">" + b));
    let traces = [];
    let choisi = null;
    el.innerHTML = `<p class="petit">Touche un être vivant <b>mangé</b>, puis celui qui le <b>mange</b> : une flèche « est mangé par » apparaît. Touche une flèche pour l'effacer.</p>
      <svg viewBox="0 0 ${W} ${H}" class="dessin reseau-svg" role="group" aria-label="Réseau trophique à construire">
        <defs>${marqueur(idm, "#475569")}${marqueur(idm + "j", "#15803d")}${marqueur(idm + "f", "#dc2626")}</defs>
        <g class="r-fleches"></g>
        <g class="r-noeuds">${cfg.noeuds.map((n) => `<g class="noeud" data-id="${n.id}" tabindex="0" role="button" aria-label="${n.nom}">
          <rect x="${n.x - BW / 2}" y="${n.y - BH / 2}" width="${BW}" height="${BH}" rx="14"/>
          <text class="emoji" x="${n.x}" y="${n.y + 1}">${n.emoji}</text><text x="${n.x}" y="${n.y + 21}">${n.nom}</text></g>`).join("")}</g>
      </svg>
      <div class="commandes"><button class="btn btn-principal r-verifier" type="button">Vérifier mon réseau</button><button class="btn r-effacer" type="button">Tout effacer</button><span class="petit r-compte"></span></div>
      <p class="retour" aria-live="polite"></p>`;
    const svg = $("svg", el);
    function bord(a, b) {
      const dx = b.x - a.x, dy = b.y - a.y;
      const t = Math.min((BW / 2 + 4) / Math.abs(dx || 1e-9), (BH / 2 + 4) / Math.abs(dy || 1e-9));
      return [a.x + dx * t, a.y + dy * t];
    }
    function dessiner(etats) {
      $(".r-fleches", el).innerHTML = traces.map((l, i) => {
        const a = N[l[0]], b = N[l[1]];
        const [x1, y1] = bord(a, b);
        const [x2, y2] = bord(b, a);
        const e = etats ? etats[i] : "";
        return `<g data-i="${i}"><line class="fleche-zone" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>
          <line class="fleche-r ${e}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#${idm}${e === "juste" ? "j" : e === "faux" ? "f" : ""})"/></g>`;
      }).join("");
      $(".r-compte", el).textContent = traces.length ? `${traces.length} flèche${traces.length > 1 ? "s" : ""}` : "";
    }
    function choisir(id) {
      choisi = id;
      $$(".noeud", el).forEach((g) => g.classList.toggle("choisi", g.dataset.id === id));
    }
    function toucher(id) {
      const r = $(".retour", el);
      if (!choisi) { choisir(id); r.className = "retour"; r.textContent = `${N[id].nom} est mangé par… (touche le mangeur)`; return; }
      if (choisi === id) { choisir(null); r.textContent = ""; return; }
      const cle = choisi + ">" + id;
      if (!traces.some((l) => l[0] + ">" + l[1] === cle)) traces.push([choisi, id]);
      r.textContent = `Flèche ajoutée : ${N[choisi].nom} → ${N[id].nom}`;
      choisir(null);
      dessiner();
    }
    svg.addEventListener("click", (e) => {
      const n = e.target.closest(".noeud");
      if (n) { toucher(n.dataset.id); return; }
      const f = e.target.closest("[data-i]");
      if (f) { traces.splice(+f.dataset.i, 1); dessiner(); $(".retour", el).textContent = "Flèche effacée."; }
    });
    svg.addEventListener("keydown", (e) => {
      const n = e.target.closest(".noeud");
      if (n && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toucher(n.dataset.id); }
    });
    $(".r-effacer", el).addEventListener("click", () => { traces = []; choisir(null); dessiner(); $(".retour", el).textContent = ""; });
    let essais = 0;
    $(".r-verifier", el).addEventListener("click", () => {
      essais++;
      const etats = traces.map((l) => (attendus.has(l[0] + ">" + l[1]) ? "juste" : "faux"));
      dessiner(etats);
      const justes = etats.filter((x) => x === "juste").length;
      const faux = etats.length - justes;
      const inverses = traces.filter((l) => attendus.has(l[1] + ">" + l[0])).length;
      const manque = attendus.size - justes;
      const r = $(".retour", el);
      if (!faux && !manque) {
        r.className = "retour ok";
        r.textContent = `Bravo, ton réseau est juste : ${justes} flèches « est mangé par ». Toute la matière organique vient du producteur.`;
        if (cfg.surFin) cfg.surFin({ essais });
        return;
      }
      r.className = "retour ko";
      r.textContent = `${justes} flèche${justes > 1 ? "s" : ""} juste${justes > 1 ? "s" : ""} sur ${attendus.size}.`
        + (faux ? ` ${faux} fausse${faux > 1 ? "s" : ""} (en rouge).` : "")
        + (manque ? ` Il en manque ${manque}.` : "")
        + (inverses ? " Attention au sens : la flèche va de celui qui est mangé vers celui qui mange." : " Relis le document.");
    });
    dessiner();
  }

  /* Et sans décomposeurs ? 10 ans en accéléré */
  function recyclage(el) {
    el.innerHTML = `<div class="deux-col">
      <svg viewBox="0 0 420 280" class="dessin" role="img" aria-label="Un chêne, la litière de feuilles mortes et les sels minéraux du sol">
        <rect width="420" height="280" rx="14" fill="#f0f9ff"/>
        <rect x="0" y="190" width="420" height="90" fill="#92633a"/>
        <g class="rc-sels"></g>
        <g class="rc-litiere"></g>
        <g class="rc-arbre"></g>
        <g class="rc-deco"></g>
        <text x="410" y="272" font-size="11" fill="#fff" text-anchor="end">● sels minéraux du sol</text>
      </svg>
      <div>
        <div class="reglage"><span>Décomposeurs (champignons, bactéries)</span>${segment("Décomposeurs", [["1", "Présents"], ["0", "Absents"]], "1")}</div>
        <div class="reglage"><span>Années</span><input type="range" min="0" max="10" step="0.1" value="0" aria-label="Années écoulées"><b class="rc-annees">0</b></div>
        <div class="commandes"><button class="btn btn-principal rc-lancer" type="button">▶ Faire passer 10 ans</button></div>
        <div class="jauge"><span>Feuilles mortes au sol</span><div class="jauge-barre"><i class="rc-j1" style="background:#a16207"></i></div></div>
        <div class="jauge"><span>Sels minéraux du sol</span><div class="jauge-barre"><i class="rc-j2" style="background:var(--sels)"></i></div></div>
        <div class="jauge"><span>Santé du chêne</span><div class="jauge-barre"><i class="rc-j3" style="background:#16a34a"></i></div></div>
        <p class="retour" aria-live="polite"></p>
      </div></div>`;
    const seg = $(".segment", el);
    const curseur = $("input[type=range]", el);
    const r = aleatoire(7);
    const pts = Array.from({ length: 40 }, () => [10 + r() * 400, 205 + r() * 55]);
    const feuilles = Array.from({ length: 160 }, () => [8 + r() * 404, r(), r() * 360]);
    function maj() {
      const t = +curseur.value;
      const deco = valeur(seg) === "1";
      const litiere = deco ? 1 : 1 + 0.6 * t;
      const sels = deco ? 1 : Math.max(0.12, 1 - 0.088 * t);
      const sante = deco ? 1 : Math.max(0.2, sels * 1.05);
      $(".rc-annees", el).textContent = Math.round(t) + (t >= 1.5 ? " ans" : " an");
      $(".rc-sels", el).innerHTML = pts.slice(0, Math.round(40 * sels)).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#c4b5fd" stroke="#6d28d9"/>`).join("");
      const ep = 4 + 5 * litiere;
      $(".rc-litiere", el).innerHTML = `<rect x="0" y="${190 - ep}" width="420" height="${ep}" fill="#b45309" opacity=".55"/>`
        + feuilles.slice(0, Math.round(25 * litiere)).map(([x, h, a]) => `<ellipse cx="${x}" cy="${190 - h * ep}" rx="5" ry="2.4" fill="#c2410c" transform="rotate(${a} ${x} ${190 - h * ep})"/>`).join("");
      const vert = `rgb(${Math.round(lerp(190, 34, sante))},${Math.round(lerp(140, 163, sante))},${Math.round(lerp(40, 74, sante))})`;
      const s = 0.7 + 0.3 * sante;
      $(".rc-arbre", el).innerHTML = `<g transform="translate(150,${190 - ep + 2})"><path d="M-12,0 C-9,-40 -8,-70 -6,-95 L6,-95 C8,-70 9,-40 12,0 Z" fill="#6b3f1d"/>
        <g transform="scale(${s})"><circle cx="0" cy="-130" r="52" fill="${vert}"/><circle cx="-42" cy="-108" r="36" fill="${vert}"/><circle cx="44" cy="-110" r="38" fill="${vert}"/></g></g>`;
      $(".rc-deco", el).innerHTML = deco ? `<text x="300" y="186" font-size="20">🍄</text><text x="330" y="186" font-size="12" fill="#3f2a14">champignons</text>` : "";
      $(".rc-j1", el).style.width = Math.min(100, 15 * litiere) + "%";
      $(".rc-j2", el).style.width = 100 * sels + "%";
      $(".rc-j3", el).style.width = 100 * sante + "%";
      const ret = $(".retour", el);
      if (deco) { ret.className = "retour ok"; ret.textContent = t > 0 ? "Les décomposeurs dégradent les feuilles mortes en sels minéraux : le sol reste riche et le chêne en bonne santé." : ""; }
      else { ret.className = "retour ko"; ret.textContent = t > 3 ? "Sans décomposeurs, les feuilles mortes s'entassent et ne sont plus transformées en sels minéraux : le sol s'appauvrit, le chêne dépérit." : ""; }
    }
    seg.addEventListener("change", () => { curseur.value = 0; maj(); });
    curseur.addEventListener("input", maj);
    $(".rc-lancer", el).addEventListener("click", () => animer(el, 5000, (p) => { curseur.value = 10 * p; maj(); }));
    maj();
  }

  /* ======================================================================
   * III. RESPIRATION
   * ==================================================================== */

  function graphe(g, o) {
    // o : { x0, x1, y0, y1, X: [min, max, pas, titre], Y: [min, max, pas, titre] }
    const sx = (v) => o.x0 + (v - o.X[0]) / (o.X[1] - o.X[0]) * (o.x1 - o.x0);
    const sy = (v) => o.y0 - (v - o.Y[0]) / (o.Y[1] - o.Y[0]) * (o.y0 - o.y1);
    let s = "";
    for (let v = o.Y[0]; v <= o.Y[1] + 1e-9; v += o.Y[2]) s += `<line class="grille" x1="${o.x0}" x2="${o.x1}" y1="${sy(v)}" y2="${sy(v)}"/><text x="${o.x0 - 6}" y="${sy(v) + 4}" text-anchor="end">${v}</text>`;
    for (let v = o.X[0]; v <= o.X[1] + 1e-9; v += o.X[2]) s += `<text x="${sx(v)}" y="${o.y0 + 15}" text-anchor="middle">${v}</text>`;
    s += `<line class="axe" x1="${o.x0}" x2="${o.x1}" y1="${o.y0}" y2="${o.y0}"/><line class="axe" x1="${o.x0}" x2="${o.x0}" y1="${o.y0}" y2="${o.y1 - 6}"/>
      <text x="${o.x1}" y="${o.y0 + 30}" text-anchor="end">${o.X[3]}</text><text x="${o.x0 - 34}" y="${o.y1 - 12}">${o.Y[3]}</text>`;
    g.innerHTML = s;
    return { sx, sy };
  }

  /* Graines dans un flacon fermé : capteurs de dioxygène et de dioxyde de carbone */
  function cloche(el) {
    el.innerHTML = `<div class="deux-col">
      <div>
        <svg viewBox="0 0 420 300" class="dessin graphe" role="img" aria-label="Graphique : taux de dioxygène et de dioxyde de carbone dans le flacon">
          <g class="cl-axes"></g><g class="cl-anciennes"></g>
          <path class="courbe cl-o2" stroke="var(--o2)"/><path class="courbe cl-co2" stroke="#334155"/>
          <g font-size="12" font-weight="700"><text x="300" y="30" fill="var(--o2)">— dioxygène</text><text x="300" y="46" fill="#334155">— dioxyde de carbone</text></g>
        </svg>
      </div>
      <div>
        <svg viewBox="0 0 260 200" class="dessin" role="img" aria-label="Flacon fermé contenant des graines, avec deux capteurs, et un tube d'eau de chaux">
          <path d="M40,40 h90 v20 c30,10 40,30 40,60 v60 h-170 v-60 c0,-30 10,-50 40,-60 z" fill="#f1f5f9" stroke="#64748b" stroke-width="3"/>
          <rect x="34" y="28" width="102" height="16" rx="4" fill="#475569"/>
          <rect x="60" y="6" width="12" height="40" fill="#0284c7"/><rect x="98" y="6" width="12" height="40" fill="#334155"/>
          <text x="66" y="62" font-size="9" text-anchor="middle" fill="#0284c7">O₂</text><text x="104" y="62" font-size="9" text-anchor="middle" fill="#334155">CO₂</text>
          <g class="cl-graines"></g>
          <rect x="196" y="60" width="34" height="120" rx="14" fill="#fff" stroke="#64748b" stroke-width="3"/>
          <rect class="cl-chaux" x="199" y="96" width="28" height="80" rx="11" fill="#e0f2fe"/>
          <text x="213" y="196" font-size="10" text-anchor="middle" fill="#334155">eau de chaux</text>
        </svg>
        <div class="reglage"><span>Dans le flacon</span>${segment("Contenu du flacon", [["v", "Graines germées"], ["m", "Graines mortes (témoin)"]], "v")}</div>
        <div class="commandes"><button class="btn btn-principal cl-lancer" type="button">▶ Mesurer pendant 48 h</button><button class="btn cl-chaux-btn" type="button" disabled>Faire barboter dans l'eau de chaux</button></div>
        <div class="lecture"><span>O₂ : <b class="cl-v1">21 %</b></span><span>CO₂ : <b class="cl-v2">0 %</b></span><span>Temps : <b class="cl-t">0 h</b></span></div>
      </div></div>
      <p class="retour" aria-live="polite"></p>`;
    const { sx, sy } = graphe($(".cl-axes", el), { x0: 46, x1: 400, y0: 262, y1: 24, X: [0, 48, 12, "temps (h)"], Y: [0, 25, 5, "%"] });
    const seg = $(".segment", el);
    const vivantes = () => valeur(seg) === "v";
    function graines() {
      const v = vivantes();
      let s = "";
      for (let i = 0; i < 9; i++) {
        const x = 30 + i * 13, y = 166 - (i % 2) * 6;
        s += `<ellipse cx="${x}" cy="${y}" rx="7" ry="5" fill="${v ? "#e9d8a6" : "#8d7a55"}" stroke="#7c5e2a"/>`;
        if (v) s += `<path d="M${x + 4},${y - 3} q4,-10 0,-16" stroke="#65a30d" stroke-width="2" fill="none"/>`;
      }
      $(".cl-graines", el).innerHTML = s;
    }
    const chemin = (f, p) => { let d = ""; for (let i = 0; i <= 48 * p; i += 1) d += (d ? "L" : "M") + sx(i).toFixed(1) + "," + sy(f(i)).toFixed(1); return d; };
    let dernier = null;
    seg.addEventListener("change", () => { graines(); $(".cl-chaux", el).setAttribute("fill", "#e0f2fe"); $(".cl-chaux-btn", el).disabled = true; });
    graines();
    $(".cl-lancer", el).addEventListener("click", () => {
      const v = vivantes();
      if (dernier) $(".cl-anciennes", el).insertAdjacentHTML("beforeend", `<path class="courbe ancienne" stroke="var(--o2)" d="${$(".cl-o2", el).getAttribute("d")}"/><path class="courbe ancienne" stroke="#334155" d="${$(".cl-co2", el).getAttribute("d")}"/>`);
      const o2 = (t) => (v ? 21 - 6 * Math.pow(t / 48, 1.1) : 21);
      const co2 = (t) => (v ? 6 * Math.pow(t / 48, 1.1) : 0);
      $(".cl-lancer", el).disabled = true;
      $(".cl-chaux-btn", el).disabled = true;
      $(".cl-chaux", el).setAttribute("fill", "#e0f2fe");
      animer(el, 3500, (p) => {
        $(".cl-o2", el).setAttribute("d", chemin(o2, p));
        $(".cl-co2", el).setAttribute("d", chemin(co2, p));
        $(".cl-v1", el).textContent = fmt(o2(48 * p)) + " %";
        $(".cl-v2", el).textContent = fmt(co2(48 * p)) + " %";
        $(".cl-t", el).textContent = Math.round(48 * p) + " h";
      }, () => {
        dernier = v;
        $(".cl-lancer", el).disabled = false;
        $(".cl-chaux-btn", el).disabled = false;
        const r = $(".retour", el);
        r.className = "retour ok";
        r.textContent = v ? "Les graines germées ont absorbé du dioxygène (21 % → 15 %) et rejeté du dioxyde de carbone (0 % → 6 %)."
          : "Avec des graines mortes, rien ne change : ce sont bien les graines vivantes qui modifient l'air du flacon.";
      });
    });
    $(".cl-chaux-btn", el).addEventListener("click", () => {
      const v = dernier;
      $(".cl-chaux", el).setAttribute("fill", v ? "#f8fafc" : "#e0f2fe");
      $(".cl-chaux", el).setAttribute("stroke", v ? "#cbd5e1" : "none");
      const r = $(".retour", el);
      r.className = "retour ok";
      r.textContent = v ? "L'eau de chaux se trouble (elle devient blanche) : l'air du flacon contient du dioxyde de carbone." : "L'eau de chaux reste limpide : pas de dioxyde de carbone.";
    });
  }

  /* Le chêne sur 24 heures, en été et en hiver */
  function chene(el) {
    const idm = nouvelId("fc");
    el.innerHTML = `<div class="deux-col">
      <svg viewBox="0 0 420 290" class="dessin" role="img" aria-label="Un chêne et ses échanges de gaz selon l'heure et la saison">
        <defs>${marqueur(idm + "o", "#0284c7")}${marqueur(idm + "c", "#334155")}</defs>
        <rect class="ch-ciel" width="420" height="290" rx="14"/>
        <g class="ch-astre"></g>
        <rect x="0" y="230" width="420" height="60" fill="#7c5a35"/>
        <g class="ch-arbre"></g>
        <g class="ch-fleches"></g>
      </svg>
      <div>
        <div class="reglage"><span>Saison</span>${segment("Saison", [["e", "Été"], ["h", "Hiver"]], "e")}</div>
        <div class="reglage"><span>Heure</span><input type="range" min="0" max="24" step="1" value="10" aria-label="Heure"><b class="ch-h">10 h</b></div>
        <div class="jauge"><span>Photosynthèse</span><div class="jauge-barre"><i class="ch-j1" style="background:#16a34a"></i></div></div>
        <div class="jauge"><span>Respiration</span><div class="jauge-barre"><i class="ch-j2" style="background:#ea580c"></i></div></div>
        <p class="retour" aria-live="polite"></p>
      </div></div>`;
    const seg = $(".segment", el);
    const curseur = $("input[type=range]", el);
    function fleche(x1, y1, x2, y2, gaz, larg, txt, tx, ty) {
      const c = gaz === "o" ? "#0284c7" : "#334155";
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${larg}" marker-end="url(#${idm + gaz})"/><text x="${tx}" y="${ty}" font-size="13" font-weight="700" fill="${c}">${txt}</text>`;
    }
    function maj() {
      const h = +curseur.value;
      const ete = valeur(seg) === "e";
      $(".ch-h", el).textContent = h + " h";
      const jour = ete ? Math.max(0, Math.sin(Math.PI * (h - 6) / 15)) * (h >= 6 && h <= 21 ? 1 : 0) : Math.max(0, Math.sin(Math.PI * (h - 8) / 9)) * (h >= 8 && h <= 17 ? 1 : 0);
      const P = ete ? jour : 0; // en hiver, le chêne n'a pas de feuilles
      const R = ete ? 0.3 : 0.12;
      $(".ch-ciel", el).setAttribute("fill", jour > 0 ? `rgb(${Math.round(lerp(60, 186, jour))},${Math.round(lerp(80, 226, jour))},${Math.round(lerp(130, 253, jour))})` : "#1e293b");
      $(".ch-astre", el).innerHTML = jour > 0 ? `<circle cx="${lerp(40, 380, (h - 5) / 17)}" cy="${120 - 90 * jour}" r="20" fill="#fde047"/>` : `<circle cx="340" cy="50" r="16" fill="#e2e8f0"/><circle cx="348" cy="44" r="14" fill="#1e293b"/>`;
      const tronc = `<path d="M196,232 C198,190 200,160 202,130 L218,130 C220,160 222,190 224,232 Z" fill="#6b3f1d"/>
        <path d="M210,150 L170,110 M212,140 L250,100 M210,130 L210,80 M175,115 L150,95 M248,104 L275,88" stroke="#6b3f1d" stroke-width="7" stroke-linecap="round"/>`;
      $(".ch-arbre", el).innerHTML = tronc + (ete ? `<circle cx="210" cy="90" r="58" fill="#16a34a"/><circle cx="160" cy="110" r="40" fill="#22c55e"/><circle cx="262" cy="108" r="42" fill="#15803d"/>` : "");
      const net = P - R;
      let f = "";
      if (ete && net > 0.02) {
        const l = 2 + 7 * net;
        f = fleche(250, 60, 320, 30, "o", l, "O₂ rejeté", 300, 70) + fleche(80, 60, 140, 85, "c", l, "CO₂ absorbé", 22, 50);
      } else if (ete) {
        f = fleche(320, 40, 255, 70, "o", 3, "O₂ absorbé", 300, 30) + fleche(140, 90, 70, 70, "c", 3, "CO₂ rejeté", 20, 62);
      } else {
        f = fleche(320, 190, 232, 200, "o", 2.5, "O₂ absorbé", 280, 180) + fleche(190, 200, 100, 186, "c", 2.5, "CO₂ rejeté", 40, 176)
          + `<text x="210" y="270" font-size="12" text-anchor="middle" fill="#fff">tronc et racines vivants : ils respirent</text>`;
      }
      $(".ch-fleches", el).innerHTML = f;
      $(".ch-j1", el).style.width = 100 * P + "%";
      $(".ch-j2", el).style.width = 100 * R / 0.3 * 0.35 + "%";
      const r = $(".retour", el);
      r.className = "retour";
      r.textContent = !ete ? "En hiver, le chêne n'a plus de feuilles : pas de photosynthèse. Mais ses cellules vivantes (tronc, racines) respirent jour et nuit."
        : net > 0.02 ? "Le jour, la feuille rejette du dioxygène : la photosynthèse est plus forte que la respiration… qui continue quand même !"
        : P > 0 ? "Peu de lumière : la photosynthèse ne compense pas la respiration."
        : "La nuit, pas de photosynthèse : seule la respiration fonctionne. La feuille absorbe du dioxygène et rejette du dioxyde de carbone.";
    }
    seg.addEventListener("change", maj);
    curseur.addEventListener("input", maj);
    maj();
  }

  /* ======================================================================
   * IV. MYCORHIZES
   * ==================================================================== */

  /* La pépinière : deux lots de 20 pins pendant 24 mois */
  function pepiniere(el) {
    const r = aleatoire(42);
    const lot = (hauteur, morts) => {
      const ordre = Nutri.melanger([...Array(20).keys()], hauteur);
      return Array.from({ length: 20 }, (_, i) => ({
        k: 0.8 + r() * 0.4,
        mort: ordre.indexOf(i) < morts ? 3 + r() * 20 : 99,
        hf: hauteur,
      }));
    };
    const lots = [lot(18, 16), lot(42, 3)];
    el.innerHTML = `<svg viewBox="0 0 420 260" class="dessin" role="img" aria-label="Deux lots de jeunes pins, sans et avec champignons mycorhiziens">
        <rect width="420" height="260" rx="14" fill="#f0f9ff"/>
        <rect x="0" y="170" width="420" height="90" fill="#a3825b"/>
        <line x1="210" y1="10" x2="210" y2="255" stroke="#fff" stroke-width="4"/>
        <text x="105" y="22" font-size="13" font-weight="700" text-anchor="middle" fill="#334155">Sans mycorhizes</text>
        <text x="315" y="22" font-size="13" font-weight="700" text-anchor="middle" fill="#334155">Avec mycorhizes</text>
        <g class="pp-pins"></g>
      </svg>
      <p class="petit" style="text-align:center">En blanc dans le sol : les filaments du champignon autour des racines.</p>
      <div class="reglage"><span>Temps</span><input type="range" min="0" max="24" step="1" value="0" aria-label="Mois écoulés"><b class="pp-m">0 mois</b>
        <button class="btn btn-principal pp-lancer" type="button">▶ 2 ans</button></div>
      <div class="defile"><table class="tableau"><thead><tr><th></th><th>Sans mycorhizes</th><th>Avec mycorhizes</th></tr></thead>
        <tbody><tr><td>Hauteur moyenne</td><td class="pp-h0"></td><td class="pp-h1"></td></tr><tr><td>Pins vivants</td><td class="pp-v0"></td><td class="pp-v1"></td></tr></tbody></table></div>`;
    const curseur = $("input", el);
    function pin(x, sol, h, mort) {
      const px = h * 2.6;
      const c = mort ? "#a16207" : "#166534";
      const etages = Math.max(1, Math.round(px / 14));
      let s = `<line x1="${x}" y1="${sol}" x2="${x}" y2="${sol - px}" stroke="#78350f" stroke-width="2"/>`;
      for (let i = 0; i < etages; i++) {
        const y = sol - px + i * (px / etages);
        const w = 2 + (i + 1) / etages * (3 + px * 0.09);
        s += `<path d="M${x},${y - 2} L${x - w},${y + px / etages + 2} L${x + w},${y + px / etages + 2} Z" fill="${c}"/>`;
      }
      return mort ? `<g transform="rotate(25 ${x} ${sol})" opacity=".8">${s}</g>` : s;
    }
    function maj() {
      const m = +curseur.value;
      $(".pp-m", el).textContent = m + " mois";
      let s = "";
      lots.forEach((l, j) => {
        let somme = 0, vivants = 0;
        l.forEach((p, i) => {
          const mort = m >= p.mort;
          const h = 3 + (p.hf - 3) * Math.min(m, p.mort) / 24 * p.k;
          const x = 20 + j * 210 + (i % 10) * 18.5 + (i >= 10 ? 9 : 0);
          const sol = i >= 10 ? 210 : 175;
          s += pin(x, sol, h, mort);
          if (!mort) { somme += h; vivants++; }
        });
        if (j === 1) for (let k = 0; k < 14; k++) s += `<path d="M${222 + k * 13},${180 + (k % 3) * 22} q8,10 3,22 q-6,10 4,22" stroke="#fef3c7" stroke-width="1.6" fill="none" opacity=".9"/>`;
        $(".pp-h" + j, el).textContent = vivants ? fmt(somme / vivants, 0) + " cm" : "–";
        $(".pp-v" + j, el).textContent = `${vivants} / 20 (${vivants * 5} %)`;
      });
      $(".pp-pins", el).innerHTML = s;
    }
    curseur.addEventListener("input", maj);
    $(".pp-lancer", el).addEventListener("click", () => animer(el, 4000, (p) => { curseur.value = Math.round(24 * p); maj(); }));
    maj();
  }

  /* Les échanges dans une mycorhize : particules animées */
  function echanges(el) {
    const hyphes = [
      "M180,110 C150,140 120,150 70,200 C50,220 30,230 14,250",
      "M210,112 C215,150 190,190 200,250",
      "M240,110 C280,150 320,150 380,200 C395,215 405,230 410,250",
      "M200,72 C170,40 120,40 60,20",
      "M250,72 C290,40 340,50 400,30",
      "M160,96 C110,96 80,110 20,120",
    ];
    el.innerHTML = `<div class="deux-col">
      <svg viewBox="0 0 420 270" class="dessin" role="img" aria-label="Une racine de pin entourée par les filaments d'un champignon, et les échanges entre eux">
        <rect width="420" height="270" rx="14" fill="#9c7a54"/>
        <g class="ec-sol"></g>
        <g class="ec-hyphes">${hyphes.map((d) => `<path d="${d}" stroke="#fdf6e3" stroke-width="3.2" fill="none" stroke-linecap="round"/>`).join("")}</g>
        <rect x="120" y="76" width="200" height="32" rx="16" fill="#d4a373" stroke="#7c4a1e" stroke-width="2"/>
        <rect x="104" y="72" width="232" height="40" rx="20" fill="none" stroke="#fdf6e3" stroke-width="4" stroke-dasharray="7 4" class="ec-manchon"/>
        <path d="M120,92 H40" stroke="#d4a373" stroke-width="20" stroke-linecap="round"/>
        <text x="220" y="97" font-size="12" font-weight="700" text-anchor="middle" fill="#5b3412">racine du pin</text>
        <g class="ec-particules"></g>
      </svg>
      <div>
        <p class="legende" style="display:flex;flex-direction:column;gap:4px;margin:0 0 8px">
          <span><span style="color:var(--o2);font-size:1.2em">●</span> eau et sels minéraux : du champignon vers le pin</span>
          <span><span style="color:var(--glucide);font-size:1.2em">●</span> glucides (sucres) : du pin vers le champignon</span>
          <span><span style="color:#fdf6e3;background:#9c7a54;padding:0 4px;border-radius:4px">〰</span> filaments (hyphes) du champignon</span></p>
        <label class="reglage"><input type="checkbox" class="ec-nuit"> Mettre le pin à l'obscurité longtemps</label>
        <label class="reglage"><input type="checkbox" class="ec-sans"> Retirer le champignon</label>
        <p class="retour" aria-live="polite"></p>
      </div></div>`;
    const svg = $("svg", el);
    const chemins = $$(".ec-hyphes path", el);
    const L = chemins.map((p) => p.getTotalLength());
    const groupe = $(".ec-particules", el);
    const r = aleatoire(5);
    $(".ec-sol", el).innerHTML = Array.from({ length: 50 }, () => `<circle cx="${r() * 420}" cy="${r() * 270}" r="${2 + r() * 5}" fill="#8a6a45"/>`).join("");
    const parts = [];
    let reste = [0, 0];
    let faim = 0; // le champignon privé de glucides s'affaiblit
    const nuit = $(".ec-nuit", el), sans = $(".ec-sans", el);
    function texte() {
      const ret = $(".retour", el);
      $(".ec-hyphes", el).style.display = $(".ec-manchon", el).style.display = sans.checked ? "none" : "";
      if (sans.checked) { ret.className = "retour ko"; ret.textContent = "Sans champignon, la racine seule explore peu de sol : le pin reçoit beaucoup moins d'eau et de sels minéraux. Il pousse moins bien."; }
      else if (nuit.checked) { ret.className = "retour ko"; ret.textContent = "À l'obscurité, le pin ne fait plus de photosynthèse : il ne fabrique plus de glucides et n'en donne plus au champignon, qui s'affaiblit."; }
      else { ret.className = "retour ok"; ret.textContent = "Chacun donne à l'autre ce qui lui manque : c'est un échange gagnant-gagnant (mutualisme)."; }
    }
    [nuit, sans].forEach((c) => c.addEventListener("change", texte));
    texte();
    boucle(el, (dt) => {
      faim = borne(faim + (nuit.checked ? dt / 6 : -dt / 2), 0, 1);
      if (!sans.checked) $(".ec-hyphes", el).style.opacity = 1 - 0.65 * faim;
      const debitSels = sans.checked ? 0.6 : 4 * (1 - 0.7 * faim);
      const debitGluc = nuit.checked || sans.checked ? 0 : 3;
      reste[0] += debitSels * dt;
      reste[1] += debitGluc * dt;
      [0, 1].forEach((k) => {
        while (reste[k] >= 1) {
          reste[k] -= 1;
          const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          c.setAttribute("r", 4);
          c.setAttribute("fill", k ? "var(--glucide)" : "var(--o2)");
          c.setAttribute("stroke", "#fff");
          groupe.append(c);
          const i = sans.checked ? -1 : Math.floor(r() * chemins.length);
          parts.push({ c, i, k, p: 0, v: 0.22 + r() * 0.1, x0: 30 + r() * 60, y0: 120 + r() * 60 });
        }
      });
      for (let j = parts.length - 1; j >= 0; j--) {
        const q = parts[j];
        q.p += q.v * dt;
        if (q.p >= 1) { q.c.remove(); parts.splice(j, 1); continue; }
        let x, y;
        if (q.i < 0) { x = lerp(q.x0, 70, q.p); y = lerp(q.y0, 96, q.p); }
        else {
          const t = q.k ? q.p : 1 - q.p; // sels : du bout de l'hyphe vers la racine
          const pt = chemins[q.i].getPointAtLength(t * L[q.i]);
          x = pt.x; y = pt.y;
        }
        q.c.setAttribute("cx", x);
        q.c.setAttribute("cy", y);
      }
    });
    return svg;
  }

  /* Les lichens autour d'une zone industrielle */
  function lichens(el) {
    const donnees = [["moins de 1 km", 0], ["1 à 3 km", 2], ["3 à 5 km", 8], ["plus de 5 km", 23]];
    const r = aleatoire(11);
    const taches = Array.from({ length: 23 }, (_, i) => ({ x: 150 + r() * 120, y: 30 + r() * 200, rx: 6 + r() * 9, c: ["#a3e635", "#facc15", "#94a3b8", "#86efac", "#fb923c", "#d9f99d"][i % 6] }));
    el.innerHTML = `<div class="deux-col">
      <svg viewBox="0 0 420 260" class="dessin graphe" role="img" aria-label="Graphique : nombre d'espèces de lichens selon la distance à une zone industrielle">
        <g class="li-axes"></g><g class="li-barres"></g>
      </svg>
      <div>
        <svg viewBox="0 0 420 260" class="dessin" role="img" aria-label="Tronc d'arbre couvert de lichens">
          <rect width="420" height="260" rx="14" fill="#e0f2fe"/><rect x="140" y="0" width="140" height="260" fill="#8b6b4a"/>
          <path d="M160,0 v260 M200,0 v260 M245,0 v260" stroke="#6f5338" stroke-width="3"/><g class="li-taches"></g>
          <text class="li-usine" x="60" y="240" font-size="34"></text>
        </svg>
        <div class="reglage"><span>Distance de l'usine</span><input type="range" min="0" max="3" step="1" value="3" aria-label="Distance de la zone industrielle"><b class="li-d"></b></div>
      </div></div>`;
    const { sx, sy } = graphe($(".li-axes", el), { x0: 46, x1: 404, y0: 220, y1: 24, X: [0, 4, 4, ""], Y: [0, 25, 5, "espèces"] });
    $$(".li-axes text", el).forEach((t) => { if (/^[04]$/.test(t.textContent)) t.remove(); });
    const curseur = $("input", el);
    function maj() {
      const k = +curseur.value;
      $(".li-d", el).textContent = donnees[k][0];
      $(".li-barres", el).innerHTML = donnees.map(([d, n], i) => {
        const x = sx(i + 0.5);
        return `<rect x="${x - 30}" y="${sy(n)}" width="60" height="${sy(0) - sy(n)}" rx="4" fill="${i === k ? "#65a30d" : "#bef264"}"/>
          <text x="${x}" y="${sy(n) - 5}" text-anchor="middle" font-weight="700">${n}</text><text x="${x}" y="238" text-anchor="middle">${d}</text>`;
      }).join("") + `<text x="225" y="256" text-anchor="middle">distance de la zone industrielle</text>`;
      $(".li-taches", el).innerHTML = taches.slice(0, donnees[k][1]).map((t) => `<ellipse cx="${t.x}" cy="${t.y}" rx="${t.rx}" ry="${t.rx * 0.7}" fill="${t.c}" stroke="#4d7c0f" stroke-width="1"/>`).join("");
      $(".li-usine", el).textContent = k === 0 ? "🏭" : "";
    }
    curseur.addEventListener("input", maj);
    maj();
  }

  /* ======================================================================
   * Laboratoire des gaz (atelier) : prévoir puis mesurer
   * ==================================================================== */
  const ETRES = {
    plante: { nom: "Plante verte", emoji: "🌱", photo: 1, resp: 0.25 },
    champignon: { nom: "Champignon (moisissure)", emoji: "🍄", photo: 0, resp: 0.35 },
    graines: { nom: "Graines germées", emoji: "🫘", photo: 0, resp: 0.4 },
    escargot: { nom: "Escargot", emoji: "🐌", photo: 0, resp: 0.45 },
  };
  function variation(etre, lumiere) {
    const e = ETRES[etre];
    return (lumiere ? e.photo : 0) - e.resp; // > 0 : le dioxygène augmente
  }

  return { vanHelmont, elodee, cellule, equationPhoto, reseau, recyclage, cloche, chene, pepiniere, echanges, lichens, graphe, segment, valeur, animer, ETRES, variation, fmt };
})();
