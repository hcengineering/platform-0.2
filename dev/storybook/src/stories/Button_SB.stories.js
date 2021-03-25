import Button_SB from './Button_SB.svelte' // eslint-disable-line camelcase
import ThemeDecorator from './ThemeDecorator.svelte'

export default {
  title: 'Example/Button_SB',
  component: Button_SB,
  argTypes: {
    label: { control: 'text' },
    primary: { control: 'boolean' },
    backgroundColor: { control: 'color' },
    size: {
      control: { type: 'select', options: ['small', 'medium', 'large'] }
    },
    onClick: { action: 'onClick' }
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
  Component: Button_SB,
  props: args,
  on: {
    click: onClick
  }
})

export const Primary = Template.bind({})
Primary.args = {
  primary: true,
  label: 'Button'
}

export const Secondary = Template.bind({})
Secondary.args = {
  label: 'Button'
}

export const Large = Template.bind({})
Large.args = {
  size: 'large',
  label: 'Button'
}

export const Small = Template.bind({})
Small.args = {
  size: 'small',
  label: 'Button'
}
