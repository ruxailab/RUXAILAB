import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const myCustomLightTheme = {
  dark: false,
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F97316',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#22C55E',
    'on-surface': '#1F2937',
    excellent: '#4caf50',
    good: '#2196f3',
    ok: '#ff9800',
    poor: '#f44336',
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
