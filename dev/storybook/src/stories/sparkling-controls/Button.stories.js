import Button from './Button.svelte'
import ThemeDecorator from '../ThemeDecorator.svelte'

export default {
  title: 'Platform/Button',
  component: Button,
  argTypes: {
    size: {
      control: { type: 'select', options: ['small', 'default', 'large'] }
    },
    kind: {
      control: { type: 'select', options: ['primary', 'default', 'transparent'] }
    },
    width: { control: 'text' },
    label: { control: 'text' },
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

export const Primary = Template.bind({})
Primary.args = {
  label: 'Button',
  kind: 'primary'
}

export const Secondary = Template.bind({})
Secondary.args = {
  label: 'Button'
}

export const Large = Template.bind({})
Large.args = {
  label: 'Button',
  size: 'large'
}

export const Small = Template.bind({})
Small.args = {
  label: 'Button',
  size: 'small'
}

export const Transparent = Template.bind({})
Transparent.args = {
  label: 'Button',
  kind: 'transparent'
}
