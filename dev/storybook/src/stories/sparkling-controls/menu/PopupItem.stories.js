import PopupItem from './PopupItem.svelte'
import ThemeDecorator from '../../ThemeDecorator.svelte'

export default {
  title: 'Platform/Menu/PopupItem',
  component: PopupItem,
  argTypes: {
    label: { control: 'text' },
    separator: { control: 'boolean' },
    onClick: { action: 'onClick' }
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

const Template = ({ onClick, ...args }) => ({
  Component: PopupItem,
  props: { ...args },
  on: {
    click: onClick
  }
})

export const Default = Template.bind({})
Default.args = {
  label: 'Popup Item'
}

export const Separator = Template.bind({})
Separator.args = {
  separator: true
}
