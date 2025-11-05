/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'line-green': '#06c755',
                'line-green-dark': '#05b34a',
            },
            fontFamily: {
                'sans': ['Prompt', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-to-r': 'linear-gradient(to right, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
}
