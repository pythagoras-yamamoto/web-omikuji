// ochanoma(chashitsu リポジトリ demo/chashitsu-vm)の住民ドット絵。
// 出典: chashitsu-vm/ochanoma/web/src/residents/residentSprites.ts
// 16×16ドット。茶葉を頭につけた、もちっとした小さな生き物。
// 体色(B/D)だけが個体ごとに変わり、茶葉・茎・足はみんな同じ色。
export type PixelRows = readonly string[];
export type ColorMap = Record<string, string>;

const leaf: PixelRows = [
  "............LL..",
  "..........LLLL..",
  ".........LLLL...",
  "........LLL.....",
  ".......TL.......",
  ".......T........",
];

export const idle: PixelRows = [
  ...leaf,
  ".....BBBBBB.....",
  "...BBBBBBBBBB...",
  "..BBBBBBBBBBBB..",
  ".BBBBBBBBBBBBBB.",
  ".BBBEEBBBBBEEBB.",
  ".BBBEEBBBBBEEBB.",
  ".DBBBBBBBBBBBBD.",
  "..DDBBBBBBBBDD..",
  "....FF....FF....",
  "................",
];

export const walk1: PixelRows = [
  ...leaf,
  ".....BBBBBB.....",
  "...BBBBBBBBBB...",
  "..BBBBBBBBBBBB..",
  ".BBBBBBBBBBBBBB.",
  ".BBBEEBBBBBEEBB.",
  ".BBBEEBBBBBEEBB.",
  ".DBBBBBBBBBBBBD.",
  "..DDBBBBBBBBDD..",
  "...FF......FF...",
  "...FF...........",
];

export const walk2: PixelRows = [
  ...leaf,
  ".....BBBBBB.....",
  "...BBBBBBBBBB...",
  "..BBBBBBBBBBBB..",
  ".BBBBBBBBBBBBBB.",
  ".BBBEEBBBBBEEBB.",
  ".BBBEEBBBBBEEBB.",
  ".DBBBBBBBBBBBBD.",
  "..DDBBBBBBBBDD..",
  ".....FF....FF...",
  "...........FF...",
];

export const sit: PixelRows = [
  "................",
  ...leaf,
  ".....BBBBBB.....",
  "...BBBBBBBBBB...",
  "..BBBBBBBBBBBB..",
  ".BBBBBBBBBBBBBB.",
  ".BBBEEBBBBBEEBB.",
  ".BBBEEBBBBBEEBB.",
  ".DBBBBBBBBBBBBD.",
  "..DDDBBBBBBDDD..",
  "................",
];

export const carry1: PixelRows = [
  ...leaf,
  ".....BBBBBB.....",
  "...BBBBBBBBBB...",
  "..BBBBBBBBBBBB..",
  ".BBBBBBBBBBBBBB.",
  ".BBBEEBBBBBEEBB.",
  ".BBBBBBBBBKKKKKK",
  ".DBBBBBBBBKKKKKK",
  "..DDBBBBBBBBDDB.",
  "....FF....FF....",
  "................",
];

export const carry2: PixelRows = [
  ...leaf,
  ".....BBBBBB.....",
  "...BBBBBBBBBB...",
  "..BBBBBBBBBBBB..",
  ".BBBBBBBBBBBBBB.",
  ".BBBEEBBBBBEEBB.",
  ".BBBBBBBBBKKKKKK",
  ".DBBBBBBBBKKKKKK",
  "..DDBBBBBBBBDDB.",
  "...FF......FF...",
  "...FF...........",
];

// こたつでうたた寝する住民(24×20)。天板(W/w)から頭だけ出して、
// 布団(Q/q)にくるまり、目を閉じて寝息(Z)を立てている。
// 布団の色は ochanoma palette.roof(桃色)を流用。
// 寝息の Z は3コマでふわっと立ちのぼる。
const kotatsuBody: PixelRows = [
  ".........BBBBBB.........",
  ".......BBBBBBBBBB.......",
  "......BBBBBBBBBBBB......",
  ".....BBBBBBBBBBBBBB.....",
  ".....BBBBBBBBBBBBBB.....",
  ".....BBBEEBBBBBEEBB.....",
  ".WWWWWWWWWWWWWWWWWWWWWW.",
  ".wwwwwwwwwwwwwwwwwwwwww.",
  ".QQQQQQQQQQQQQQQQQQQQQQ.",
  "QQQQQQQQQQQQQQQQQQQQQQQQ",
  "QQQQqQQQQQqQQQQQqQQQQqQQ",
  "qQQQQQQQQQQQQQQQQQQQQQQq",
  ".qqqqqqqqqqqqqqqqqqqqqq.",
  "........................",
];

export const kotatsuFrames: PixelRows[] = [
  // 1: 小さな「z」が頭の右下に現れる
  [
    "................LL......",
    "..............LLLL......",
    ".............LLLL.......",
    "............LLL..ZZZ....",
    "...........TL.....Z.....",
    "...........T.....ZZZ....",
    ...kotatsuBody,
  ],
  // 2: 右上へのぼる
  [
    "................LL......",
    "..............LLLL.ZZZ..",
    ".............LLLL...Z...",
    "............LLL....ZZZ..",
    "...........TL...........",
    "...........T............",
    ...kotatsuBody,
  ],
  // 3: 大きな「Z」になって浮かぶ
  [
    "................LL.ZZZZ.",
    "..............LLLL....Z.",
    ".............LLLL...Z...",
    "............LLL....ZZZZ.",
    "...........TL...........",
    "...........T............",
    ...kotatsuBody,
  ],
];

export const kotatsu: PixelRows = kotatsuFrames[0];

// カーソルが近づいて目を覚ました顔(Z なし・目ぱっちり)
export const kotatsuAwake: PixelRows = [
  "................LL......",
  "..............LLLL......",
  ".............LLLL.......",
  "............LLL.........",
  "...........TL...........",
  "...........T............",
  ".........BBBBBB.........",
  ".......BBBBBBBBBB.......",
  "......BBBBBBBBBBBB......",
  ".....BBBBBBBBBBBBBB.....",
  ".....BBBEEBBBBBEEBB.....",
  ".....BBBEEBBBBBEEBB.....",
  ".WWWWWWWWWWWWWWWWWWWWWW.",
  ".wwwwwwwwwwwwwwwwwwwwww.",
  ".QQQQQQQQQQQQQQQQQQQQQQ.",
  "QQQQQQQQQQQQQQQQQQQQQQQQ",
  "QQQQqQQQQQqQQQQQqQQQQqQQ",
  "qQQQQQQQQQQQQQQQQQQQQQQq",
  ".qqqqqqqqqqqqqqqqqqqqqq.",
  "........................",
];

// 立ったまま眠る(目を閉じて寝息)。ochanoma の sleep スプライト
export const sleep: PixelRows = [
  "..........Z.LL..",
  "........Z.LLLL..",
  ".........LLLL...",
  ".......ZLLL.....",
  ".......TL.......",
  ".......T........",
  ".....BBBBBB.....",
  "...BBBBBBBBBB...",
  "..BBBBBBBBBBBB..",
  ".BBBBBBBBBBBBBB.",
  ".BBBBBBBBBBBBBB.",
  ".BBBEEBBBBBEEBB.",
  ".DBBBBBBBBBBBBD.",
  "..DDDBBBBBBDDD..",
  "................",
  "................",
];

// 住民の体色(ochanoma palette.residents より)
export const residentColors = [
  "#f2c1a0",
  "#a9d7c4",
  "#c9b9e8",
  "#f7dd9a",
  "#a9c6f0",
  "#f5b6c8",
] as const;

const darken = (hex: string, amount: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.round(v * (1 - amount));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
};

export const colorMapFor = (body: string): ColorMap => ({
  B: body,
  D: darken(body, 0.25),
  E: "#2b2a33",
  F: "#dccbb0",
  L: "#6f8f4e",
  T: "#5f7a42",
  K: "#a97d53",
  Z: "#6D9FD4", // 寝息(視認性のためやや濃い水色)
  // こたつ: 布団(palette.roof)と天板(palette.crate)
  Q: "#e6a0a0",
  q: "#cf8686",
  W: "#d4a76a",
  w: "#946b45",
});

export const drawSprite = (
  ctx: CanvasRenderingContext2D,
  rows: PixelRows,
  colorMap: ColorMap,
) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const symbol = row[x]!;
      if (symbol === ".") continue;
      const color = colorMap[symbol];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  });
};
