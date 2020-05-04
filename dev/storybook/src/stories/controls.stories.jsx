import { action } from '@storybook/addon-actions'

import Theme from '../components/Theme.vue'
import Button from '@anticrm/platform-ui-controls/src/Button.vue'

export default {
  title: 'Controls'
}

export const button = () => ({
  render() {
    return <Theme><Button on-click={action('clicked')}>Hello Button</Button></Theme>
  }
})
