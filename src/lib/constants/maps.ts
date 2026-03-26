// CS2 radar images + positions calibrated from tradeit.gg callout maps
// and verified with radar config (pos_x, pos_y, scale) + game spawn coordinates
//
// ACTUAL orientations (confirmed mathematically):
//   Mirage:   T=RIGHT, CT=LEFT, A=BOTTOM, B=UPPER-LEFT
//   Inferno:  T=LOWER-LEFT, CT=RIGHT, A=LOWER-RIGHT, B=UPPER
//   Dust2:    T=BOTTOM, CT=CENTER, A=UPPER-RIGHT, B=UPPER-LEFT
//   Nuke:     T=LEFT, CT=RIGHT, A=CENTER, B=UPPER-LEFT
//   Anubis:   T=BOTTOM, CT=UPPER, A=RIGHT, B=LEFT-CENTER
//   Ancient:  T=BOTTOM, CT=UPPER, A=LEFT(!), B=RIGHT(!)
//   Overpass: T=BOTTOM, CT=UPPER-LEFT, A=UPPER-LEFT, B=UPPER-RIGHT

export interface MapPosition {
  x: number
  y: number
}

export interface MapData {
  image: string
  positions: Record<string, MapPosition>
}

export const MAPS: Record<string, MapData> = {
  mirage: {
    image: 'https://raw.githubusercontent.com/2mlml/cs2-radar-images/master/de_mirage.png',
    positions: {
      'T Spawn':      { x: 78, y: 50 },
      'CT Spawn':     { x: 35, y: 88 },
      'A Site':       { x: 58, y: 80 },
      'B Site':       { x: 20, y: 28 },
      'Mid':          { x: 55, y: 48 },
      'Top Mid':      { x: 68, y: 42 },
      'Palace':       { x: 68, y: 85 },
      'A Ramp':       { x: 72, y: 68 },
      'Window':       { x: 38, y: 42 },
      'Jungle':       { x: 40, y: 60 },
      'Connector':    { x: 48, y: 52 },
      'CT Stairs':    { x: 38, y: 82 },
      'Stairs':       { x: 50, y: 64 },
      'B Apartments': { x: 32, y: 12 },
      'Catwalk':      { x: 52, y: 36 },
      'Под Palace':   { x: 64, y: 78 },
      'Kitchen':      { x: 40, y: 18 },
      'Market':       { x: 18, y: 40 },
      'Tetris':       { x: 60, y: 62 },
      'Triple':       { x: 52, y: 78 },
      'Sandwich':     { x: 56, y: 66 },
    },
  },
  inferno: {
    image: 'https://raw.githubusercontent.com/2mlml/cs2-radar-images/master/de_inferno.png',
    positions: {
      'T Spawn':    { x: 10, y: 68 },
      'CT Spawn':   { x: 89, y: 35 },
      'A Site':     { x: 82, y: 70 },
      'B Site':     { x: 51, y: 22 },
      'Banana':     { x: 47, y: 43 },
      'Mid':        { x: 44, y: 65 },
      'Second Mid': { x: 52, y: 79 },
      'Arch':       { x: 78, y: 51 },
      'Library':    { x: 90, y: 55 },
      'Apartments': { x: 75, y: 83 },
      'Pit':        { x: 92, y: 81 },
      'Coffins':    { x: 52, y: 15 },
      'CT':         { x: 89, y: 31 },
      'Moto':       { x: 89, y: 69 },
    },
  },
  dust2: {
    image: 'https://raw.githubusercontent.com/2mlml/cs2-radar-images/master/de_dust2.png',
    positions: {
      'T Spawn':       { x: 40, y: 90 },
      'CT Spawn':      { x: 59, y: 20 },
      'A Site':        { x: 80, y: 17 },
      'A Platform':    { x: 70, y: 14 },
      'B Site':        { x: 20, y: 14 },
      'Long':          { x: 86, y: 39 },
      'Long Doors':    { x: 69, y: 55 },
      'A Long':        { x: 87, y: 30 },
      'A Long Corner': { x: 77, y: 65 },
      'Mid':           { x: 46, y: 51 },
      'Xbox':          { x: 48, y: 40 },
      'Short':         { x: 56, y: 40 },
      'Upper Tunnels': { x: 17, y: 47 },
      'B Tunnels':     { x: 32, y: 41 },
      'B Doors':       { x: 26, y: 23 },
      'CT Mid Doors':  { x: 33, y: 32 },
    },
  },
  nuke: {
    image: 'https://raw.githubusercontent.com/2mlml/cs2-radar-images/master/de_nuke.png',
    positions: {
      'T Spawn':   { x: 23, y: 55 },
      'T Roof':    { x: 46, y: 56 },
      'CT Spawn':  { x: 82, y: 46 },
      'A Site':    { x: 58, y: 52 },
      'B Site':    { x: 58, y: 57 },
      'Outside':   { x: 53, y: 72 },
      'Lobby':     { x: 47, y: 54 },
      'Ramp':      { x: 50, y: 40 },
      'Heaven':    { x: 62, y: 46 },
      'Vent':      { x: 54, y: 61 },
      'Vent Room': { x: 61, y: 61 },
      'Mini':      { x: 57, y: 64 },
      'Hut':       { x: 54, y: 55 },
    },
  },
  anubis: {
    image: 'https://raw.githubusercontent.com/2mlml/cs2-radar-images/master/de_anubis.png',
    positions: {
      'T Spawn':          { x: 38, y: 88 },
      'T Spawn (двор)':   { x: 38, y: 88 },
      'CT Spawn':         { x: 38, y: 22 },
      'A Site':           { x: 78, y: 22 },
      'B Site':           { x: 35, y: 48 },
      'A Main':           { x: 81, y: 45 },
      'A Main Connector': { x: 63, y: 38 },
      'B Main':           { x: 25, y: 62 },
      'Mid':              { x: 57, y: 41 },
      'CT Mid':           { x: 48, y: 31 },
      'Bridge':           { x: 50, y: 58 },
      'Canal':            { x: 57, y: 59 },
    },
  },
  ancient: {
    // A Site = LEFT side, B Site = RIGHT side
    image: 'https://raw.githubusercontent.com/2mlml/cs2-radar-images/master/de_ancient.png',
    positions: {
      'T Spawn':  { x: 48, y: 87 },
      'CT Spawn': { x: 50, y: 12 },
      'CT Area':  { x: 62, y: 25 },
      'A Site':   { x: 21, y: 27 },
      'B Site':   { x: 76, y: 40 },
      'A Main':   { x: 17, y: 40 },
      'B Ramp':   { x: 83, y: 52 },
      'Mid':      { x: 47, y: 36 },
      'Donut':    { x: 34, y: 46 },
      'Cave':     { x: 62, y: 53 },
    },
  },
  overpass: {
    // A Site = UPPER-LEFT, B Site = UPPER-RIGHT
    image: 'https://raw.githubusercontent.com/2mlml/cs2-radar-images/master/de_overpass.png',
    positions: {
      'T Spawn':   { x: 68, y: 91 },
      'CT Spawn':  { x: 48, y: 18 },
      'A Site':    { x: 45, y: 22 },
      'B Site':    { x: 69, y: 32 },
      'A Long':    { x: 19, y: 45 },
      'B Short':   { x: 72, y: 42 },
      'Monster':   { x: 81, y: 44 },
      'Mid':       { x: 39, y: 62 },
      'Bathrooms': { x: 29, y: 50 },
      'Bank':      { x: 44, y: 11 },
      'Heaven':    { x: 58, y: 24 },
      'Barrels':   { x: 75, y: 25 },
    },
  },
}
