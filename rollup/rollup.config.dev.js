// import serve from 'rollup-plugin-serve'
// import livereload from 'rollup-plugin-livereload'
import buble from 'rollup-plugin-buble'
// import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  entry: 'src/index.js',
  dest: 'build/bulmit.js',
  // format: 'iife',
  sourceMap: 'inline',
  moduleName: 'bulmit',
  plugins: [
    buble(),
    // resolve({browser: true, main: true}),
    commonjs()
  ],
  external: 'mithril'
}
