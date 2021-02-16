const autoPreprocess = require('svelte-preprocess');

module.exports = ({ config, mode }) => {
  const svelteLoader = config.module.rules.find(
    r => r.loader && r.loader.includes('svelte-loader'),
  );
  svelteLoader.options.preprocess = autoPreprocess({
    less: { includePaths: ['src', 'node_modules'] },
    css: { includePaths: ['src', 'node_modules'] },
    typescript: {
      tsconfigFile: './tsconfig.json',
      transpileOnly: true,
    },
  });
  config.resolve.extensions.push('.ts', '.tsx');
  return config;
}
