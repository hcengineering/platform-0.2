import { action } from '@storybook/addon-actions'

import Theme from '../components/Theme.vue'
import Button from '@anticrm/sparkling-controls/src/Button.vue'

export default {
  title: 'Controls'
}

export const withText = () => ({
  components: { Button, Theme },
  template: '<Theme><Button @click="action">Hello Button</Button></Theme>',
  methods: { action: action('clicked') }
})

export const withJSX = () => ({
  render() {
    return <Theme><Button onClick={action('clicked')}>With JSX</Button></Theme>;
  }
})
