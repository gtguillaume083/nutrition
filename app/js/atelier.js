/* Atelier : des missions à refaire librement, avec un score.
 * Les meilleurs scores sont gardés dans le navigateur et entrent dans le code de rendu. */
(function () {
  "use strict";
  const { $, $$, memoire, melanger } = Nutri;

  let missions = memoire.lire("missions"); // { reseau: { fait: 2, meilleur: 9, sur: 10 }, ... }
  function noter(id, score, sur) {
    const m = missions[id] || { fait: 0, meilleur: 0, sur };
    m.fait++;
    m.sur = sur;
    m.meilleur = Math.max(m.meilleur, score);
    missions[id] = m;
    memoire.ecrire("missions", missions);
  }
  const note = (score, sur) => `<div class="score"><b>${score} / ${sur}</b><span>${score === sur ? "Parfait ! 🏆" : score >= sur * 0.7 ? "Très bien !" : score >= sur / 2 ? "C'est un bon début." : "Recommence pour t'améliorer."}</span></div>`;

  /* ---------- 1. réseaux trophiques ---------- */
  const ECOSYSTEMES = {
    mare: {
      nom: "La mare", h: 330,
      doc: ["Les algues sont mangées par les daphnies (petits crustacés) et par les têtards.", "Les daphnies et les têtards sont mangés par les gardons (poissons).", "Les gardons sont mangés par le brochet et par le héron.", "Le héron mange aussi des têtards."],
      noeuds: [
        { id: "algues", nom: "Algues", emoji: "🌿", x: 210, y: 292, r: "p" },
        { id: "daphnie", nom: "Daphnie", emoji: "🦐", x: 100, y: 200, r: "c1" },
        { id: "tetard", nom: "Têtard", emoji: "🐸", x: 320, y: 200, r: "c1" },
        { id: "gardon", nom: "Gardon", emoji: "🐟", x: 150, y: 110, r: "c2" },
        { id: "brochet", nom: "Brochet", emoji: "🐠", x: 80, y: 32, r: "c2" },
        { id: "heron", nom: "Héron", emoji: "🐦", x: 330, y: 40, r: "c2" },
      ],
      liens: [["algues", "daphnie"], ["algues", "tetard"], ["daphnie", "gardon"], ["tetard", "gardon"], ["gardon", "brochet"], ["gardon", "heron"], ["tetard", "heron"]],
    },
    prairie: {
      nom: "La prairie", h: 330,
      doc: ["L'herbe est mangée par la sauterelle et par le lapin.", "La sauterelle est mangée par la musaraigne.", "Le lapin est mangé par le renard et par la buse.", "La musaraigne est mangée par le renard et par la buse."],
      noeuds: [
        { id: "herbe", nom: "Herbe", emoji: "🌾", x: 210, y: 292, r: "p" },
        { id: "sauterelle", nom: "Sauterelle", emoji: "🦗", x: 90, y: 196, r: "c1" },
        { id: "lapin", nom: "Lapin", emoji: "🐇", x: 330, y: 196, r: "c1" },
        { id: "musaraigne", nom: "Musaraigne", emoji: "🐭", x: 90, y: 100, r: "c2" },
        { id: "renard", nom: "Renard", emoji: "🦊", x: 330, y: 40, r: "c2" },
        { id: "buse", nom: "Buse", emoji: "🦅", x: 170, y: 32, r: "c2" },
      ],
      liens: [["herbe", "sauterelle"], ["herbe", "lapin"], ["sauterelle", "musaraigne"], ["lapin", "renard"], ["lapin", "buse"], ["musaraigne", "renard"], ["musaraigne", "buse"]],
    },
  };
  const ROLES = [
    { id: "p", titre: "Producteur" }, { id: "c1", titre: "Consommateur primaire" }, { id: "c2", titre: "Consommateur secondaire" },
  ];

  function missionReseau(el) {
    el.innerHTML = `<p>Choisis un écosystème, lis le document, puis construis son réseau trophique.</p>
      <div class="commandes">${Object.entries(ECOSYSTEMES).map(([k, e]) => `<button class="btn eco" type="button" data-e="${k}">${e.nom}</button>`).join("")}</div>
      <div class="m-zone"></div>`;
    $$(".eco", el).forEach((b) => b.addEventListener("click", () => {
      $$(".eco", el).forEach((x) => x.classList.toggle("actif", x === b));
      const e = ECOSYSTEMES[b.dataset.e];
      const zone = $(".m-zone", el);
      zone.innerHTML = `<div class="doc"><div class="doc-titre">${e.nom}</div><ul>${e.doc.map((d) => `<li>${d}</li>`).join("")}</ul></div>
        <div class="m-reseau"></div><div class="m-roles" hidden></div><div class="m-score"></div>`;
      Exp.reseau($(".m-reseau", zone), {
        h: e.h, noeuds: e.noeuds, liens: e.liens,
        surFin: ({ essais }) => {
          const roles = $(".m-roles", zone);
          roles.hidden = false;
          roles.insertAdjacentHTML("beforebegin", `<h3 style="margin-top:18px">Et maintenant, le rôle de chacun</h3>`);
          Nutri.tri(roles, {
            consigne: "Range chaque être vivant selon son rôle dans le réseau.",
            categories: ROLES,
            items: e.noeuds.map((n) => ({ t: n.emoji + " " + n.nom, c: n.r, aide: n.r === "p" ? "Il fait la photosynthèse." : "Regarde ce qu'il mange dans ton réseau." })),
            surFin: ({ erreurs }) => {
              const score = Math.max(0, 10 - 2 * (essais - 1) - erreurs);
              noter("reseau", score, 10);
              $(".m-score", zone).innerHTML = note(score, 10) + `<p class="petit">Réseau juste en ${essais} essai${essais > 1 ? "s" : ""}, ${erreurs} erreur${erreurs > 1 ? "s" : ""} de classement. Essaie l'autre écosystème !</p>`;
            },
          });
          roles.scrollIntoView({ behavior: "smooth", block: "center" });
        },
      });
    }));
  }

  /* ---------- 2. laboratoire des gaz ---------- */
  const DEFIS = [
    { etres: ["plante"], lumiere: true },
    { etres: ["plante"], lumiere: false },
    { etres: ["champignon"], lumiere: true },
    { etres: ["graines"], lumiere: false },
    { etres: ["escargot"], lumiere: true },
    { etres: ["plante", "escargot"], lumiere: true },
    { etres: [], lumiere: true },
  ];
  function missionGaz(el) {
    const defis = melanger(DEFIS, Date.now() & 0xffff).slice(0, 6);
    let i = 0, score = 0;
    function evolution(d) {
      if (!d.etres.length) return 0;
      return d.etres.reduce((s, e) => s + (d.lumiere ? Exp.ETRES[e].photo : 0) - Exp.ETRES[e].resp, 0);
    }
    function sens(v) { return v > 0.01 ? "aug" : v < -0.01 ? "dim" : "sta"; }
    function explication(d) {
      if (!d.etres.length) return "Flacon sans être vivant : rien ne change. C'est le témoin.";
      const plante = d.etres.includes("plante");
      if (plante && d.lumiere) return d.etres.length > 1 ? "À la lumière, la photosynthèse de la plante produit plus de dioxygène que la plante et l'escargot n'en consomment en respirant." : "À la lumière, la photosynthèse produit plus de dioxygène que la respiration n'en consomme.";
      if (plante) return "À l'obscurité, pas de photosynthèse : la plante ne fait que respirer, elle consomme du dioxygène.";
      if (d.etres.includes("champignon")) return "Même à la lumière, un champignon ne fait pas de photosynthèse : il respire, donc il consomme du dioxygène.";
      return "Cet être vivant respire : il consomme du dioxygène et rejette du dioxyde de carbone, qu'il y ait de la lumière ou non.";
    }
    function afficher() {
      const d = defis[i];
      el.innerHTML = `<p class="petit">Défi ${i + 1} sur ${defis.length} · score : ${score}</p>
        <div class="deux-col">
          <svg viewBox="0 0 300 220" class="dessin" role="img" aria-label="Une cloche fermée">
            <rect width="300" height="220" rx="14" fill="${d.lumiere ? "#fefce8" : "#334155"}"/>
            ${d.lumiere ? '<circle cx="40" cy="40" r="22" fill="#fde047"/>' : '<text x="40" y="48" font-size="24" text-anchor="middle">🌙</text>'}
            <path d="M80,190 V100 C80,40 220,40 220,100 V190 Z" fill="#e0f2fe" fill-opacity=".6" stroke="#64748b" stroke-width="3"/>
            <rect x="60" y="190" width="180" height="10" rx="3" fill="#64748b"/>
            <text x="150" y="${d.etres.length > 1 ? 160 : 165}" font-size="${d.etres.length > 1 ? 38 : 50}" text-anchor="middle">${d.etres.map((e) => Exp.ETRES[e].emoji).join(" ") || "∅"}</text>
          </svg>
          <div>
            <h3>${d.etres.map((e) => Exp.ETRES[e].nom).join(" + ") || "Flacon vide"}, ${d.lumiere ? "à la lumière" : "à l'obscurité"}</h3>
            <p>Pendant 12 h, la quantité de <b>dioxygène</b> dans la cloche va…</p>
            <div class="commandes"><button class="btn" data-p="aug" type="button">augmenter</button><button class="btn" data-p="dim" type="button">diminuer</button><button class="btn" data-p="sta" type="button">rester stable</button></div>
            <div class="m-res"></div>
          </div></div>`;
      $$("[data-p]", el).forEach((b) => b.addEventListener("click", () => {
        $$("[data-p]", el).forEach((x) => (x.disabled = true));
        b.classList.add("actif");
        const v = evolution(d);
        const ok = b.dataset.p === sens(v);
        if (ok) score++;
        const res = $(".m-res", el);
        res.innerHTML = `<svg viewBox="0 0 300 150" class="dessin graphe"><g class="ax"></g><path class="courbe" stroke="var(--o2)"/></svg>
          <p class="retour ${ok ? "ok" : "ko"}">${ok ? "Bonne prévision ! " : "Ce n'est pas ce qui se passe. "}${explication(d)}</p>
          <button class="btn btn-principal m-suite" type="button">${i + 1 < defis.length ? "Défi suivant →" : "Voir mon score"}</button>`;
        const { sx, sy } = Exp.graphe($(".ax", res), { x0: 40, x1: 290, y0: 125, y1: 14, X: [0, 12, 3, "temps (h)"], Y: [15, 25, 5, "O₂ %"] });
        Exp.animer(el, 1500, (p) => {
          let s = "";
          for (let t = 0; t <= 12 * p; t += 0.25) s += (s ? "L" : "M") + sx(t).toFixed(1) + "," + sy(21 + v * 4 * t / 12).toFixed(1);
          $(".courbe", res).setAttribute("d", s);
        });
        $(".m-suite", res).addEventListener("click", () => {
          i++;
          if (i < defis.length) afficher();
          else {
            noter("gaz", score, defis.length);
            el.innerHTML = note(score, defis.length) + `<p>À retenir : <b>tous les êtres vivants respirent</b> (ils consomment du dioxygène). Seuls les végétaux chlorophylliens, <b>à la lumière</b>, en produisent par photosynthèse.</p><button class="btn btn-principal" type="button">Recommencer</button>`;
            $("button", el).addEventListener("click", () => missionGaz(el));
          }
        });
      }));
    }
    afficher();
  }

  /* ---------- 3. autotrophe ou hétérotrophe ---------- */
  function missionTri(el) {
    const items = [
      ["🌳 Chêne", "a"], ["🌻 Tournesol", "a"], ["🌿 Mousse", "a"], ["🟢 Algue verte", "a"], ["🌾 Blé", "a"], ["🌲 Pin", "a"],
      ["🍄 Cèpe", "h"], ["🍞 Levure", "h"], ["🦠 Bactérie du sol", "h"], ["🐌 Escargot", "h"], ["🐄 Vache", "h"], ["🧍 Être humain", "h"], ["🟫 Moisissure", "h"], ["🪱 Ver de terre", "h"],
    ].map(([t, c]) => ({ t, c, aide: c === "a" ? "Il possède de la chlorophylle : il fabrique sa matière organique à partir de matière minérale, par photosynthèse." : "Il ne fait pas de photosynthèse : il a besoin de matière organique pour fabriquer la sienne." }));
    const debut = Date.now();
    Nutri.tri(el, {
      consigne: "Range chaque être vivant le plus vite possible, sans te tromper.",
      categories: [{ id: "a", titre: "Autotrophe", sous: "fabrique sa matière à partir de matière minérale" }, { id: "h", titre: "Hétérotrophe", sous: "a besoin de matière organique pour fabriquer la sienne" }],
      items,
      graine: debut & 0xffff,
      surFin: ({ erreurs }) => {
        const s = Math.round((Date.now() - debut) / 1000);
        const score = Math.max(0, 10 - erreurs - (s > 60 ? 1 : 0));
        noter("tri", score, 10);
        el.insertAdjacentHTML("beforeend", note(score, 10) + `<p class="petit">Temps : ${s} s. Piège classique : un champignon n'est pas une plante, il est hétérotrophe !</p><button class="btn btn-principal m-re" type="button">Recommencer</button>`);
        $(".m-re", el).addEventListener("click", () => missionTri(el));
      },
    });
  }

  /* ---------- 4. défi bilan : 10 questions ---------- */
  const BANQUE = [
    ["La photosynthèse a lieu…", ["dans les chloroplastes", "dans le noyau", "dans les racines"], 0],
    ["La photosynthèse rejette…", ["du dioxygène", "du dioxyde de carbone", "des sels minéraux"], 0],
    ["La respiration rejette…", ["du dioxygène", "du dioxyde de carbone"], 1],
    ["Une plante respire…", ["seulement la nuit", "jour et nuit", "jamais"], 1],
    ["La masse d'un arbre vient surtout…", ["de la terre", "du dioxyde de carbone de l'air", "des engrais"], 1],
    ["Un champignon est…", ["autotrophe", "hétérotrophe"], 1],
    ["Les décomposeurs transforment la matière morte en…", ["sels minéraux", "dioxygène", "chlorophylle"], 0],
    ["Dans « herbe → lapin → renard », le producteur est…", ["l'herbe", "le lapin", "le renard"], 0],
    ["Dans « herbe → lapin → renard », le renard est…", ["un consommateur primaire", "un consommateur secondaire", "un décomposeur"], 1],
    ["L'eau de chaux se trouble en présence de…", ["dioxygène", "dioxyde de carbone", "lumière"], 1],
    ["Une graine qui germe obtient son énergie grâce à…", ["la photosynthèse", "la respiration de ses réserves"], 1],
    ["Le pigment vert des plantes s'appelle…", ["la chlorophylle", "le mycélium", "l'amidon"], 0],
    ["Une mycorhize associe…", ["un champignon et une racine", "une algue et un champignon", "deux plantes"], 0],
    ["Dans une mycorhize, le champignon reçoit…", ["des glucides", "des sels minéraux", "de la lumière"], 0],
    ["Dans une mycorhize, la plante reçoit…", ["de l'eau et des sels minéraux", "des glucides", "du dioxyde de carbone"], 0],
    ["Le gui sur un chêne est un exemple de…", ["mutualisme", "parasitisme", "commensalisme"], 1],
    ["Un lichen associe…", ["un champignon et une algue", "une mousse et un arbre"], 0],
    ["Pourquoi utiliser des graines mortes dans une expérience ?", ["C'est le témoin, pour comparer", "Pour aller plus vite"], 0],
    ["Sans lumière, une plante verte…", ["fait plus de photosynthèse", "ne fait plus de photosynthèse mais respire"], 1],
    ["Qui est un producteur ?", ["L'algue verte", "Le cèpe", "La limace"], 0],
  ];
  function missionQuiz(el) {
    const liste = melanger(BANQUE, Date.now() & 0xffff).slice(0, 10);
    let i = 0, score = 0;
    function afficher() {
      const [q, opts, bonne] = liste[i];
      el.innerHTML = `<p class="petit">Question ${i + 1} sur 10 · score : ${score}</p>
        <div class="p-barre" style="max-width:none;margin-bottom:12px"><div style="height:100%;width:${i * 10}%;background:var(--primaire);border-radius:99px"></div></div>
        <div class="qcm"><p class="qcm-q">${q}</p><div class="qcm-options" style="margin-left:0">${opts.map((o, j) => `<button class="qcm-opt" type="button" data-j="${j}">${o}</button>`).join("")}</div><p class="qcm-retour" style="margin-left:0"></p></div>`;
      $$(".qcm-opt", el).forEach((b) => b.addEventListener("click", () => {
        const ok = +b.dataset.j === bonne;
        if (ok) score++;
        $$(".qcm-opt", el).forEach((x) => { x.disabled = true; if (+x.dataset.j === bonne) x.classList.add("juste"); });
        if (!ok) b.classList.add("faux");
        const r = $(".qcm-retour", el);
        r.className = "qcm-retour " + (ok ? "ok" : "ko");
        r.innerHTML = (ok ? "<b>Oui !</b>" : "<b>Non.</b> La bonne réponse est surlignée.") + ` <button class="btn btn-principal" type="button" style="margin-left:8px">${i < 9 ? "Suivante →" : "Mon score"}</button>`;
        $("button", r).addEventListener("click", () => {
          i++;
          if (i < 10) afficher();
          else {
            noter("quiz", score, 10);
            el.innerHTML = note(score, 10) + `<p class="petit">Les questions changent à chaque partie.</p><button class="btn btn-principal" type="button">Rejouer</button>`;
            $("button", el).addEventListener("click", () => missionQuiz(el));
          }
        });
      }));
    }
    afficher();
  }

  const MISSIONS = [
    { id: "reseau", titre: "Construis un réseau trophique", texte: "Une mare, une prairie : lis le document, trace les flèches « est mangé par », puis classe chacun selon son rôle.", icone: "🕸️", ic: "ic-1", niveau: "Séance II", faire: missionReseau },
    { id: "gaz", titre: "Le laboratoire des gaz", texte: "Plante, champignon, escargot, à la lumière ou à l'obscurité : prévois si le dioxygène va augmenter ou diminuer, puis mesure.", icone: "🧪", ic: "ic-2", niveau: "Séances I et III", faire: missionGaz },
    { id: "tri", titre: "Autotrophe ou hétérotrophe ?", texte: "Classe 14 êtres vivants le plus vite possible. Attention aux pièges !", icone: "⚖️", ic: "ic-3", niveau: "Séances I et II", faire: missionTri },
    { id: "quiz", titre: "Défi bilan : 10 questions", texte: "Des questions tirées au hasard sur toute la séquence. Vise le 10 / 10 !", icone: "🏆", ic: "ic-4", niveau: "Tout le parcours", faire: missionQuiz },
  ];

  function rendreListe(main) {
    main.innerHTML = `<header class="p-hero"><h1>L'atelier</h1><p class="intro">Des missions à refaire autant que tu veux pour t'entraîner. Ton meilleur score est gardé sur cet appareil et apparaît dans ton code de rendu.</p></header>
      <div class="cartes">${MISSIONS.map((m) => {
        const r = missions[m.id];
        return `<a class="carte" href="#${m.id}"><span class="carte-haut"><span class="carte-icone ${m.ic}" aria-hidden="true">${m.icone}</span><span class="niveau${r ? " fait" : ""}">${r ? `Meilleur : ${r.meilleur} / ${r.sur}` : m.niveau}</span></span>
          <span class="carte-titre">${m.titre}</span><span class="carte-texte">${m.texte}</span><span class="carte-go">Commencer →</span></a>`;
      }).join("")}</div>`;
  }

  function router() {
    const main = $("#chapitre");
    const m = MISSIONS.find((x) => x.id === location.hash.slice(1));
    if (!m) rendreListe(main);
    else {
      main.innerHTML = `<article class="chap mission-page"><p class="chap-num">Atelier · ${m.niveau}</p><h1>${m.icone} ${m.titre}</h1>
        <section class="bloc bloc-experimente"><div class="mission"></div></section>
        <nav class="chap-nav"><a class="btn" href="#">← Toutes les missions</a></nav></article>`;
      m.faire($(".mission", main));
    }
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }

  $("#p-rendre").addEventListener("click", Nutri.boiteRendu);
  Nutri.modeEleve();
  window.addEventListener("hashchange", router);
  router();
})();
