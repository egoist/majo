export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'cjs'
  },
  plugins: [
    require('rollup-plugin-typescript2')({
      tsconfigOverride: {
        compilerOptions: {
          module: 'esnext',
          declaration: true
        },
        include: ['src']
      }
    })
  ]
}
