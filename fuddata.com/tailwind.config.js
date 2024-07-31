const plugin = require('tailwindcss/plugin')

module.exports = {
    content: ["dist/*.html"],
    theme: {
        fontFamily: {
            'sans': ['FamiljenGrotesk', 'Sans-Serif'],
            'serif': ['FamiljenGrotesk', 'Sans-Serif'],
            'mono': ['FamiljenGrotesk', 'Sans-Serif'],
            'textarea': ['FamiljenGrotesk', 'Sans-Serif'],
        },
        screens: {
            'sm': '450px',
            'md': '768px',
            'lg': '976px',
            'xl': '1280px',
            '2xl': '1536px'
        },
        container: {
            center: true,
            padding: "16px",
        },
        extend: {
            colors: {
                'brand-black': '#231F20',
                'brand-grey': '#E0E1E2',
                'brand-blue': '#055098',
                'brand-blue2': '#0771D7',
                'brand-yellow': '#D9962E',
                'brand-yellow2': '#EEAF4E',
            },
            opacity: {
                '55': '.55',
            }
        },
    },
    variants: {
        extend: {},
    },
    plugins: [
        plugin(function ({ addComponents }) {
            addComponents({
                '.btn': {
                    backgroundColor: '#D9962E',
                    color: '#E0E1E2',
                    '&:hover': {
                        backgroundColor: '#EEAF4E'
                    },
                    paddingBottom: '1px',
                    paddingTop: '1px',
                    paddingLeft: '13px',
                    paddingRight: '13px',
                    border: '0px',
                    borderRadius: '4px'
                }
            })
        })
    ]
}
