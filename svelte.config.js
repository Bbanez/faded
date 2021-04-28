const preprocess = require("svelte-preprocess");

module.exports = {
  preprocess: preprocess({
    scss: {
      includePaths: ["src"],
    },
    postcss: {
      plugins: [require("autoprefixer")],
    },
  }),
};
