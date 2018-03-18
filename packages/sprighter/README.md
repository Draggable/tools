## SVG Sprite Generator

Generate an SVG sprite from a collection of svg files. This tool will:
- optimize a directory of svg files
- create an svg sprite compatible with [svg fragment identifiers](https://caniuse.com/#feat=svg-fragment)

### Installation

```
npm install --save-dev @draggable/tools.svg-sprite
```
or
```
yarn add --dev @draggable/tools.svg-sprite
```

### Usage

The SVG Sprite Generator can be run form the command line or imported/required in another node module.

#### Command line or npm script
The following command would read all the svg files in `src/icons` and create `dist/assets/sprite.svg` relative to the directory the `svg-sprite` was run.
```bash
svg-sprite --input src/icons --output dist/assets/sprite.svg
```

#### Module

```
import { makeSvgSprite } from '@draggable/tools.svg-sprite'

// in-memory `Buffer` of svg sprite
const svgSprite = makeSvgSprite({ input: 'src/icons' })
```
