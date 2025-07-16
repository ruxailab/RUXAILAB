import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { VTimePicker } from 'vuetify/lib/labs/VTimePicker'

export default createVuetify({
  components: {
    ...components,
    VTimePicker,
  },
  directives,
})
