/* Nutrition — outils communs aux trois pages (accueil, parcours, atelier).
 *
 * - mémoire facultative dans le navigateur (rien n'est envoyé en ligne) ;
 * - glisser-déposer (souris et doigt) ou « toucher puis toucher » ;
 * - textes à trous et tris en colonnes ;
 * - code de rendu que l'élève copie pour son enseignant.
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

  /* ---------- code de rendu ----------
   * Le code contient le nom, la classe, les chapitres réussis (avec le nombre
   * d'erreurs et l'aide utilisée) et les meilleurs scores de l'atelier.
   * Il est brouillé et porte une empreinte : une modification à la main le
   * rend illisible. Ce n'est pas infalsifiable (pas de serveur), mais cela
   * décourage les retouches. */
  const SEL = "nutrition-svt-rendu";
  function empreinte(texte) {
    let h = 0x811c9dc5;
    for (const c of SEL + texte) { h ^= c.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
    return h;
  }
  const b64 = (octets) => btoa(String.fromCharCode(...octets)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const deb64 = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
  function brouiller(octets, sel) {
    const r = aleatoire(sel);
    return octets.map((o) => o ^ Math.floor(r() * 256));
  }
  function codeRendu(nom, classe) {
    const p = memoire.lire("parcours");
    const m = memoire.lire("missions");
    const donnees = { v: 1, n: nom, k: classe, t: Math.round(Date.now() / 60000), p, m };
    const json = JSON.stringify(donnees);
    const sel = (Math.random() * 4294967296) >>> 0;
    const corps = brouiller(new TextEncoder().encode(json), sel);
    const tete = new Uint8Array(8);
    new DataView(tete.buffer).setUint32(0, sel);
    new DataView(tete.buffer).setUint32(4, empreinte(json));
    return "N1." + b64([...tete, ...corps]);
  }
  function lireRendu(code) {
    try {
      const c = code.trim().replace(/\s+/g, "");
      if (!c.startsWith("N1.")) return null;
      const o = deb64(c.slice(3));
      const v = new DataView(o.buffer);
      const json = new TextDecoder().decode(brouiller(o.slice(8), v.getUint32(0)));
      if (empreinte(json) !== v.getUint32(4)) return null;
      return JSON.parse(json);
    } catch (e) { return null; }
  }

  /* boîte « Rendre mon travail » (parcours et atelier) */
  function boiteRendu() {
    let d = $("#dlg-rendu");
    if (!d) {
      d = document.createElement("dialog");
      d.id = "dlg-rendu";
      d.innerHTML = `<form method="dialog" class="dlg">
        <h2>Rendre mon travail</h2>
        <p class="note">Ce code contient ta progression : chapitres réussis, erreurs, scores de l'atelier. Copie-le et donne-le à ton enseignant (ENT, cahier de textes…).</p>
        <div class="ligne"><input type="text" id="r-nom" placeholder="Prénom et nom" autocomplete="name"><input type="text" id="r-classe" placeholder="Classe (ex. 5e2)"></div>
        <div class="dlg-actions" style="justify-content:flex-start"><button class="btn btn-principal" type="button" id="r-fabriquer">Fabriquer mon code</button></div>
        <textarea id="r-code" rows="4" readonly hidden></textarea>
        <p class="note" id="r-etat" aria-live="polite"></p>
        <div class="dlg-actions"><button class="btn" type="button" id="r-copier" hidden>Copier le code</button><button class="btn" value="fermer">Fermer</button></div>
      </form>`;
      document.body.append(d);
      const id = memoire.lire("eleve");
      $("#r-nom", d).value = id.n || "";
      $("#r-classe", d).value = id.k || "";
      $("#r-fabriquer", d).addEventListener("click", () => {
        const n = $("#r-nom", d).value.trim();
        const k = $("#r-classe", d).value.trim();
        if (!n) { $("#r-etat", d).textContent = "Écris d'abord ton prénom et ton nom."; $("#r-nom", d).focus(); return; }
        memoire.ecrire("eleve", { n, k });
        const ta = $("#r-code", d);
        ta.value = codeRendu(n, k);
        ta.hidden = false;
        $("#r-copier", d).hidden = false;
        ta.select();
        $("#r-etat", d).textContent = "Voici ton code. Copie-le en entier.";
      });
      $("#r-copier", d).addEventListener("click", async () => {
        const ta = $("#r-code", d);
        try { await navigator.clipboard.writeText(ta.value); } catch (e) { ta.select(); document.execCommand("copy"); }
        $("#r-etat", d).textContent = "Code copié ✓ Colle-le là où ton enseignant te l'a demandé.";
      });
    }
    d.showModal();
  }

  return { $, $$, memoire, aleatoire, melanger, modeEleve, glisser, trous, tri, codeRendu, lireRendu, boiteRendu };
})();
