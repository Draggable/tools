import fs from 'fs'
import path from 'path'
import SVGO from 'svgo'
import glob from 'glob'
import File from 'vinyl'
import SVGSpriter from 'svg-sprite'
import defaultSvgOptions from './svgOptions'
const cwd = fs.realpathSync(process.cwd())

async function optimizeSvgFiles(opts) {
  const { input, outputFile, svgOptions } = opts
  const svgo = new SVGO(svgOptions)
  const svgFiles = glob.sync(`${input}/*.svg`)

  return await Promise.all(
    svgFiles.map(async file => {
      const svgFile = fs.readFileSync(file)
      const { data: svgOptimized } = await svgo.optimize(svgFile)
      const optimizedSvgFile = new File({
        cwd: cwd,
        path: outputFile,
        contents: Buffer.from(svgOptimized, 'utf8'),
      })
      return optimizedSvgFile
    })
  )
}

/**
 * Recursively creates a directories until the target exists
 * @param {String} targetDir
 */
function ensureTargetExists(targetDir) {
  return targetDir.split('/').reduce((acc, curr) => {
    const newDir = `${acc}/${curr}`
    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir)
    }
    return newDir
  })
}

function parseOptions(options) {
  const argv = typeof window === 'undefined' ? require('yargs').argv : {}
  const { input, output, svgOptions } = Object.assign({ svgOptions: defaultSvgOptions }, options, argv)
  if (!input) {
    throw new Error('"input" is a required option. Please set the location of the svg files to be spritified')
  }
  const outputFile = path.resolve(cwd, output)
  return {
    input: path.resolve(cwd, input.replace(/\/$/, '')),
    shouldCreateFile: !!output,
    outputDir: path.dirname(outputFile),
    outputFile,
    svgOptions,
  }
}

/**
 * Creates and SVG sprite
 */
export async function makeSvgSprite(options = {}) {
  const opts = parseOptions(options)
  const optimizedSvgFiles = await optimizeSvgFiles(opts)
  const spriterConfig = {
    dest: opts.outputDir,
    mode: {
      symbol: {
        inline: true,
      },
    },
  }
  const spriter = new SVGSpriter(spriterConfig)
  optimizedSvgFiles.forEach(optimizedSvgFile => spriter.add(optimizedSvgFile))
  return new Promise((resolve, reject) => {
    spriter.compile((error, result) => {
      const { symbol: { sprite } } = result
      if (error) {
        reject(error)
      }
      if (opts.shouldCreateFile) {
        ensureTargetExists(opts.outputDir)
        resolve(fs.writeFileSync(opts.outputFile, sprite.contents))
      } else {
        resolve(sprite.contents)
      }
    })
  })
}

export default makeSvgSprite()
