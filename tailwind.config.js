/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            keyframes: {
                'sheet-up': {
                    from: { transform: 'translateY(100%)' },
                    to: { transform: 'translateY(0)' },
                },
            },
            animation: {
                'sheet-up': 'sheet-up 240ms cubic-bezier(0.32, 0.72, 0, 1)',
            },
        },
    },
    plugins: [],
}
