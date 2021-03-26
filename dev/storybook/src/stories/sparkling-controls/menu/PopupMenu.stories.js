import PopupMenu from './PopupMenu.svelte'
import ThemeDecorator from '../../ThemeDecorator.svelte'

export default {
  title: 'Platform/Menu/PopupMenu',
  component: PopupMenu,
  argTypes: {
    label: { control: 'text' },
    size: {
      control: { type: 'select', options: ['small', 'default', 'large'] }
    },
    kind: {
      control: { type: 'select', options: ['primary', 'default', 'transparent'] }
    },
    items: { control: 'array' },
    width: { control: 'number' },
    visible: { control: 'boolean' }
  },
  parameters: {
    backgrounds: {
      values: [
        { name: 'light', value: '#fff' },
        { name: 'dark', value: '#1E1E1E' },
        { name: 'biege', value: '#FDF1E6' }
      ]
    }
  },
  decorators: [(storyFn) => {
    const story = storyFn()

    return {
      Component: ThemeDecorator,
      props: {
        child: story.Component,
        props: story.props
      }
    }
  }]
}

const Template = ({ ...args }) => ({
  Component: PopupMenu,
  props: {
    items: [{
      label: 'Popup Item 1', action: () => alert('PopupItem1.Action()')
    }, {
      label: 'Popup Item 2', action: () => alert('PopupItem2.Action()')
    }, {
      label: '-'
    }, {
      label: 'Popup Item 3', action: () => alert('PopupItem3.Action()')
    }],
    ...args
  }
})

export const Default = Template.bind({})
Default.args = {
  label: 'Click Me'
}

export const NormalButton = Template.bind({})
NormalButton.args = {
  label: 'Click Me',
  kind: 'primary'
}

export const SmallTransparent = Template.bind({})
SmallTransparent.args = {
  label: '+',
  size: 'small'
}
