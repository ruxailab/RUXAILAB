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
    'on-surface': '#1F2937'
  },
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'myCustomLightTheme',
    themes: {
      myCustomLightTheme,
    },
  }
})
