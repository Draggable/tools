'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var SVGO = _interopDefault(require('svgo'));
var glob = _interopDefault(require('glob'));
var File = _interopDefault(require('vinyl'));
var SVGSpriter = _interopDefault(require('svg-sprite'));

const svgOptions = {
  plugins: [{ cleanupAttrs: true }, { mergePaths: true }, { removeAttrs: { attrs: '(stroke|fill)' } }, { removeDimensions: true }, { removeDoctype: true }, { removeNonInheritableGroupAttrs: true }, { removeStyleElement: true }, { removeTitle: true }, { removeUselessDefs: true }, { removeUselessDefs: true },
  //
  { cleanupAttrs: true }, { cleanUpEnableBackground: true }, { cleanupIDs: true }, { cleanupNumericValues: true }, { collapseGroups: true }, { convertColors: true }, { convertPathData: true }, { convertShapeToPath: true }, { convertStyleToAttrs: true }, { convertTransform: true }, { mergePaths: true }, { moveElemsAttrsToGroup: true }, { moveGroupAttrsToElems: true }, { removeAttrs: { attrs: '(stroke|fill)' } }, { removeComments: true }, { removeDesc: true }, { removeDimensions: true }, { removeEditorsNSData: true }, { removeEmptyAttrs: true }, { removeEmptyContainers: true }, { removeEmptyText: true }, { removeHiddenElems: true }, { removeMetadata: true }, { removeNonInheritableGroupAttrs: true }, { removeRasterImages: false }, { removeTitle: true }, { removeUnknownsAndDefaults: true }, { removeUnusedNS: true }, { removeUselessStrokeAndFill: true }, { removeViewBox: false }, { removeXMLProcInst: true }, { sortAttrs: true }, { transformsWithOnePath: false }]
};

const cwd = fs.realpathSync(process.cwd());

async function optimizeSvgFiles(opts) {
  const { input, outputFile, svgOptions: svgOptions$$1 } = opts;
  const svgo = new SVGO(svgOptions$$1);
  const svgFiles = glob.sync(`${input}/*.svg`);

  return await Promise.all(svgFiles.map(async file => {
    const svgFile = fs.readFileSync(file);
    const { data: svgOptimized } = await svgo.optimize(svgFile);
    const optimizedSvgFile = new File({
      cwd: cwd,
      path: outputFile,
      contents: Buffer.from(svgOptimized, 'utf8')
    });
    return optimizedSvgFile;
  }));
}

/**
 * Recursively creates a directories until the target exists
 * @param {String} targetDir
 */
function ensureTargetExists(targetDir) {
  return targetDir.split('/').reduce((acc, curr) => {
    const newDir = `${acc}/${curr}`;
    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir);
    }
    return newDir;
  });
}

function parseOptions(options) {
  const argv = typeof window === 'undefined' ? require('yargs').argv : {};
  const { input, output, svgOptions: svgOptions$$1 } = Object.assign({ svgOptions: svgOptions }, options, argv);
  if (!input) {
    throw new Error('"input" is a required option. Please set the location of the svg files to be spritified');
  }
  const outputFile = path.resolve(cwd, output);
  return {
    input: path.resolve(cwd, input.replace(/\/$/, '')),
    shouldCreateFile: !!output,
    outputDir: path.dirname(outputFile),
    outputFile,
    svgOptions: svgOptions$$1
  };
}

/**
 * Creates and SVG sprite
 */
async function makeSvgSprite(options = {}) {
  const opts = parseOptions(options);
  const optimizedSvgFiles = await optimizeSvgFiles(opts);
  const spriterConfig = {
    dest: opts.outputDir,
    mode: {
      symbol: {
        inline: true
      }
    }
  };
  const spriter = new SVGSpriter(spriterConfig);
  optimizedSvgFiles.forEach(optimizedSvgFile => spriter.add(optimizedSvgFile));
  return new Promise((resolve, reject) => {
    spriter.compile((error, result) => {
      const { symbol: { sprite } } = result;
      if (error) {
        reject(error);
      }
      if (opts.shouldCreateFile) {
        ensureTargetExists(opts.outputDir);
        resolve(fs.writeFileSync(opts.outputFile, sprite.contents));
      } else {
        resolve(sprite.contents);
      }
    });
  });
}

var index = makeSvgSprite();

exports.makeSvgSprite = makeSvgSprite;
exports.default = index;
