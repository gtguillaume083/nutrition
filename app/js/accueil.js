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
      + `<li>À la fin : clique sur <b>« Mon bilan »</b> (en haut du parcours ou de l'atelier), puis télécharge ton bilan ou montre-le à ton professeur.</li>`;
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

  /* bilans : fichiers déposés ou lignes tapées ; un élève n'apparaît qu'une fois (son bilan le plus récent) */
  const bilans = new Map();
  const refuses = [];
  let tsv = "";
  function ajouter(texte) {
    const d = Nutri.lireBilan(texte);
    if (!d) { refuses.push(texte); return; }
    const cle = (d.n + "|" + d.k).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const avant = bilans.get(cle);
    if (!avant || avant.date <= d.date) bilans.set(cle, d);
  }
  function tableau() {
    const etat = (p) => (!p ? "–" : p.ok ? `✓${p.err ? ` (${p.err}${p.err >= 31 ? "+" : ""} err.)` : ""}${p.aide ? " aide" : ""}` : `en cours${p.err ? ` (${p.err} err.)` : ""}`);
    const mis = (m, k) => (m && m[k] ? `${m[k].meilleur}/${m[k].sur}` : "–");
    const entete = ["Élève", "Classe", "Date", "Séance I", "Séance II", "Séance III", "Séance IV", "Réseau", "Gaz", "Tri", "Défi"];
    const rangs = [...bilans.values()].map((d) => [d.n, d.k || "", d.date.toLocaleDateString("fr-FR"), ...SEANCES.map((s) => etat(d.p[s])), ...["reseau", "gaz", "tri", "quiz"].map((k) => mis(d.m, k))])
      .sort((a, b) => a[1].localeCompare(b[1], "fr") || a[0].localeCompare(b[0], "fr"));
    const esc = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;");
    $("#prof-tableau").innerHTML = rangs.length || refuses.length ? `<p class="note"><b>${rangs.length} élève${rangs.length > 1 ? "s" : ""}</b></p><table class="tableau-rendus"><thead><tr>${entete.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>
      ${rangs.map((r) => `<tr>${r.map((v, i) => `<td class="${i >= 3 && i <= 6 ? (v.startsWith("✓") ? "ok" : "ko") : ""}">${esc(v)}</td>`).join("")}</tr>`).join("")}
      ${refuses.map((t) => `<tr class="rendu-erreur"><td colspan="${entete.length}">Illisible ou modifié : ${esc(t.slice(0, 120))}</td></tr>`).join("")}</tbody></table>` : "";
    tsv = [entete, ...rangs].map((r) => r.join("\t")).join("\n");
    $("#prof-tsv").hidden = !rangs.length;
  }
  async function lireFichiers(fichiers) {
    for (const f of fichiers) {
      if (Nutri.lireBilan(f.name)) { ajouter(f.name); continue; }
      // fichier renommé : le code est aussi rangé dans le fichier
      const texte = await f.text().catch(() => "");
      const r = texte.match(/<meta name="nutrition-bilan" content="([^"]+)"/);
      ajouter(r ? r[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"') : f.name);
    }
    tableau();
  }
  const depot = $("#prof-depot");
  $("#prof-fichiers").addEventListener("change", (e) => { lireFichiers([...e.target.files]); e.target.value = ""; });
  ["dragenter", "dragover"].forEach((t) => depot.addEventListener(t, (e) => { e.preventDefault(); depot.classList.add("survol"); }));
  ["dragleave", "drop"].forEach((t) => depot.addEventListener(t, () => depot.classList.remove("survol")));
  depot.addEventListener("drop", (e) => { e.preventDefault(); lireFichiers([...e.dataTransfer.files]); });
  $("#prof-lire").addEventListener("click", () => {
    $("#prof-codes").value.split(/\r?\n/).map((x) => x.trim()).filter(Boolean).forEach(ajouter);
    $("#prof-codes").value = "";
    tableau();
  });
  $("#prof-vider").addEventListener("click", () => { bilans.clear(); refuses.length = 0; tableau(); });
  $("#prof-tsv").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(tsv); $("#prof-tsv").textContent = "Tableau copié ✓"; } catch (e) { /* presse-papiers refusé */ }
  });

  $("#ouvrir-credits").addEventListener("click", () => $("#dlg-credits").showModal());
})();
