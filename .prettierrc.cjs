/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  trailingComma: 'es5',
  singleQuote: true,
  plugins: ['prettier-plugin-tailwindcss'],
}

module.exports = config
