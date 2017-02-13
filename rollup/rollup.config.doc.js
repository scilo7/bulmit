import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import buble from 'rollup-plugin-buble'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  entry: 'docs/index.es6.js',
  dest: 'docs/index.js',
  format: 'iife',
  moduleName: 'docs',
  plugins: [
    buble(),
    resolve({browser: true, main: true}),
    commonjs()
  ]
}
