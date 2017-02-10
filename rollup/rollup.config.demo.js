import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import buble from 'rollup-plugin-buble'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  entry: 'demo/index.es6.js',
  dest: 'demo/index.js',
  format: 'iife',
  sourceMap: 'inline',
  moduleName: 'demo',
  plugins: [
    buble(),
    resolve({browser: true, main: true}),
    commonjs()
  ]
}
