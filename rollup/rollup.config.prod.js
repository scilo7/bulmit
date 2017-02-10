import buble from 'rollup-plugin-buble'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'

export default {
  entry: 'src/index.js',
  dest: 'build/bulmit.min.js',
  // format: 'es',
  sourceMap: 'inline',
  moduleName: 'bulmit',
  plugins: [
    buble(),
    resolve({browser: true, main: true}),
    commonjs(),
    // uglify()
  ],
  external: ['mithril']
}
