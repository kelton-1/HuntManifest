# Theme & Design Tokens

## Fonts

- **Heading font:** Outfit (Google Font) → `--font-heading`
- **Body font:** Plus Jakarta Sans (Google Font) → `--font-body`
- Tailwind `font-sans` maps to `var(--font-geist-sans)` (fallback system-ui)
- Tailwind `font-mono` maps to `var(--font-geist-mono)`

## Tailwind Config

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'mallard-green': '#0B3D2E',
                'mallard-green-light': '#166653',
                'mallard-yellow': '#F5B800',
                'mallard-yellow-light': '#FFD54F',
                'sky-dawn': '#1e3a5f',
                'sky-morning': '#3b82f6',
                'water-blue': '#0ea5e9',
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                card: 'var(--card)',
                'card-foreground': 'var(--card-foreground)',
                popover: 'var(--popover)',
                'popover-foreground': 'var(--popover-foreground)',
                primary: 'var(--primary)',
                'primary-foreground': 'var(--primary-foreground)',
                secondary: 'var(--secondary)',
                'secondary-foreground': 'var(--secondary-foreground)',
                muted: 'var(--muted)',
                'muted-foreground': 'var(--muted-foreground)',
                accent: 'var(--accent)',
                'accent-foreground': 'var(--accent-foreground)',
                destructive: 'var(--destructive)',
                'destructive-foreground': 'var(--destructive-foreground)',
                border: 'var(--border)',
                input: 'var(--input)',
                ring: 'var(--ring)',
            },
            fontFamily: {
                sans: ['var(--font-geist-sans)', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['var(--font-geist-mono)', 'monospace'],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
                xl: 'calc(var(--radius) + 4px)',
                '2xl': 'calc(var(--radius) + 8px)',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(11, 61, 46, 0.15)',
                'glow-yellow': '0 0 20px rgba(245, 184, 0, 0.15)',
            },
            animation: {
                'pulse-soft': 'pulse-soft 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 4s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'slide-up': 'slide-up 0.4s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
            },
            keyframes: {
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-4px)' },
                },
                'glow': {
                    from: { boxShadow: '0 0 10px rgba(245, 184, 0, 0.3)' },
                    to: { boxShadow: '0 0 20px rgba(245, 184, 0, 0.5)' },
                },
                'slide-up': {
                    from: { opacity: '0', transform: 'translateY(10px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};
```

## CSS Variables (globals.css)

### Light Mode (`:root`)

```css
:root {
  --background: #fafbfc;
  --foreground: #0f172a;

  --mallard-green: #0B3D2E;
  --mallard-green-light: #166653;
  --mallard-yellow: #F5B800;
  --mallard-yellow-light: #FFD54F;
  --mallard-accent: #F5B800;

  --sky-dawn: #1e3a5f;
  --sky-morning: #3b82f6;
  --water-blue: #0ea5e9;

  --card: #ffffff;
  --card-foreground: #0f172a;
  --popover: #ffffff;
  --popover-foreground: #0f172a;
  --primary: var(--mallard-green);       /* Green in light mode */
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --secondary-foreground: #475569;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --accent: #ecfdf5;
  --accent-foreground: var(--mallard-green);
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #e2e8f0;
  --input: #e2e8f0;
  --ring: var(--mallard-green);
  --radius: 0.75rem;

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-glow: 0 0 20px rgba(11, 61, 46, 0.15);
}
```

### Dark Mode (`.dark`)

```css
.dark {
  --background: #0B0E14;
  --foreground: #E8ECF1;

  --card: #141820;
  --card-foreground: #E8ECF1;
  --popover: #141820;
  --popover-foreground: #E8ECF1;
  --primary: var(--mallard-yellow);       /* Yellow in dark mode */
  --primary-foreground: #0a0f1a;
  --secondary: #1C2030;
  --secondary-foreground: #CBD5E1;
  --muted: #1C2030;
  --muted-foreground: #7B8794;
  --accent: #162420;
  --accent-foreground: var(--mallard-yellow);
  --destructive: #991b1b;
  --destructive-foreground: #fef2f2;
  --border: #1E2536;
  --input: #1C2030;
  --ring: var(--mallard-yellow);

  --card-elevated: #1A1F2A;
  --card-elevated-border: #252D3C;

  --sky-dawn: #0B1120;
  --sky-morning: #162A4A;

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow: 0 2px 4px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 8px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 12px 20px -4px rgb(0 0 0 / 0.4), 0 4px 8px -4px rgb(0 0 0 / 0.3);
  --shadow-xl: 0 24px 32px -6px rgb(0 0 0 / 0.4), 0 8px 12px -6px rgb(0 0 0 / 0.3);
  --shadow-glow: 0 0 24px rgba(245, 184, 0, 0.12);
  --shadow-glow-green: 0 0 24px rgba(22, 102, 83, 0.15);
}
```

## Full globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #fafbfc;
  --foreground: #0f172a;
  --mallard-green: #0B3D2E;
  --mallard-green-light: #166653;
  --mallard-yellow: #F5B800;
  --mallard-yellow-light: #FFD54F;
  --mallard-accent: #F5B800;
  --sky-dawn: #1e3a5f;
  --sky-morning: #3b82f6;
  --water-blue: #0ea5e9;
  --card: #ffffff;
  --card-foreground: #0f172a;
  --popover: #ffffff;
  --popover-foreground: #0f172a;
  --primary: var(--mallard-green);
  --primary-foreground: #ffffff;
  --secondary: #f1f5f9;
  --secondary-foreground: #475569;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --accent: #ecfdf5;
  --accent-foreground: var(--mallard-green);
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --border: #e2e8f0;
  --input: #e2e8f0;
  --ring: var(--mallard-green);
  --radius: 0.75rem;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-glow: 0 0 20px rgba(11, 61, 46, 0.15);
}

.dark {
  --background: #0B0E14;
  --foreground: #E8ECF1;
  --card: #141820;
  --card-foreground: #E8ECF1;
  --popover: #141820;
  --popover-foreground: #E8ECF1;
  --primary: var(--mallard-yellow);
  --primary-foreground: #0a0f1a;
  --secondary: #1C2030;
  --secondary-foreground: #CBD5E1;
  --muted: #1C2030;
  --muted-foreground: #7B8794;
  --accent: #162420;
  --accent-foreground: var(--mallard-yellow);
  --destructive: #991b1b;
  --destructive-foreground: #fef2f2;
  --border: #1E2536;
  --input: #1C2030;
  --ring: var(--mallard-yellow);
  --card-elevated: #1A1F2A;
  --card-elevated-border: #252D3C;
  --sky-dawn: #0B1120;
  --sky-morning: #162A4A;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow: 0 2px 4px 0 rgb(0 0 0 / 0.4), 0 1px 2px -1px rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 8px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 12px 20px -4px rgb(0 0 0 / 0.4), 0 4px 8px -4px rgb(0 0 0 / 0.3);
  --shadow-xl: 0 24px 32px -6px rgb(0 0 0 / 0.4), 0 8px 12px -6px rgb(0 0 0 / 0.3);
  --shadow-glow: 0 0 24px rgba(245, 184, 0, 0.12);
  --shadow-glow-green: 0 0 24px rgba(22, 102, 83, 0.15);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  -webkit-tap-highlight-color: transparent;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-body), system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.dark body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}

.dark body>* {
  position: relative;
  z-index: 1;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading), system-ui, -apple-system, sans-serif;
}

@layer utilities {
  .text-gradient-mallard {
    background: linear-gradient(135deg, var(--mallard-green), var(--mallard-green-light));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .text-gradient-gold {
    background: linear-gradient(135deg, var(--mallard-yellow), var(--mallard-yellow-light));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .bg-gradient-mallard {
    background: linear-gradient(135deg, var(--mallard-green), var(--mallard-green-light));
  }

  .bg-gradient-sky {
    background: linear-gradient(180deg, var(--sky-dawn) 0%, var(--sky-morning) 100%);
  }

  .bg-gradient-dawn {
    background: linear-gradient(135deg, #1e3a5f 0%, #3b82f6 50%, #0ea5e9 100%);
  }

  .glass {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .dark .glass {
    background: rgba(20, 24, 32, 0.82);
  }

  .glass-subtle {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }
  .dark .glass-subtle {
    background: rgba(20, 24, 32, 0.55);
  }

  .glass-section {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .dark .glass-section {
    background: rgba(22, 36, 32, 0.85);
  }

  .glass-nav {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(24px) saturate(1.8);
    -webkit-backdrop-filter: blur(24px) saturate(1.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  .dark .glass-nav {
    background: rgba(14, 18, 26, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.06);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  .dark .glass-card {
    background: rgba(22, 28, 38, 0.82);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .stat-tile {
    @apply glass-card rounded-xl p-3 flex flex-col gap-0.5 justify-center relative overflow-hidden;
  }
  .dark .stat-tile {
    background: rgba(22, 28, 38, 0.7);
  }

  .glass-weather {
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .dark .glass-weather {
    background: rgba(20, 24, 32, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.2);
  }

  .animate-shimmer {
    background: linear-gradient(90deg,
        rgba(255, 255, 255, 0.03) 25%,
        rgba(255, 255, 255, 0.08) 50%,
        rgba(255, 255, 255, 0.03) 75%);
    background-size: 200% 100%;
    animation: shimmer 2s infinite linear;
  }

  .card-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .card-hover:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .tap-highlight {
    transition: transform 0.15s ease, opacity 0.15s ease;
  }
  .tap-highlight:active {
    transform: scale(0.97);
    opacity: 0.9;
  }

  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}

@layer components {
  .btn-primary {
    @apply bg-gradient-mallard text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300;
  }
  .btn-primary:hover {
    @apply shadow-lg;
    transform: translateY(-1px);
  }
  .btn-primary:active {
    @apply shadow-md;
    transform: translateY(0);
  }

  .card {
    @apply bg-card rounded-xl border border-border shadow-sm transition-all duration-300;
  }
  .card:hover {
    @apply shadow-md;
  }

  .input {
    @apply w-full rounded-xl border border-input bg-background px-4 py-3 text-sm transition-all duration-200;
    @apply focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent;
    @apply placeholder:text-muted-foreground;
  }
  .input:focus {
    box-shadow: 0 0 0 4px rgba(11, 61, 46, 0.2), 0 0 12px rgba(11, 61, 46, 0.1);
    transform: translateY(-1px);
  }
  .dark .input:focus {
    box-shadow: 0 0 0 4px rgba(245, 184, 0, 0.2), 0 0 12px rgba(245, 184, 0, 0.1);
    transform: translateY(-1px);
  }

  .badge {
    @apply inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium;
  }
  .badge-primary { @apply bg-primary/10 text-primary; }
  .badge-secondary { @apply bg-secondary text-secondary-foreground; }
  .badge-success { @apply bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400; }
  .badge-warning { @apply bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400; }
  .badge-danger { @apply bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400; }
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```
