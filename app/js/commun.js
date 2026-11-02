/* Nutrition — outils communs aux trois pages (accueil, parcours, atelier).
 *
 * - mémoire facultative dans le navigateur (rien n'est envoyé en ligne) ;
 * - glisser-déposer (souris et doigt) ou « toucher puis toucher » ;
 * - textes à trous et tris en colonnes ;
 * - bilan de l'élève : un code court qui contient tout, et un fichier qui porte ce code.
 */
window.Nutri = (function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- mémoire (facultative : navigation privée possible) ---------- */
  const memoire = {
    lire(cle, defaut = {}) {
      try { return JSON.parse(localStorage.getItem("nutrition." + cle)) || defaut; } catch (e) { return defaut; }
    },
    ecrire(cle, v) {
      try { localStorage.setItem("nutrition." + cle, JSON.stringify(v)); } catch (e) { /* navigation privée */ }
    },
  };

  /* ---------- hasard reproductible (mulberry32) ---------- */
  function aleatoire(graine) {
    let a = graine >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function melanger(liste, graine) {
    const r = aleatoire(graine);
    const l = liste.slice();
    for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
    return l;
  }

  /* ---------- mode élève ----------
   * Un élève qui arrive par le lien de son enseignant ne voit pas la partie
   * enseignant, pendant toute sa visite (sessionStorage). */
  function modeEleve() {
    let eleve = new URLSearchParams(location.search).has("seance");
    try {
      if (eleve) sessionStorage.setItem("nutrition.eleve", "1");
      eleve = eleve || sessionStorage.getItem("nutrition.eleve") === "1";
    } catch (e) { /* stockage bloqué */ }
    if (eleve) document.documentElement.classList.add("mode-eleve");
    return eleve;
  }

  /* ---------- glisser-déposer ----------
   * selMot : ce qu'on déplace ; selCible : où on le dépose.
   * essayer(cible, mot) renvoie true si c'est juste (sinon tout secoue). */
  function glisser(zone, selMot, selCible, essayer) {
    let choisi = null;
    let g = null;
    function choisir(m) {
      $$(selMot + ".choisi", zone).forEach((x) => x.classList.remove("choisi"));
      choisi = m;
      if (m) m.classList.add("choisi");
    }
    function tenter(cible, m) {
      if (!cible || !m) return;
      const ok = essayer(cible, m);
      if (!ok) {
        cible.classList.add("erreur");
        m.classList.add("erreur");
        setTimeout(() => { cible.classList.remove("erreur"); m.classList.remove("erreur"); }, 450);
      }
      choisir(null);
    }
    const sous = (e) => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && zone.contains(el) ? el.closest(selCible) : null; };
    zone.addEventListener("pointerdown", (e) => {
      const m = e.target.closest(selMot);
      if (!m || e.button > 0) return;
      e.preventDefault();
      g = { m, x0: e.clientX, y0: e.clientY, f: null };
      try { m.setPointerCapture(e.pointerId); } catch (err) { /* pointeur déjà relâché */ }
    });
    zone.addEventListener("pointermove", (e) => {
      if (!g) return;
      if (!g.f && Math.hypot(e.clientX - g.x0, e.clientY - g.y0) > 6) {
        g.f = g.m.cloneNode(true);
        g.f.classList.add("fantome");
        g.f.classList.remove("choisi");
        document.body.append(g.f);
        g.m.classList.add("en-cours");
      }
      if (g.f) {
        g.f.style.left = e.clientX + "px";
        g.f.style.top = e.clientY + "px";
        $$(".survol", zone).forEach((t) => t.classList.remove("survol"));
        const c = sous(e);
        if (c) c.classList.add("survol");
      }
    });
    zone.addEventListener("pointerup", (e) => {
      if (!g) return;
      const { m, f } = g;
      g = null;
      if (f) {
        f.remove();
        m.classList.remove("en-cours");
        $$(".survol", zone).forEach((t) => t.classList.remove("survol"));
        tenter(sous(e), m);
      } else {
        choisir(choisi === m ? null : m);
      }
    });
    zone.addEventListener("pointercancel", () => {
      if (g && g.f) { g.f.remove(); g.m.classList.remove("en-cours"); }
      g = null;
    });
    zone.addEventListener("click", (e) => {
      const m = e.target.closest(selMot);
      if (m && e.detail === 0) { choisir(choisi === m ? null : m); return; } // clavier
      const c = e.target.closest(selCible);
      if (c && choisi) tenter(c, choisi);
    });
    zone.addEventListener("keydown", (e) => {
      const c = e.target.closest(selCible);
      if (c && choisi && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); tenter(c, choisi); }
    });
    return { choisir };
  }

  /* ---------- texte à trous ----------
   * Les mots en gras du modèle deviennent des trous. Un mot <b data-groupe="x">
   * accepte n'importe quel mot du même groupe (ex. l'ordre des réactifs). */
  function trous(zone, o) {
    const modele = document.createElement("div");
    modele.innerHTML = o.html;
    const mots = [];
    $$("b", modele).forEach((b) => {
      const t = document.createElement("span");
      t.className = "trou";
      t.dataset.mot = b.textContent;
      if (b.dataset.groupe) t.dataset.groupe = b.dataset.groupe;
      t.setAttribute("role", "button");
      t.setAttribute("aria-label", "Trou à compléter");
      t.tabIndex = 0;
      b.replaceWith(t);
      mots.push({ t: b.textContent, g: b.dataset.groupe || "" });
    });
    (o.pieges || []).forEach((p) => mots.push({ t: p, g: "piege" }));
    const banque = melanger(mots, o.graine || mots.length * 31);
    zone.classList.add("a-trous");
    zone.innerHTML = `<p class="retiens-consigne">${o.consigne || "Complète : glisse chaque mot dans le bon trou (ou touche un mot, puis un trou)."}</p>
      <div class="banque">${banque.map((m) => `<button class="mot" type="button" data-groupe="${m.g}">${m.t}</button>`).join("")}</div>
      <div class="trous-texte"></div>
      <p class="retiens-fin" aria-live="polite"></p>
      ${o.solution === false ? "" : '<button class="lien retiens-solution" type="button">Afficher la correction</button>'}`;
    $(".trous-texte", zone).append(...modele.childNodes);
    const etat = { erreurs: 0, aide: false, fini: false };

    const accepte = (t, m) => (t.dataset.groupe ? m.dataset.groupe === t.dataset.groupe : m.textContent === t.dataset.mot);
    function remplir(t, texte, m) {
      t.textContent = texte;
      t.classList.add("rempli");
      t.removeAttribute("tabindex");
      t.removeAttribute("role");
      t.removeAttribute("aria-label");
      if (m) m.remove();
    }
    function terminer() {
      if ($$(".trou:not(.rempli)", zone).length) return;
      etat.fini = true;
      ["banque", "retiens-consigne", "retiens-solution"].forEach((c) => { const x = $("." + c, zone); if (x) x.remove(); });
      $(".retiens-fin", zone).textContent = o.fin || "Complet ✓ Tu peux le recopier dans ton cahier.";
      if (o.surFin) o.surFin(etat);
    }
    glisser(zone, ".mot", ".trou:not(.rempli)", (t, m) => {
      if (!accepte(t, m)) { etat.erreurs++; return false; }
      remplir(t, m.textContent, m);
      terminer();
      return true;
    });
    const sol = $(".retiens-solution", zone);
    if (sol) sol.addEventListener("click", () => {
      etat.aide = true;
      $$(".trou:not(.rempli)", zone).forEach((t) => {
        const m = $$(".banque .mot", zone).find((x) => accepte(t, x));
        remplir(t, m ? m.textContent : t.dataset.mot, m);
      });
      terminer();
    });
    return etat;
  }

  /* ---------- tri en colonnes ----------
   * items : [{ t: "texte", c: "id de la bonne colonne", aide: "indice si erreur" }] */
  function tri(zone, o) {
    const items = melanger(o.items, o.graine || o.items.length * 17);
    zone.innerHTML = `<p class="retiens-consigne">${o.consigne}</p>
      <div class="banque tri-banque">${items.map((it, i) => `<button class="mot" type="button" data-i="${o.items.indexOf(it)}">${it.t}</button>`).join("")}</div>
      <div class="tri-colonnes" style="--n:${o.categories.length}">${o.categories.map((c) => `<div class="tri-col" data-c="${c.id}" tabindex="0" role="button" aria-label="Colonne ${c.titre}">
        <div class="tri-titre">${c.titre}${c.sous ? `<small>${c.sous}</small>` : ""}</div><div class="tri-liste"></div></div>`).join("")}</div>
      <p class="tri-retour" aria-live="polite"></p>`;
    const etat = { erreurs: 0, fini: false };
    const retour = $(".tri-retour", zone);
    glisser(zone, ".banque .mot", ".tri-col", (col, m) => {
      const it = o.items[+m.dataset.i];
      if (it.c !== col.dataset.c) {
        etat.erreurs++;
        retour.className = "tri-retour ko";
        retour.textContent = it.aide || "Pas dans cette colonne. Réfléchis encore.";
        return false;
      }
      const puce = document.createElement("span");
      puce.className = "tri-puce";
      puce.textContent = it.t;
      $(".tri-liste", col).append(puce);
      m.remove();
      retour.className = "tri-retour ok";
      retour.textContent = it.expl ? "Oui ! " + it.expl : "Oui !";
      if (!$(".banque .mot", zone)) {
        etat.fini = true;
        $(".banque", zone).remove();
        retour.textContent = (o.fin || "Tout est bien classé ✓") + (etat.erreurs ? ` (${etat.erreurs} erreur${etat.erreurs > 1 ? "s" : ""} en chemin)` : " Sans aucune erreur !");
        if (o.surFin) o.surFin(etat);
      }
      return true;
    });
    return etat;
  }

  /* ---------- bilan de l'élève ----------
   * Le bilan tient dans un code court de 20 caractères (ex. K7M2-9QXP-3TBA-WQ4R-ZZZZ)
   * qui contient tout : séances (réussie, bilan fait, aide, erreurs), missions
   * (meilleur score, essais) et la date. Le nom et la classe restent en clair à
   * côté du code, mais le code les vérifie : un nom changé ou un chiffre retouché
   * rend le code invalide. Le fichier téléchargé porte ce code comme nom, ce qui
   * suffit à l'enseignant pour tout relire. Sans serveur, ce n'est pas
   * infalsifiable, mais cela décourage les retouches et repère les fautes de frappe. */
  const SEL = "nutrition-svt-rendu";
  function empreinte(texte) {
    let h = 0x811c9dc5;
    for (const c of SEL + texte) { h ^= c.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
    return h;
  }
  const SEANCES = ["ch1", "ch2", "ch3", "ch4"];
  const MISSIONS = ["reseau", "gaz", "tri", "quiz"];
  const SUR = { reseau: 10, gaz: 6, tri: 10, quiz: 10 };
  const B32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // base 32 de Crockford : pas de I, L, O, U
  const JOUR0 = Date.UTC(2026, 0, 1);
  // nom et classe comparés sans accents, majuscules ni espaces (fichiers renommés par l'ENT, saisie à la main)
  const simple = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

  function controle(nom, classe, o) { return empreinte(simple(nom) + "|" + simple(classe) + "|" + o.join(",")) & 0xffff; }

  function codeCourt(nom, classe, p, m, date = new Date()) {
    const jour = Math.max(0, Math.min(4095, Math.floor((date - JOUR0) / 864e5)));
    const o = [(1 << 4) | (jour >> 8), jour & 255];
    SEANCES.forEach((c) => { const f = p[c] || {}; o.push((f.ok ? 128 : 0) | (f.bilan ? 64 : 0) | (f.aide ? 32 : 0) | Math.min(31, f.err || 0)); });
    MISSIONS.forEach((k) => { const r = m[k]; o.push(r ? ((Math.min(14, r.meilleur) + 1) << 4) | Math.min(15, r.fait) : 0); });
    const c = controle(nom, classe, o);
    o.push(c >> 8, c & 255);
    let n = 0n;
    o.forEach((x) => { n = (n << 8n) | BigInt(x); });
    n <<= 4n; // 96 bits complétés à 100 = 20 caractères
    let s = "";
    for (let i = 19; i >= 0; i--) s += B32[Number((n >> BigInt(5 * i)) & 31n)];
    return s.match(/.{4}/g).join("-");
  }

  function lireCourt(nom, classe, code) {
    const s = code.toUpperCase().replace(/[^0-9A-Z]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
    if (s.length !== 20) return null;
    let n = 0n;
    for (const ch of s) { const v = B32.indexOf(ch); if (v < 0) return null; n = (n << 5n) | BigInt(v); }
    n >>= 4n;
    const o = [];
    for (let i = 11; i >= 0; i--) o.push(Number((n >> BigInt(8 * i)) & 255n));
    if (o[0] >> 4 !== 1) return null;
    if (controle(nom, classe, o.slice(0, 10)) !== (o[10] << 8 | o[11])) return null;
    const p = {}, m = {};
    SEANCES.forEach((c, i) => { const x = o[2 + i]; if (x) p[c] = { ok: !!(x & 128), bilan: !!(x & 64), aide: !!(x & 32), err: x & 31 }; });
    MISSIONS.forEach((k, i) => { const x = o[6 + i]; if (x) m[k] = { meilleur: (x >> 4) - 1, fait: x & 15, sur: SUR[k] }; });
    return { n: nom, k: classe, date: new Date(JOUR0 + (((o[0] & 15) << 8) | o[1]) * 864e5), p, m, code: s.match(/.{4}/g).join("-") };
  }

  /* lit une ligne « Nutrition · Prénom Nom · Classe · CODE » (nom de fichier, saisie,
   * relevé sur une photo), ou un ancien code long « N1.… » */
  function lireBilan(texte) {
    const t = (texte || "").replace(/\.html?$/i, "").replace(/\s*\(\d+\)\s*$/, "").trim();
    if (/^N1\./.test(t)) {
      const d = lireRendu(t);
      return d && { n: d.n, k: d.k, date: new Date(d.t * 60000), p: d.p || {}, m: d.m || {}, code: "(ancien code)" };
    }
    const r = t.match(/((?:[0-9A-Za-z]{4}[\s-]?){4}[0-9A-Za-z]{4})\s*$/);
    if (!r) return null;
    const morceaux = t.slice(0, r.index).split(/\s*[·;\t_|]\s*|\s+-\s+/).map((x) => x.trim()).filter((x) => x && !/^nutrition$/i.test(x));
    if (morceaux.length < 2) return null;
    const classe = morceaux.pop();
    return lireCourt(morceaux.join(" "), classe, r[1]);
  }

  function lireRendu(code) {
    try {
      const c = code.trim().replace(/\s+/g, "");
      if (!c.startsWith("N1.")) return null;
      const o = Uint8Array.from(atob(c.slice(3).replace(/-/g, "+").replace(/_/g, "/")), (x) => x.charCodeAt(0));
      const v = new DataView(o.buffer);
      const r = aleatoire(v.getUint32(0));
      const json = new TextDecoder().decode(o.slice(8).map((x) => x ^ Math.floor(r() * 256)));
      if (empreinte(json) !== v.getUint32(4)) return null;
      return JSON.parse(json);
    } catch (e) { return null; }
  }

  /* contenu du bilan (dans la boîte de l'élève et dans le fichier téléchargé) */
  const TITRES = { ch1: "I. La photosynthèse", ch2: "II. Les réseaux trophiques", ch3: "III. La respiration", ch4: "IV. Les mycorhizes" };
  const NOMS_MISSIONS = { reseau: "Réseau trophique", gaz: "Laboratoire des gaz", tri: "Autotrophe ou hétérotrophe", quiz: "Défi bilan" };
  const echapper = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function bilanHtml(d) {
    const ligneS = (c) => {
      const f = d.p[c];
      return `<tr><td>${TITRES[c]}</td><td>${!f ? "pas commencée" : f.ok ? "<b class=\"ok\">réussie ✓</b>" : "en cours"}</td><td>${f ? f.err + (f.err >= 31 ? " ou +" : "") : "–"}</td><td>${f && f.aide ? "oui" : "non"}</td></tr>`;
    };
    const ligneM = (k) => { const r = d.m[k]; return `<tr><td>${NOMS_MISSIONS[k]}</td><td>${r ? `<b>${r.meilleur} / ${SUR[k]}</b>` : "–"}</td><td>${r ? r.fait + (r.fait >= 15 ? " ou +" : "") : 0}</td></tr>`; };
    return `<div class="bil">
      <p class="bil-qui"><b>${echapper(d.n)}</b> · ${echapper(d.k)} · ${d.date.toLocaleDateString("fr-FR")}</p>
      <table class="bil-t"><thead><tr><th>Séance</th><th>État</th><th>Erreurs</th><th>Correction affichée</th></tr></thead><tbody>${SEANCES.map(ligneS).join("")}</tbody></table>
      <table class="bil-t"><thead><tr><th>Mission de l'atelier</th><th>Meilleur score</th><th>Essais</th></tr></thead><tbody>${MISSIONS.map(ligneM).join("")}</tbody></table>
      <p class="bil-code-titre">Mon code</p><p class="bil-code">${d.code}</p></div>`;
  }
  const CSS_BILAN = `.bil-qui{font-size:1.15rem;margin:0 0 10px}.bil-t{border-collapse:collapse;width:100%;margin:8px 0;font-size:.92rem}
    .bil-t th,.bil-t td{border:1px solid #c4d4ca;padding:5px 8px;text-align:left}.bil-t th{background:#e3f4f1}.bil .ok{color:#15803d}
    .bil-code-titre{margin:12px 0 0;font-weight:600;color:#55665d}.bil-code{font:700 1.6rem/1.2 ui-monospace,Consolas,monospace;letter-spacing:.06em;margin:4px 0;color:#0b5f58;word-break:break-all}`;

  function nomFichier(d) {
    const propre = (s) => s.replace(/[\\/:*?"<>|·;_\t]/g, " ").replace(/\s+/g, " ").trim();
    return `Nutrition · ${propre(d.n)} · ${propre(d.k) || "classe"} · ${d.code}.html`;
  }
  function fichierBilan(d) {
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="nutrition-bilan" content="${echapper(nomFichier(d).replace(/\.html$/, ""))}">
<title>Bilan · ${echapper(d.n)}</title><style>body{font:16px/1.5 system-ui,sans-serif;color:#14211b;max-width:720px;margin:24px auto;padding:0 16px}h1{font-size:1.4rem;color:#0b5f58}${CSS_BILAN}</style></head>
<body><h1>La nutrition des êtres vivants : mon bilan</h1>${bilanHtml(d)}
<p style="color:#55665d;font-size:.85rem">Ce fichier a été créé par l'application « La nutrition des êtres vivants ». Le code vérifie le nom, la classe et les résultats : s'il est modifié, il devient invalide.</p></body></html>`;
  }

  /* boîte « Mon bilan » (parcours et atelier) */
  function boiteRendu() {
    let d = $("#dlg-rendu");
    if (!d) {
      d = document.createElement("dialog");
      d.id = "dlg-rendu";
      d.innerHTML = `<style>${CSS_BILAN}</style><form method="dialog" class="dlg">
        <h2>Mon bilan</h2>
        <div class="ligne"><input type="text" id="r-nom" placeholder="Prénom et nom" autocomplete="name"><input type="text" id="r-classe" placeholder="Classe (ex. 5e2)"></div>
        <div class="dlg-actions" style="justify-content:flex-start"><button class="btn btn-principal" type="button" id="r-voir">Voir mon bilan</button></div>
        <p class="note" id="r-etat" aria-live="polite"></p>
        <div id="r-bilan"></div>
        <div class="dlg-actions" id="r-actions" hidden>
          <button class="btn btn-principal" type="button" id="r-telecharger">Télécharger mon bilan</button>
          <button class="btn" type="button" id="r-copier">Copier le code</button>
        </div>
        <p class="note" id="r-aide" hidden>Enregistre le fichier là où ton professeur te l'a demandé (dossier de l'ordinateur, ENT…), ou montre-lui cet écran.</p>
        <div class="dlg-actions"><button class="btn" value="fermer">Fermer</button></div>
      </form>`;
      document.body.append(d);
      const id = memoire.lire("eleve");
      $("#r-nom", d).value = id.n || "";
      $("#r-classe", d).value = id.k || "";
      let bilan = null;
      function voir() {
        const n = $("#r-nom", d).value.trim();
        const k = $("#r-classe", d).value.trim();
        if (!n || !k) { $("#r-etat", d).textContent = "Écris ton prénom, ton nom et ta classe."; $(n ? "#r-classe" : "#r-nom", d).focus(); return; }
        memoire.ecrire("eleve", { n, k });
        const p = memoire.lire("parcours"), m = memoire.lire("missions");
        bilan = lireCourt(n, k, codeCourt(n, k, p, m));
        $("#r-bilan", d).innerHTML = bilanHtml(bilan);
        $("#r-actions", d).hidden = $("#r-aide", d).hidden = false;
        $("#r-etat", d).textContent = "";
      }
      $("#r-voir", d).addEventListener("click", voir);
      $("#r-telecharger", d).addEventListener("click", () => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([fichierBilan(bilan)], { type: "text/html" }));
        a.download = nomFichier(bilan);
        document.body.append(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
        $("#r-etat", d).textContent = "Fichier téléchargé ✓ (" + a.download + ")";
      });
      $("#r-copier", d).addEventListener("click", async () => {
        const texte = nomFichier(bilan).replace(/\.html$/, "");
        try { await navigator.clipboard.writeText(texte); $("#r-etat", d).textContent = "Copié ✓"; } catch (e) { $("#r-etat", d).textContent = texte; }
      });
      d.addEventListener("close", () => { /* garde le bilan affiché pour une prochaine ouverture */ });
      if (id.n && id.k) voir();
    } else if ($("#r-nom", d).value && $("#r-classe", d).value) {
      $("#r-voir", d).click(); // résultats à jour
    }
    d.showModal();
  }

  return { $, $$, memoire, aleatoire, melanger, modeEleve, glisser, trous, tri, codeCourt, lireCourt, lireBilan, bilanHtml, fichierBilan, nomFichier, boiteRendu };
})();
