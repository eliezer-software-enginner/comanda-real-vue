import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Ícones Material Design
import '@mdi/font/css/materialdesignicons.css'

// Tema personalizado
import { foodFacilTheme } from '@/themes'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'foodFacilTheme',
    themes: {
      foodFacilTheme,
    },
  },
})

export default vuetify
