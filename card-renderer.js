const CardRenderer = (() => {
  const suitMeta = {
    espada: { color:"#248cd8", name:"espadas" },
    basto: { color:"#3a9d48", name:"bastos" },
    oro: { color:"#d29a18", name:"oros" },
    copa: { color:"#c93636", name:"copas" }
  };

  function suitSvg(suit, size = 34) {
    const color = suitMeta[suit].color;
    if (suit === "oro") {
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="31" fill="#f3ce58" stroke="#b37f0e" stroke-width="6"/>
        <circle cx="50" cy="50" r="18" fill="#ffe998" stroke="#b37f0e" stroke-width="4"/>
      </svg>`;
    }
    if (suit === "espada") {
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
        <path d="M49 10 L60 44 L52 44 L52 74 L48 74 L48 44 L40 44 Z" fill="#28a8ff" stroke="#1768a8" stroke-width="3"/>
        <rect x="42" y="72" width="16" height="7" rx="3" fill="#e6b73a" stroke="#956d16" stroke-width="3"/>
        <path d="M34 79 Q50 92 66 79" fill="none" stroke="#956d16" stroke-width="5" stroke-linecap="round"/>
      </svg>`;
    }
    if (suit === "basto") {
      return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
        <path d="M54 14 C70 22 77 37 70 55 C66 66 56 77 52 86 C48 79 37 66 33 55 C27 37 34 22 50 14 Z" fill="#59b162" stroke="#2d7b39" stroke-width="4"/>
        <path d="M50 12 L53 87" stroke="#7a3f1c" stroke-width="6" stroke-linecap="round"/>
      </svg>`;
    }
    return `<svg width="${size}" height="${size}" viewBox="0 0 100 100">
      <path d="M50 18 C58 31 75 33 75 53 C75 67 64 77 50 82 C36 77 25 67 25 53 C25 33 42 31 50 18 Z" fill="#f5d6a6" stroke="#b03b3b" stroke-width="5"/>
      <path d="M38 57 Q50 64 62 57" fill="none" stroke="#b03b3b" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
  }

  function cardName(card) {
    const special = {
      "1-espada": "Ancho de Espadas",
      "1-basto": "Ancho de Bastos",
      "7-espada": "Siete de Espadas",
      "7-oro": "Siete de Oros"
    };
    return special[`${card.num}-${card.suit}`] || `${card.num} de ${suitMeta[card.suit].name}`;
  }

  function renderPips(card) {
    if ([10, 11, 12].includes(card.num)) {
      const title = card.num === 10 ? "SOTA" : card.num === 11 ? "CABALLO" : "REY";
      return `<div style="display:grid;place-items:center;height:100%">
        <div style="font-size:13px;color:#444;font-weight:900">${title}</div>
        ${suitSvg(card.suit, 70)}
      </div>`;
    }
    const patterns = {
      1:[[50,50]], 2:[[35,30],[65,70]], 3:[[35,26],[50,50],[65,74]],
      4:[[35,28],[65,28],[35,72],[65,72]],
      5:[[35,26],[65,26],[50,50],[35,74],[65,74]],
      6:[[35,22],[65,22],[35,50],[65,50],[35,78],[65,78]],
      7:[[35,18],[65,18],[35,42],[50,54],[65,42],[35,82],[65,82]]
    }[card.num];
    return `<div style="position:relative;width:100%;height:100%">
      ${patterns.map(([x,y]) => `<div style="position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-50%)">${suitSvg(card.suit, 32)}</div>`).join("")}
    </div>`;
  }

  function render(card) {
    const icon = suitSvg(card.suit, 16);
    return `<div class="truco-card">
      <div class="card-inner"></div>
      <div class="corner">${card.num}<div>${icon}</div></div>
      <div class="corner br">${card.num}<div>${icon}</div></div>
      <div class="center-art">${renderPips(card)}</div>
      <div class="card-name">${card.name || cardName(card)}</div>
    </div>`;
  }

  return { render, cardName, suitSvg };
})();