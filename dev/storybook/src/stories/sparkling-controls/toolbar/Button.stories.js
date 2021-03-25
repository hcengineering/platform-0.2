import Button from './Button.svelte'
import ThemeDecorator from '../../ThemeDecorator.svelte'

export default {
  title: 'Platform/Toolbar/Button',
  component: Button,
  argTypes: {
    label: { control: 'text' },
    style: { control: 'text' },
    disabled: { control: 'boolean' },
    selected: { control: 'boolean' },
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
  Component: Button,
  props: { ...args },
  on: {
    click: onClick
  }
})

export const Default = Template.bind({})
Default.args = {
  label: 'TB Button'
}

export const Selected = Template.bind({})
Selected.args = {
  label: 'TB Button',
  selected: true
}

export const Disabled = Template.bind({})
Disabled.args = {
  label: 'TB Button',
  disabled: true
}
