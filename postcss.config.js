export default async (ctx) => ({
  plugins: {
    'postcss-nesting': await import('postcss-nesting'),
    tailwindcss: {},
    autoprefixer: {},
  },
})
