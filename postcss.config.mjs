export default async () => ({
  plugins: {
    'postcss-nesting': (await import('postcss-nesting')).default,
    tailwindcss: (await import('tailwindcss')).default,
    autoprefixer: (await import('autoprefixer')).default,
  },
})