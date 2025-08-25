import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const myCustomLightTheme = {
  dark: false,
  colors: {
    primary: '#00213F',
    secondary: '#FF425A',
    accent: '#F97316',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#22C55E',
    'on-surface': '#1F2937',
    excellent: '#4caf50',
    good: '#2196f3',
    ok: '#ff9800',
    poor: '#f44336',
    ternary: '#546e7a',
    forth: '#f5f7fa',
    testPrimary: '#3f51b5',
  },
}

export default createVuetify({
  components: {
    ...components,
  },
  directives,
  theme: {
    defaultTheme: 'myCustomLightTheme',
    themes: {
      myCustomLightTheme,
    },
  }
})
