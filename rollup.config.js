import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'

export default {
  input: 'src/index.js',
  output: {
    file: 'lib/index.js',
    format: 'cjs',
  },
  plugins: [
    commonjs({
      include: ['node_modules/**'],
    }),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
}
