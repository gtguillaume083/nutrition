/* Parcours guidé « La nutrition des êtres vivants » (SVT, 5e).
 *
 * Quatre chapitres, un par séance, chacun suivant le même plan :
 *   l'énigme de départ → Je découvre → J'expérimente → Je vérifie → Je retiens.
 * La progression est gardée dans le navigateur de l'élève (rien en ligne).
 */
(function () {
  "use strict";
  const { $, $$, memoire } = Nutri;

  // { ch1: { ok: true, err: 2, aide: false }, ... }
  let progres = memoire.lire("parcours");
  const enregistrer = () => memoire.ecrire("parcours", progres);
  const fiche = (id) => (progres[id] = progres[id] || { ok: false, err: 0, aide: false });

  /* ======================================================================
   * CONTENU DES CHAPITRES
   * ==================================================================== */
  const CHAPITRES = [
    {
      id: "ch1", titre: "Comment les plantes font-elles pour grandir ?", court: "La photosynthèse",
      enigme: `En 1648, <b>Van Helmont</b> plante un jeune saule de 2,3 kg dans un bac de 90,9 kg de terre. Il l'arrose seulement avec de l'eau de pluie. Cinq ans plus tard, le saule pèse <b>76,7 kg</b>. Il en conclut que toute cette matière vient de l'eau. <b>Avait-il raison ?</b>`,
      decouvre: `<p>Une plante grandit : elle fabrique sa propre <b>matière organique</b> (la matière qui forme les êtres vivants : bois, feuilles, fruits…).</p>
        <p>Pour savoir avec quoi elle la fabrique, refaisons les expériences des scientifiques. Des plantes cultivées dans de l'eau sans <b>sels minéraux</b> se développent très mal ; une plante privée de <b>lumière</b> ou de <b>dioxyde de carbone</b> (CO₂, un gaz de l'air) ne fabrique pas de matière.</p>`,
      experiences: [
        { titre: "1. Refais l'expérience de Van Helmont", faire: Exp.vanHelmont },
        { titre: "2. L'expérience d'Ingenhousz (1779) : les élodées", faire: Exp.elodee,
          avant: `<p class="petit">Les élodées sont des plantes aquatiques. Change les conditions, puis <b>compte les bulles</b> pour chaque situation. Compare tes mesures dans le tableau.</p>` },
        { titre: "3. La cellule chlorophyllienne", faire: Exp.cellule,
          avant: `<p class="petit">Les feuilles sont formées de cellules. Voici le schéma d'une cellule de feuille observée au microscope.</p>` },
        { titre: "4. L'équation de la photosynthèse", faire: Exp.equationPhoto },
      ],
      questions: [
        { q: "La masse gagnée par le saule (74,4 kg) peut-elle venir de la terre ?", options: ["Oui, la terre a perdu autant de masse", "Non, la terre n'a perdu que 60 g"], bonne: 1,
          expl: "La terre n'a perdu que 60 g : c'est presque rien à côté des 74,4 kg gagnés." },
        { q: "À la lumière, les élodées produisent des bulles de…", options: ["dioxyde de carbone", "dioxygène", "vapeur d'eau"], bonne: 1,
          expl: "Les bulles sont du dioxygène (O₂), produit par la photosynthèse." },
        { q: "Que faut-il à une plante pour fabriquer sa matière organique ?", options: ["De la lumière, de l'eau, du dioxyde de carbone et des sels minéraux", "Seulement de l'eau", "De la terre et du dioxygène"], bonne: 0,
          expl: "Avec la lumière, la plante utilise l'eau, le dioxyde de carbone et les sels minéraux." },
        { q: "Où a lieu la photosynthèse dans la cellule ?", options: ["Dans le noyau", "Dans les chloroplastes", "Dans la paroi"], bonne: 1,
          expl: "Dans les chloroplastes, qui contiennent la chlorophylle, le pigment vert." },
      ],
      retiens: `<p>Les végétaux chlorophylliens fabriquent leur propre matière organique à partir de matière minérale : c'est la <b>photosynthèse</b>. Elle a lieu dans les <b>chloroplastes</b>, grâce à la <b>chlorophylle</b> et à la <b>lumière</b>.</p>
        <p>dioxyde de carbone + eau + sels minéraux → matière organique + <b>dioxygène</b></p>
        <p>Les plantes sont des êtres vivants <b>autotrophes</b> : elles fabriquent leur matière organique à partir de matière <b>minérale</b>.</p>`,
    },
    {
      id: "ch2", titre: "Comment les champignons et les animaux se nourrissent-ils ?", court: "Les réseaux trophiques",
      enigme: `Dans la litière d'une forêt, sous les feuilles mortes, poussent des champignons. Ils ne sont pas verts : pas de chlorophylle, donc <b>pas de photosynthèse</b>. Pas de bouche non plus. <b>Comment se nourrissent-ils ?</b>`,
      decouvre: `<p>Un champignon est formé de filaments microscopiques, les <b>hyphes</b>, qui forment dans le sol un réseau appelé <b>mycélium</b>. Le champignon sécrète dans le sol des substances qui <b>dégradent</b> la matière organique morte (feuilles, bois), puis il <b>absorbe</b> les petites molécules obtenues.</p>
        <p>Les champignons et les animaux ne peuvent pas fabriquer leur matière organique à partir de matière minérale : ils doivent <b>consommer de la matière organique</b>. On dit qu'ils sont <b>hétérotrophes</b>.</p>
        <p>Comme tous les êtres vivants, ils fabriquent pourtant leur propre matière (chair, filaments…), mais à partir de la matière organique qu'ils consomment.</p>
        <div class="doc"><div class="doc-titre">Un réseau trophique de forêt méditerranéenne (chênes-lièges du Var)</div><ul>
          <li>Les feuilles de chêne sont mangées par la limace et le criquet.</li>
          <li>La limace est mangée par le hérisson et le renard.</li>
          <li>Le criquet est mangé par le lézard et le renard.</li>
          <li>Les feuilles mortes, les cadavres et les excréments sont dégradés par des champignons et des bactéries du sol. Les sels minéraux produits retournent dans le sol, où les racines du chêne les absorbent.</li></ul></div>`,
      experiences: [
        { titre: "1. Construis le réseau trophique de la forêt", faire: (el) => Exp.reseau(el, {
          h: 300,
          noeuds: [
            { id: "chene", nom: "Chêne", emoji: "🌳", x: 210, y: 262 },
            { id: "limace", nom: "Limace", emoji: "🐌", x: 110, y: 168 },
            { id: "criquet", nom: "Criquet", emoji: "🦗", x: 310, y: 168 },
            { id: "herisson", nom: "Hérisson", emoji: "🦔", x: 60, y: 46 },
            { id: "renard", nom: "Renard", emoji: "🦊", x: 210, y: 46 },
            { id: "lezard", nom: "Lézard", emoji: "🦎", x: 360, y: 46 },
          ],
          liens: [["chene", "limace"], ["chene", "criquet"], ["limace", "herisson"], ["limace", "renard"], ["criquet", "lezard"], ["criquet", "renard"]],
        }) },
        { titre: "2. Qui fait quoi dans l'écosystème ?", faire: (el) => Nutri.tri(el, {
          consigne: "Range chaque être vivant dans la bonne colonne (glisse-le, ou touche-le puis touche une colonne).",
          categories: [
            { id: "p", titre: "Producteur", sous: "produit de la matière organique à partir de matière minérale" },
            { id: "c1", titre: "Consommateur primaire", sous: "mange des producteurs" },
            { id: "c2", titre: "Consommateur secondaire", sous: "mange des consommateurs" },
            { id: "d", titre: "Décomposeur", sous: "dégrade la matière morte" },
          ],
          items: [
            { t: "🌳 Chêne", c: "p", aide: "Le chêne fait la photosynthèse : il fabrique sa matière organique à partir de matière minérale." },
            { t: "🐌 Limace", c: "c1", aide: "La limace mange des feuilles de chêne." },
            { t: "🦗 Criquet", c: "c1", aide: "Le criquet mange des feuilles." },
            { t: "🦔 Hérisson", c: "c2", aide: "Le hérisson mange des limaces." },
            { t: "🦎 Lézard", c: "c2", aide: "Le lézard mange des criquets." },
            { t: "🦊 Renard", c: "c2", aide: "Le renard mange des limaces et des criquets." },
            { t: "🍄 Champignons du sol", c: "d", aide: "Les champignons du sol dégradent les feuilles mortes." },
            { t: "🦠 Bactéries du sol", c: "d", aide: "Les bactéries du sol dégradent la matière organique morte." },
          ],
        }) },
        { titre: "3. Et si les décomposeurs disparaissaient ?", faire: Exp.recyclage },
      ],
      questions: [
        { q: "Un champignon peut-il faire la photosynthèse ?", options: ["Oui, comme les plantes", "Non, il n'a pas de chlorophylle"], bonne: 1,
          expl: "Sans chlorophylle, pas de photosynthèse : le champignon doit absorber de la matière organique." },
        { q: "La limace, le renard et les champignons sont…", options: ["autotrophes", "hétérotrophes"], bonne: 1,
          expl: "Ils fabriquent leur matière à partir de matière organique produite par d'autres êtres vivants." },
        { q: "Dans une chaîne alimentaire, la flèche signifie…", options: ["« mange »", "« est mangé par »"], bonne: 1,
          expl: "Chêne → limace se lit : « le chêne est mangé par la limace ». La flèche montre le trajet de la matière." },
        { q: "Sans décomposeurs, que deviendraient les sels minéraux du sol ?", options: ["Ils augmenteraient", "Ils s'épuiseraient : la matière morte ne serait plus recyclée"], bonne: 1,
          expl: "Les décomposeurs transforment la matière organique morte en sels minéraux, réutilisés par les plantes." },
      ],
      retiens: `<p>Les animaux et les champignons sont <b>hétérotrophes</b> : ils se nourrissent de matière organique produite par d'autres êtres vivants.</p>
        <p>Dans un écosystème, les <b>producteurs</b> (végétaux chlorophylliens) produisent la matière organique à partir de matière minérale ; les <b>consommateurs</b> la mangent ; les <b>décomposeurs</b> (champignons, bactéries) dégradent la matière morte en <b>sels minéraux</b>.</p>
        <p>Les relations « est mangé par » forment des chaînes alimentaires, reliées en un <b>réseau trophique</b>.</p>`,
    },
    {
      id: "ch3", titre: "Comment les graines peuvent-elles vivre sans photosynthèse ?", court: "La respiration",
      enigme: `Des graines de haricot en train de germer sont placées sous une cloche fermée pendant 48 h. À l'ouverture, elles sont <b>mortes</b>, alors qu'elles ne faisaient pas encore de photosynthèse. <b>De quoi avaient-elles besoin pour vivre ?</b>`,
      decouvre: `<p>Une graine contient des réserves de matière organique, notamment des <b>glucides</b> (sucres, amidon). Pour germer, elle a besoin d'<b>énergie</b>.</p>
        <p>On place des graines dans un flacon fermé, avec des capteurs qui mesurent le dioxygène et le dioxyde de carbone. L'<b>eau de chaux</b> permet aussi de repérer le dioxyde de carbone : elle se trouble en sa présence.</p>`,
      experiences: [
        { titre: "1. Mesure les gaz autour de graines germées", faire: Exp.cloche,
          avant: `<p class="petit">Fais la mesure avec des graines germées, puis avec des graines mortes (le <b>témoin</b>), et compare les courbes.</p>` },
        { titre: "2. Le chêne, de jour comme de nuit", faire: Exp.chene,
          avant: `<p class="petit">Les plantes vertes respirent-elles aussi ? Fais varier l'heure et la saison.</p>` },
        { titre: "3. Compare photosynthèse et respiration", faire: (el) => Nutri.trous(el, {
          consigne: "Complète le tableau avec les mots (glisse-les, ou touche un mot puis une case).",
          html: `<div class="defile"><table class="tableau"><thead><tr><th></th><th>Photosynthèse</th><th>Respiration</th></tr></thead><tbody>
            <tr><td>Qui la réalise ?</td><td><b>végétaux chlorophylliens</b></td><td><b>tous les êtres vivants</b></td></tr>
            <tr><td>Ce qui est utilisé</td><td>dioxyde de carbone + eau + sels minéraux</td><td><b>glucides + dioxygène</b></td></tr>
            <tr><td>Ce qui est produit</td><td>matière organique + dioxygène</td><td><b>dioxyde de carbone + eau</b> + énergie</td></tr>
            <tr><td>Quand ?</td><td><b>seulement à la lumière</b></td><td><b>jour et nuit</b></td></tr>
            <tr><td>Énergie</td><td><b>stockée</b> dans la matière organique</td><td><b>libérée</b> pour la cellule</td></tr>
            </tbody></table></div>`,
        }) },
      ],
      questions: [
        { q: "Les graines germées absorbent… et rejettent…", options: ["du dioxyde de carbone… du dioxygène", "du dioxygène… du dioxyde de carbone"], bonne: 1,
          expl: "Le dioxygène passe de 21 % à 15 %, le dioxyde de carbone de 0 % à 6 % : c'est la respiration." },
        { q: "Pourquoi faire la même expérience avec des graines mortes ?", options: ["Pour montrer que ce sont les graines vivantes qui changent l'air (c'est le témoin)", "Pour avoir plus de graines"], bonne: 0,
          expl: "Le témoin montre que, sans graines vivantes, l'air ne change pas." },
        { q: "La nuit, une feuille de chêne…", options: ["fait la photosynthèse", "respire seulement : elle absorbe du dioxygène", "ne fait rien"], bonne: 1,
          expl: "Sans lumière, pas de photosynthèse, mais la respiration continue." },
        { q: "Qui respire ?", options: ["Seulement les animaux", "Tous les êtres vivants, y compris les plantes et les champignons"], bonne: 1,
          expl: "Toutes les cellules vivantes respirent, jour et nuit." },
      ],
      retiens: `<p>La <b>respiration</b> est réalisée par <b>tous</b> les êtres vivants, jour et nuit, dans toutes leurs cellules.</p>
        <p>glucides + <b>dioxygène</b> → dioxyde de carbone + eau + <b>énergie</b></p>
        <p>Les graines germent sans photosynthèse car elles utilisent les <b>glucides</b> de leurs réserves pour libérer de l'énergie grâce à la respiration. Les végétaux réalisent donc <b>deux</b> réactions : la photosynthèse (le jour) et la respiration (tout le temps).</p>`,
    },
    {
      id: "ch4", titre: "Comment champignons et plantes s'associent-ils ?", court: "Les mycorhizes",
      enigme: `Dans une pépinière près de Nice, deux lots de jeunes pins poussent dans le même sol pauvre. Le premier lot a reçu des spores de champignons. Deux ans plus tard, ces pins sont <b>deux fois plus grands</b>. <b>Comment l'expliquer ? Et qu'y gagne le champignon ?</b>`,
      decouvre: `<p>Le cèpe que l'on trouve au pied des chênes est un champignon un peu particulier : ses filaments s'enroulent autour des racines de l'arbre. Cette association d'un champignon et d'une racine s'appelle une <b>mycorhize</b>.</p>
        <p>Les filaments du champignon explorent un très grand volume de sol, bien plus que les racines seules. Environ <b>80 à 90 %</b> des plantes terrestres vivent ainsi associées à des champignons.</p>`,
      experiences: [
        { titre: "1. La pépinière expérimentale", faire: Exp.pepiniere },
        { titre: "2. Les échanges dans une mycorhize", faire: Exp.echanges,
          avant: `<p class="petit">Observe ce qui circule entre le champignon et la racine. Puis essaie les deux cases pour voir ce qui se passe.</p>` },
        { titre: "3. Les types d'associations", faire: (el) => Nutri.tri(el, {
          consigne: "Toutes les associations ne se valent pas. Range chaque exemple dans la bonne colonne.",
          categories: [
            { id: "m", titre: "Mutualisme", sous: "les deux y gagnent (+ / +)" },
            { id: "p", titre: "Parasitisme", sous: "l'un gagne, l'autre perd (+ / −)" },
            { id: "c", titre: "Commensalisme", sous: "l'un gagne, l'autre n'y perd rien (+ / 0)" },
          ],
          items: [
            { t: "Champignon + racine de pin (mycorhize)", c: "m", aide: "Le champignon donne eau et sels minéraux, le pin donne des glucides." },
            { t: "Champignon + algue (lichen)", c: "m", aide: "L'algue fait la photosynthèse, le champignon l'abrite et la protège." },
            { t: "Poisson-clown + anémone de mer", c: "m", aide: "L'anémone protège le poisson, qui la nettoie et la défend." },
            { t: "Gui sur un chêne", c: "p", aide: "Le gui prélève l'eau et les sels minéraux de l'arbre, qui s'affaiblit." },
            { t: "Tique sur un chevreuil", c: "p", aide: "La tique se nourrit du sang du chevreuil." },
            { t: "Rémora accroché à un requin", c: "c", aide: "Le rémora profite des restes de repas ; le requin n'y gagne ni n'y perd." },
            { t: "Héron garde-bœufs + vache", c: "c", aide: "Le héron mange les insectes dérangés par la vache, qui n'est pas gênée." },
          ],
        }) },
        { titre: "Pour aller plus loin : les lichens, sentinelles de l'air", faire: Exp.lichens,
          avant: `<p class="petit">Un lichen est une association entre un champignon et une algue verte. On a compté les espèces de lichens sur les arbres, à différentes distances d'une zone industrielle de la région de Nice. Si la pollution tue l'algue, que devient le champignon ?</p>` },
      ],
      questions: [
        { q: "Qu'apporte le champignon au pin ?", options: ["Des glucides", "De l'eau et des sels minéraux"], bonne: 1,
          expl: "Ses filaments explorent un grand volume de sol et apportent eau et sels minéraux à la racine." },
        { q: "Qu'apporte le pin au champignon ?", options: ["Des glucides fabriqués par photosynthèse", "Du dioxygène"], bonne: 0,
          expl: "Le pin fabrique des glucides par photosynthèse et en donne au champignon." },
        { q: "Le champignon mycorhizien est…", options: ["autotrophe", "hétérotrophe"], bonne: 1,
          expl: "Il ne fait pas de photosynthèse : il dépend des glucides du pin." },
        { q: "Près de l'usine, il n'y a plus de lichens. Pourquoi ?", options: ["La pollution tue l'algue, et le champignon ne peut plus se nourrir", "Les lichens se déplacent vers la campagne"], bonne: 0,
          expl: "Sans l'algue et sa photosynthèse, le champignon n'a plus de glucides : le lichen meurt. Les lichens indiquent la qualité de l'air." },
      ],
      retiens: `<p>Une <b>mycorhize</b> est une association entre un <b>champignon</b> et une racine de plante.</p>
        <p>Le champignon apporte de l'<b>eau</b> et des <b>sels minéraux</b> à la plante. La plante apporte des <b>glucides</b> au champignon.</p>
        <p>Cette association est un <b>mutualisme</b> : les deux partenaires en tirent un bénéfice. Le champignon est <b>hétérotrophe</b> : il ne réalise pas la photosynthèse et dépend de la plante pour obtenir ses glucides.</p>`,
    },
  ];

  /* ======================================================================
   * TRACE ÉCRITE
   * ==================================================================== */
  const LEXIQUE = [
    ["Autotrophe", "Être vivant qui fabrique sa propre matière organique à partir de matière minérale (les végétaux chlorophylliens)."],
    ["Chlorophylle", "Pigment vert contenu dans les chloroplastes, indispensable à la photosynthèse."],
    ["Chloroplaste", "Petit élément vert des cellules végétales où a lieu la photosynthèse."],
    ["Consommateur", "Être vivant qui se nourrit d'autres êtres vivants (plantes ou animaux)."],
    ["Décomposeur", "Être vivant (champignon, bactérie) qui dégrade la matière organique morte en sels minéraux."],
    ["Hétérotrophe", "Être vivant qui fabrique sa matière organique à partir de matière organique prélevée sur d'autres êtres vivants (animaux, champignons)."],
    ["Matière minérale", "Eau, dioxyde de carbone, sels minéraux : matière qui ne vient pas d'un être vivant."],
    ["Matière organique", "Matière fabriquée par les êtres vivants (glucides, bois, chair…)."],
    ["Mutualisme", "Association entre deux espèces où les deux partenaires sont gagnants."],
    ["Mycorhize", "Association entre un champignon et les racines d'une plante."],
    ["Photosynthèse", "Fabrication de matière organique par les végétaux chlorophylliens, à la lumière, avec rejet de dioxygène."],
    ["Producteur", "Être vivant autotrophe, premier maillon des chaînes alimentaires."],
    ["Réseau trophique", "Ensemble des chaînes alimentaires reliées entre elles dans un écosystème."],
    ["Respiration", "Utilisation de glucides et de dioxygène par les cellules pour libérer de l'énergie, avec rejet de dioxyde de carbone."],
  ];

  function schemaMatiere() {
    const b = (x, y, w, t, s, c) => `<g><rect x="${x}" y="${y}" width="${w}" height="54" rx="12" fill="${c}" stroke="#0f766e" stroke-width="2"/><text x="${x + w / 2}" y="${y + 24}" font-weight="700" font-size="14" text-anchor="middle">${t}</text><text x="${x + w / 2}" y="${y + 42}" font-size="11.5" text-anchor="middle" fill="#334155">${s}</text></g>`;
    return `<svg viewBox="0 0 640 330" class="dessin" style="max-width:640px;margin:auto" role="img" aria-label="Schéma bilan : le cycle de la matière dans un écosystème">
      <defs><marker id="fm" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#0f766e"/></marker></defs>
      <circle cx="60" cy="50" r="26" fill="#fde047"/><text x="60" y="94" font-size="12" text-anchor="middle">lumière</text>
      ${b(130, 30, 170, "Producteurs", "végétaux : photosynthèse", "#dcfce7")}
      ${b(420, 30, 190, "Consommateurs", "animaux", "#fef3c7")}
      ${b(420, 240, 190, "Décomposeurs", "champignons, bactéries", "#ede9fe")}
      ${b(130, 240, 170, "Matière minérale", "sels minéraux, CO₂, eau", "#e0f2fe")}
      <path d="M90,52 H124" stroke="#eab308" stroke-width="3" marker-end="url(#fm)"/>
      <path d="M302,57 H414" stroke="#0f766e" stroke-width="2.5" marker-end="url(#fm)"/><text x="358" y="48" font-size="12" text-anchor="middle" font-style="italic">est mangé par</text>
      <path d="M515,86 V234" stroke="#0f766e" stroke-width="2.5" marker-end="url(#fm)"/><text x="525" y="150" font-size="12" font-style="italic">cadavres,</text><text x="525" y="166" font-size="12" font-style="italic">excréments</text>
      <path d="M260,86 C320,160 380,210 414,250" stroke="#0f766e" stroke-width="2.5" fill="none" marker-end="url(#fm)"/><text x="300" y="180" font-size="12" font-style="italic">feuilles mortes</text>
      <path d="M414,267 H306" stroke="#0f766e" stroke-width="2.5" marker-end="url(#fm)"/><text x="360" y="288" font-size="12" text-anchor="middle" font-style="italic">recyclage</text>
      <path d="M215,234 V92" stroke="#0f766e" stroke-width="2.5" marker-end="url(#fm)"/><text x="160" y="170" font-size="12" font-style="italic" text-anchor="end">absorbée</text><text x="160" y="186" font-size="12" font-style="italic" text-anchor="end">par les racines</text>
      <text x="320" y="320" font-size="12.5" text-anchor="middle" fill="#334155">Tous ces êtres vivants respirent : ils rejettent du dioxyde de carbone.</text>
    </svg>`;
  }

  function rendreTrace(main) {
    main.innerHTML = `<article class="trace">
      <p class="chap-num">Trace écrite</p>
      <h1>La nutrition des êtres vivants</h1>
      <p class="petit">À lire, à recopier ou à imprimer. Elle reprend tout le parcours.</p>
      <div class="commandes"><button class="btn btn-principal" id="t-imprimer">Imprimer / PDF</button></div>

      <h2>1. Les plantes fabriquent leur matière : la photosynthèse</h2>
      <p>Les végétaux chlorophylliens fabriquent leur propre <b>matière organique</b> à partir de <b>matière minérale</b> : ils sont <b>autotrophes</b>. Cette fabrication s'appelle la <b>photosynthèse</b>. Elle a lieu dans les <b>chloroplastes</b> des cellules, grâce à la <b>chlorophylle</b>, et seulement à la <b>lumière</b>.</p>
      <p class="equation">dioxyde de carbone + eau + sels minéraux <span class="fleche"><small>lumière</small><i>⟶</i></span> matière organique + dioxygène</p>
      <p>La matière d'un arbre vient donc surtout du <b>dioxyde de carbone de l'air</b>, et non de la terre : la terre n'apporte que l'eau et un peu de sels minéraux.</p>

      <h2>2. Les animaux et les champignons consomment de la matière organique</h2>
      <p>Les animaux et les champignons ne peuvent pas fabriquer leur matière organique à partir de matière minérale : ils sont <b>hétérotrophes</b>. Comme tous les êtres vivants, ils fabriquent leur propre matière, mais à partir de la matière organique qu'ils prélèvent sur d'autres êtres vivants. Les animaux mangent d'autres êtres vivants ; les champignons absorbent la matière organique qu'ils ont dégradée dans le sol.</p>
      <p>Dans un écosystème, les <b>producteurs</b> produisent la matière organique à partir de matière minérale, les <b>consommateurs</b> la mangent et les <b>décomposeurs</b> (champignons, bactéries) dégradent la matière morte en sels minéraux, réutilisés par les plantes. Les relations « est mangé par » forment un <b>réseau trophique</b>.</p>
      <figure>${schemaMatiere()}<figcaption>Schéma bilan : la matière circule et se recycle dans un écosystème.</figcaption></figure>

      <h2>3. Tous les êtres vivants respirent</h2>
      <p>Pour vivre, toutes les cellules ont besoin d'<b>énergie</b>. Elles l'obtiennent par la <b>respiration</b>, jour et nuit, chez <b>tous</b> les êtres vivants, plantes comprises.</p>
      <p class="equation">glucides + dioxygène ⟶ dioxyde de carbone + eau + énergie</p>
      <p>Une graine germe sans photosynthèse car elle respire en utilisant les glucides de ses réserves. Le jour, une plante fait à la fois la photosynthèse et la respiration ; la nuit, seulement la respiration.</p>

      <h2>4. Des associations pour mieux se nourrir</h2>
      <p>Beaucoup de plantes vivent associées à des champignons au niveau de leurs racines : c'est une <b>mycorhize</b>. Le champignon apporte à la plante de l'<b>eau</b> et des <b>sels minéraux</b> ; la plante apporte au champignon des <b>glucides</b> fabriqués par photosynthèse. Les deux partenaires sont gagnants : c'est un <b>mutualisme</b>. Le lichen (champignon + algue) en est un autre exemple. D'autres associations sont du <b>parasitisme</b> (l'un gagne, l'autre perd) ou du <b>commensalisme</b> (l'un gagne, l'autre n'y perd rien).</p>

      <h2>Lexique</h2>
      <dl class="lexique">${LEXIQUE.map(([m, d]) => `<dt>${m}</dt><dd>${d}</dd>`).join("")}</dl>
    </article>`;
    $("#t-imprimer", main).addEventListener("click", () => window.print());
  }

  /* ======================================================================
   * AFFICHAGE D'UN CHAPITRE
   * ==================================================================== */
  function verifierFin(ch, reussies) {
    const f = fiche(ch.id);
    if (reussies.size === ch.questions.length && f.bilan && !f.ok) {
      f.ok = true;
      enregistrer();
      majSommaire();
      $(".fin-chapitre").classList.add("visible");
    }
  }

  function rendreQuestions(zone, ch, reussies) {
    zone.innerHTML = ch.questions.map((q, i) => `<div class="qcm" data-q="${i}">
      <p class="qcm-q"><span class="qcm-num">${i + 1}</span>${q.q}</p>
      <div class="qcm-options">${q.options.map((o, j) => `<button class="qcm-opt" type="button" data-j="${j}">${o}</button>`).join("")}</div>
      <p class="qcm-retour" aria-live="polite"></p></div>`).join("");
    zone.addEventListener("click", (e) => {
      const b = e.target.closest(".qcm-opt");
      if (!b) return;
      const bloc = b.closest(".qcm");
      const i = +bloc.dataset.q;
      const q = ch.questions[i];
      const ok = +b.dataset.j === q.bonne;
      $$(".qcm-opt", bloc).forEach((x) => x.classList.remove("juste", "faux"));
      b.classList.add(ok ? "juste" : "faux");
      const retour = $(".qcm-retour", bloc);
      retour.className = "qcm-retour " + (ok ? "ok" : "ko");
      retour.innerHTML = ok ? `<b>Oui !</b> ${q.expl}` : "Pas tout à fait. Relis « Je découvre » ou refais l'expérience, puis essaie une autre réponse.";
      if (ok) reussies.add(i);
      else if (!reussies.has(i)) { fiche(ch.id).err++; enregistrer(); }
      verifierFin(ch, reussies);
    });
  }

  function rendreChapitre(main, idx) {
    const ch = CHAPITRES[idx];
    const suivant = CHAPITRES[idx + 1];
    const f = fiche(ch.id);
    main.innerHTML = `<article class="chap">
      <p class="chap-num">Séance ${["I", "II", "III", "IV"][idx]} · ${ch.court}</p>
      <h1>${ch.titre}</h1>
      <div class="enigme"><span class="enigme-icone" aria-hidden="true">🔎</span><p>${ch.enigme}</p></div>

      <section class="bloc bloc-decouvre"><h2><span class="pastille">1</span>Je découvre</h2>${ch.decouvre}</section>

      <section class="bloc bloc-experimente"><h2><span class="pastille">2</span>J'expérimente</h2>
        ${ch.experiences.map((x, i) => `<div class="experience"><h3>${x.titre}</h3>${x.avant || ""}<div class="exp" data-x="${i}"></div></div>`).join("")}
      </section>

      <section class="bloc bloc-verifie"><h2><span class="pastille">3</span>Je vérifie</h2><div class="questions"></div></section>

      <section class="bloc bloc-retiens"><h2><span class="pastille">4</span>Je retiens</h2><div class="retiens"></div></section>

      <div class="fin-chapitre${f.ok ? " visible" : ""}"><p>Séance réussie ✓ Clique sur « Mon bilan » si ton professeur te le demande.</p></div>
      <nav class="chap-nav">
        ${idx > 0 ? `<a class="btn" href="#${CHAPITRES[idx - 1].id}">← Séance précédente</a>` : "<span></span>"}
        <a class="btn btn-principal" href="#${suivant ? suivant.id : "trace"}">${suivant ? "Séance suivante →" : "La trace écrite →"}</a>
      </nav>
    </article>`;
    ch.experiences.forEach((x, i) => x.faire($(`.exp[data-x="${i}"]`, main)));
    const reussies = new Set();
    rendreQuestions($(".questions", main), ch, reussies);
    Nutri.trous($(".retiens", main), {
      consigne: "Complète le bilan : glisse chaque mot dans le bon trou (ou touche un mot, puis un trou).",
      html: ch.retiens,
      graine: idx * 13 + 5,
      fin: "Bilan complet ✓ Tu peux le recopier dans ton cahier.",
      surFin: (etat) => {
        const fi = fiche(ch.id);
        fi.bilan = true;
        fi.err += etat.erreurs;
        if (etat.aide) fi.aide = true;
        enregistrer();
        verifierFin(ch, reussies);
      },
    });
  }

  function rendreAccueil(main) {
    const premier = CHAPITRES.find((c) => !(progres[c.id] || {}).ok) || CHAPITRES[0];
    main.innerHTML = `<article class="chap">
      <header class="p-hero">
        <h1>La nutrition des êtres vivants</h1>
        <p class="intro">D'où vient la matière d'un arbre ? Comment se nourrit un champignon sans bouche ni chlorophylle ? Pourquoi une graine meurt-elle sous une cloche fermée ? Mène l'enquête en quatre séances.</p>
        <div class="commandes"><a class="btn btn-principal btn-grand" href="#${premier.id}">${(progres.ch1 || {}).ok ? "Continuer" : "Commencer"} →</a></div>
      </header>
      <div class="mode-emploi">
        <div><span class="pastille">1</span><b>Je découvre</b><br>Une énigme et un texte court.</div>
        <div><span class="pastille">2</span><b>J'expérimente</b><br>Je manipule, je mesure, j'observe.</div>
        <div><span class="pastille">3</span><b>Je vérifie</b><br>Je réponds à quelques questions.</div>
        <div><span class="pastille">4</span><b>Je retiens</b><br>Je complète le bilan.</div>
      </div>
      <p>Une séance est réussie quand toutes les questions sont justes et le bilan complet. Ta progression est gardée sur cet appareil.</p>
      <ol class="liste-chapitres">${CHAPITRES.map((c, i) => `<li><a href="#${c.id}" class="${(progres[c.id] || {}).ok ? "fait" : ""}"><span class="s-num">${(progres[c.id] || {}).ok ? "✓" : ["I", "II", "III", "IV"][i]}</span><span><b>${c.court}</b><br><small>${c.titre}</small></span></a></li>`).join("")}
        <li><a href="#trace"><span class="s-num">★</span><span><b>La trace écrite</b><br><small>Tout le cours, à imprimer</small></span></a></li></ol>
    </article>`;
  }

  function majSommaire() {
    const actif = location.hash.slice(1) || "accueil";
    const fait = (c) => (progres[c.id] || {}).ok;
    $("#sommaire").innerHTML = `<ol>
      <li><a href="#accueil" class="${actif === "accueil" ? "actif" : ""}">Accueil du parcours</a></li>
      ${CHAPITRES.map((c, i) => `<li><a href="#${c.id}" class="${actif === c.id ? "actif" : ""}${fait(c) ? " fait" : ""}"><span class="s-num">${fait(c) ? "✓" : ["I", "II", "III", "IV"][i]}</span>${c.court}</a></li>`).join("")}
      <li><a href="#trace" class="${actif === "trace" ? "actif" : ""}"><span class="s-num">★</span>La trace écrite</a></li>
      <li class="s-sep"><a href="atelier.html"><span class="s-num">⚗</span>L'atelier</a></li>
      <li><a href="index.html"><span class="s-num">⌂</span>Accueil</a></li></ol>`;
    const n = CHAPITRES.filter(fait).length;
    $("#p-barre-remplie").style.width = (100 * n) / CHAPITRES.length + "%";
    $("#p-progression-texte").textContent = `${n} / ${CHAPITRES.length} séances réussies`;
  }

  function router() {
    const id = location.hash.slice(1) || "accueil";
    const main = $("#chapitre");
    const idx = CHAPITRES.findIndex((c) => c.id === id);
    if (idx >= 0) rendreChapitre(main, idx);
    else if (id === "trace") rendreTrace(main);
    else rendreAccueil(main);
    majSommaire();
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }

  // écran étroit : le sommaire devient un menu qui s'ouvre par le bouton « Séances »
  function menu(ouvert) {
    document.body.classList.toggle("menu-ouvert", ouvert);
    $("#p-menu").setAttribute("aria-expanded", ouvert);
  }
  $("#p-menu").addEventListener("click", () => menu(!document.body.classList.contains("menu-ouvert")));
  $("#p-voile").addEventListener("click", () => menu(false));
  $("#sommaire").addEventListener("click", (e) => { if (e.target.closest("a")) menu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") menu(false); });
  $("#p-rendre").addEventListener("click", Nutri.boiteRendu);

  Nutri.modeEleve();
  window.addEventListener("hashchange", router);
  router();
})();
