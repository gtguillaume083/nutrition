/* Accueil : progression, séance donnée par l'enseignant, espace enseignant. */
(function () {
  "use strict";
  const { $, $$, memoire } = Nutri;

  const ELEMENTS = {
    ch1: ["Séance I : la photosynthèse", "parcours.html#ch1"],
    ch2: ["Séance II : les réseaux trophiques", "parcours.html#ch2"],
    ch3: ["Séance III : la respiration", "parcours.html#ch3"],
    ch4: ["Séance IV : les mycorhizes", "parcours.html#ch4"],
    trace: ["La trace écrite", "parcours.html#trace"],
    "m-reseau": ["Mission : construis un réseau trophique", "atelier.html#reseau"],
    "m-gaz": ["Mission : le laboratoire des gaz", "atelier.html#gaz"],
    "m-tri": ["Mission : autotrophe ou hétérotrophe ?", "atelier.html#tri"],
    "m-quiz": ["Mission : défi bilan", "atelier.html#quiz"],
  };
  const SEANCES = ["ch1", "ch2", "ch3", "ch4"];

  /* ---------- progression ---------- */
  const progres = memoire.lire("parcours");
  const faites = SEANCES.filter((c) => (progres[c] || {}).ok).length;
  $("#progres-barre").style.width = (100 * faites) / 4 + "%";
  $("#progres-texte").textContent = faites ? `${faites} / 4 séances réussies` : "4 séances";
  if (Object.keys(progres).length) $("#action-parcours").firstChild.textContent = faites === 4 ? "Revoir le parcours " : "Continuer le parcours ";
  const missions = memoire.lire("missions");
  const nb = Object.keys(missions).length;
  if (nb) $("#progres-atelier").textContent = `${nb} mission${nb > 1 ? "s" : ""} sur 4 déjà tentée${nb > 1 ? "s" : ""}`;

  /* ---------- séance donnée par l'enseignant ---------- */
  Nutri.modeEleve();
  const demande = (new URLSearchParams(location.search).get("seance") || "").split(",").filter((x) => ELEMENTS[x]);
  if (demande.length) {
    try { sessionStorage.setItem("nutrition.seance", demande.join(",")); } catch (e) { /* stockage bloqué */ }
  }
  let seance = demande;
  if (!seance.length) { try { seance = (sessionStorage.getItem("nutrition.seance") || "").split(",").filter((x) => ELEMENTS[x]); } catch (e) { seance = []; } }
  if (seance.length) {
    const fait = (id) => (progres[id] || {}).ok || (id.startsWith("m-") && missions[id.slice(2)]);
    $("#seance-liste").innerHTML = seance.map((id) => `<li><a href="${ELEMENTS[id][1]}">${ELEMENTS[id][0]}</a>${fait(id) ? " ✓" : ""}</li>`).join("")
      + `<li>À la fin : clique sur <b>« Rendre mon travail »</b> (en haut du parcours ou de l'atelier) et envoie ton code à ton enseignant.</li>`;
    $("#seance").hidden = false;
  }

  /* ---------- espace enseignant ---------- */
  const dlg = $("#dlg-prof");
  function majLien() {
    const choix = $$("#prof-choix input:checked").map((i) => i.value);
    const base = location.href.replace(/[?#].*$/, "").replace(/[^/]*$/, "") + "index.html";
    const lien = choix.length ? `${base}?seance=${choix.join(",")}` : base + "?seance=";
    $("#prof-lien").value = lien;
    $("#prof-tester").href = lien;
  }
  $("#prof-choix").addEventListener("change", majLien);
  [$("#ouvrir-prof"), $("#ouvrir-prof-haut")].forEach((b) => b.addEventListener("click", () => { majLien(); dlg.showModal(); }));
  $("#prof-copier").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText($("#prof-lien").value); } catch (e) { $("#prof-lien").select(); document.execCommand("copy"); }
    $("#prof-etat").textContent = "Lien copié ✓";
  });

  let tsv = "";
  $("#prof-lire").addEventListener("click", () => {
    const lignes = $("#prof-codes").value.split(/\s+/).filter((x) => x.length > 8);
    const etat = (p) => (!p ? "–" : p.ok ? `✓${p.err ? ` (${p.err} err.)` : ""}${p.aide ? " aide" : ""}` : `en cours${p.err ? ` (${p.err} err.)` : ""}`);
    const mis = (m, k) => (m && m[k] ? `${m[k].meilleur}/${m[k].sur}` : "–");
    const entete = ["Élève", "Classe", "Date", "Séance I", "Séance II", "Séance III", "Séance IV", "Réseau", "Gaz", "Tri", "Défi"];
    const rangs = lignes.map((c) => {
      const d = Nutri.lireRendu(c);
      if (!d) return null;
      const date = new Date(d.t * 60000).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
      return [d.n, d.k || "", date, ...SEANCES.map((s) => etat((d.p || {})[s])), ...["reseau", "gaz", "tri", "quiz"].map((k) => mis(d.m, k))];
    });
    const bons = rangs.filter(Boolean).sort((a, b) => a[0].localeCompare(b[0], "fr"));
    const refus = rangs.length - bons.length;
    $("#prof-tableau").innerHTML = lignes.length ? `<table class="tableau-rendus"><thead><tr>${entete.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>
      ${bons.map((r) => `<tr>${r.map((v, i) => `<td class="${i >= 3 && i <= 6 ? (v.startsWith("✓") ? "ok" : "ko") : ""}">${v.replace(/</g, "&lt;")}</td>`).join("")}</tr>`).join("")}
      ${refus ? `<tr class="rendu-erreur"><td colspan="${entete.length}">${refus} code${refus > 1 ? "s" : ""} illisible${refus > 1 ? "s" : ""} ou modifié${refus > 1 ? "s" : ""}.</td></tr>` : ""}</tbody></table>` : "<p class=\"note\">Aucun code collé.</p>";
    tsv = [entete, ...bons].map((r) => r.join("\t")).join("\n");
    $("#prof-tsv").hidden = !bons.length;
  });
  $("#prof-tsv").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(tsv); $("#prof-tsv").textContent = "Tableau copié ✓"; } catch (e) { /* presse-papiers refusé */ }
  });

  $("#ouvrir-credits").addEventListener("click", () => $("#dlg-credits").showModal());
})();
