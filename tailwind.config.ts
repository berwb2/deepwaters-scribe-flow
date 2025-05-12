
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				serif: ['Playfair Display', 'serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				water: {
					light: '#D3E4FD',
					DEFAULT: '#33C3F0',
					deep: '#0EA5E9',
				},
				neutral: {
					light: '#EEEEF0',
					DEFAULT: '#8E9196',
					dark: '#555555',
				},
			},
			typography: (theme: any) => ({
				DEFAULT: {
					css: {
						color: theme('colors.foreground'),
						a: {
							color: theme('colors.water.deep'),
							'&:hover': {
								color: theme('colors.blue.600'),
							},
						},
						h1: {
							fontFamily: theme('fontFamily.serif'),
							fontWeight: '500',
							color: theme('colors.foreground'),
						},
						h2: {
							fontFamily: theme('fontFamily.serif'),
							fontWeight: '500',
							color: theme('colors.foreground'),
						},
						h3: {
							fontFamily: theme('fontFamily.serif'),
							fontWeight: '500',
							color: theme('colors.foreground'),
						},
						h4: {
							fontFamily: theme('fontFamily.serif'),
							fontWeight: '500',
							color: theme('colors.foreground'),
						},
						'ul > li::marker': {
							color: theme('colors.water.deep'),
						},
						'ol > li::marker': {
							color: theme('colors.water.deep'),
						},
						blockquote: {
							fontStyle: 'normal',
							borderLeftColor: theme('colors.water.light'),
							backgroundColor: theme('colors.water.light') + '20',
							padding: theme('spacing.4'),
							borderRadius: theme('borderRadius.md'),
						},
						code: {
							backgroundColor: theme('colors.muted.DEFAULT'),
							borderRadius: theme('borderRadius.sm'),
							padding: `${theme('spacing.1')} ${theme('spacing.2')}`,
							color: theme('colors.foreground'),
						},
					},
				},
			}),
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'wave': {
					'0%': { transform: 'translateX(0) translateZ(0) scaleY(1)' },
					'50%': { transform: 'translateX(-25%) translateZ(0) scaleY(0.8)' },
					'100%': { transform: 'translateX(-50%) translateZ(0) scaleY(1)' }
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'wave': 'wave 12s linear infinite',
				'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'water-texture': 'linear-gradient(to bottom right, #D3E4FD, #33C3F0, #0EA5E9)',
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
