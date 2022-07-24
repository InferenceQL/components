/* eslint no-unused-vars: 0 */

// https://github.com/FormidableLabs/prism-react-renderer#theming

// Adapted from the Doom Nord Light theme from Doom Emacs:
// https://github.com/doomemacs/themes/blob/master/themes/doom-nord-light-theme.el

const bg = '#E5E9F0';
const bgAlt = '#D8DEE9';
const base0 = '#F0F4FC';
const base1 = '#E3EAF5';
const base2 = '#D8DEE9';
const base3 = '#C2D0E7';
const base4 = '#B8C5DB';
const base5 = '#AEBACF';
const base6 = '#A1ACC0';
const base7 = '#60728C';
const base8 = '#485163';
const fg = '#3B4252';
const fgAlt = '#2E3440';

const grey = base4;
const red = '#99324B';
const orange = '#AC4426';
const green = '#4F894C';
const teal = '#29838D';
const yellow = '#9A7500';
const blue = '#3B6EA8';
const darkBlue = '#5272AF';
const magenta = '#97365B';
const violet = '#842879';
const cyan = '#398EAC';
const darkCyan = '#2C7088';

export default {
  plain: {
    color: fg,
    backgroundColor: bg,
  },
  styles: [
    { types: ['boolean'], style: { color: magenta } },
    { types: ['builtin'], style: { color: teal } },
    { types: ['char'], style: { color: green } },
    { types: ['comment'], style: { color: base5 } },
    { types: ['constant'], style: { color: magenta } },
    { types: ['function'], style: { color: teal, fontStyle: 'italic' } },
    { types: ['keyword'], style: { color: blue, fontWeight: 'bold' } },
    { types: ['number'], style: { color: magenta } },
    { types: ['operator'], style: { color: teal } },
    { types: ['punctuation'], style: { color: grey } },
    { types: ['property'], style: { color: orange } },
    { types: ['string'], style: { color: green } },
    { types: ['symbol'], style: { color: violet } },
    { types: ['variable'], style: { color: violet } },

    // "class-name"
    // "important"
    // "regex"
    // "url"

    { types: ['bold'], style: { fontWeight: 'bold' } },
    { types: ['italic'], style: { fontStyle: 'italic' } },
  ],
};
