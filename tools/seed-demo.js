// Demo data for website screenshots. Paste into the Oceanic web build's console (vite dev, browser mode),
// or let tools/shoot.js inject it. Replaces localStorage "oceanic.db" with a Biology workspace for "Alex".
(() => {
  const now = new Date(), iso = (d) => d.toISOString(), day = (n) => { const d = new Date(now); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  let bid = 0;
  const t = (text, styles = {}) => ({ type: "text", text, styles });
  const B = (type, content, props = {}, children = []) => ({ id: `b${++bid}`, type, props: { textColor: "default", backgroundColor: "default", textAlignment: "left", ...props }, content: typeof content === "string" ? [t(content)] : content, children });
  const h = (n, s) => B("heading", s, { level: n });
  const p = (s) => B("paragraph", s);
  const li = (s) => B("bulletListItem", s);
  const ck = (s, checked) => B("checkListItem", s, { checked });
  const bold = (a, b) => [t(a, { bold: true }), t(b)];

  const pages = [
    ["cell", "Cell Structure", "🧬", "in_progress", ["exam"], 3, [
      h(1, "Cell Structure & Function"), p("Cells are the basic unit of life. Every living organism is made of one or more cells."),
      h(2, "Key organelles"), li(bold("Nucleus", " holds DNA and controls the cell")), li(bold("Mitochondria", " release energy through respiration")), li(bold("Ribosomes", " make proteins")), li(bold("Cell membrane", " controls what enters and leaves")),
      h(2, "Plant vs animal cells"), p("Plant cells also have a cell wall, chloroplasts and a permanent vacuole."),
      h(2, "Flashcards"), p("What does the nucleus do? :: Holds DNA and controls the cell"), p("Where is energy released? :: In the mitochondria"), p("What do ribosomes make? :: Proteins"),
      h(2, "Revision checklist"), ck("Label a plant cell diagram", true), ck("Learn organelle functions", true), ck("Practise microscope magnification questions", false)]],
    ["photo", "Photosynthesis", "🌿", "in_progress", ["exam"], 6, [
      h(1, "Photosynthesis"), p("Plants turn light energy into chemical energy stored in glucose."),
      B("paragraph", [t("carbon dioxide + water → glucose + oxygen", { code: true })]),
      h(2, "Limiting factors"), li("Light intensity"), li("Carbon dioxide concentration"), li("Temperature"),
      p("What does a plant make from CO₂ and water? :: Glucose and oxygen")]],
    ["resp", "Respiration", "🫁", "not_started", ["homework"], 9, [
      h(1, "Respiration"), p("Respiration releases energy from glucose in every living cell."),
      h(2, "Aerobic vs anaerobic"), li("Aerobic uses oxygen and releases more energy"), li("Anaerobic happens without oxygen and makes lactic acid in muscles"),
      p("Where does aerobic respiration happen? :: In the mitochondria")]],
    ["dna", "DNA & Genetics", "🧪", "done", ["exam"], 14, [
      h(1, "DNA & Genetics"), p("DNA is a double helix made of nucleotides. Genes code for proteins."),
      li("Alleles are different versions of a gene"), li("Dominant alleles show in the phenotype with one copy")]],
    ["eco", "Ecosystems", "🌍", "not_started", ["coursework"], 20, [h(1, "Ecosystems"), p("Food chains, food webs and how energy moves between trophic levels.")]],
    ["enz", "Enzymes", "🔬", "done", [], null, [h(1, "Enzymes"), p("Biological catalysts that speed up reactions. Each enzyme has an active site that fits one substrate.")]],
  ];
  const rows = pages.map(([id, title, icon, status, tags, due, blocks], i) => ({
    id, title, icon, parentId: null, isPinned: false, isArchived: false, archivedAt: null, sortOrder: i,
    content: JSON.stringify(blocks), createdAt: iso(now), updatedAt: iso(new Date(+now - i * 60000)),
    workspaceId: "bio", dueDate: due == null ? null : day(due), status, tags,
  }));
  const node = (id, label, x, y, parent, page, color) => ({ id, label, positionX: x, positionY: y, parentNodeId: parent, linkedPageId: page, styleJson: JSON.stringify(parent ? { shape: "rounded", color } : { shape: "pill" }) });
  const mindmap = {
    id: "mm-cell", title: "The Cell", subjectTag: "Biology", createdAt: iso(now), updatedAt: iso(now), nodeCount: 9,
    nodes: [
      node("root", "The Cell", 0, 0, null, "cell"),
      node("n1", "Nucleus", -300, -110, "root", "dna", "blue"), node("n2", "DNA", -560, -150, "n1", null, "blue"),
      node("n3", "Cell membrane", -300, 110, "root", null, "purple"), node("n4", "Diffusion", -560, 150, "n3", null, "purple"),
      node("n5", "Mitochondria", 300, -110, "root", "resp", "orange"), node("n6", "Respiration", 560, -150, "n5", "resp", "orange"),
      node("n7", "Chloroplasts", 300, 110, "root", "photo", "green"), node("n8", "Photosynthesis", 560, 150, "n7", "photo", "green"),
    ],
  };
  const db = {
    pages: rows, tabs: [{ id: "t1", history: ["home"], historyIndex: 0, isActive: true }], links: [], positions: [], edges: [],
    concepts: [], conceptResources: [], conceptGroups: [],
    workspaces: [{ id: "bio", name: "Biology", icon: "🧬", color: "green", positionX: 0, positionY: 0, sortOrder: 0 }],
    mindmaps: [mindmap],
    settings: {
      userName: "Alex", theme: "system", activeWorkspace: "bio", pendingWhatsNew: "",
      recentPages: JSON.stringify(rows.slice(0, 5).map((r) => r.id)),
      visitedAt: JSON.stringify(Object.fromEntries(rows.map((r, i) => [r.id, +now - (i + 1) * 60000]))),
      tagLibrary: JSON.stringify(["exam", "homework", "coursework"]),
      tagColors: JSON.stringify({ exam: "pink", homework: "blue", coursework: "green" }),
    },
  };
  localStorage.setItem("oceanic.db", JSON.stringify(db));
  return rows.length;
})();
