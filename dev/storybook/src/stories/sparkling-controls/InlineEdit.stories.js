import InlineEdit from './InlineEdit.svelte'
import ThemeDecorator from '../ThemeDecorator.svelte'

export default {
  title: 'Platform/InlineEdit',
  component: InlineEdit,
  argTypes: {
    maxWidth: { control: 'number' },
    value: { control: 'text' },
    placeholder: { control: 'text' },
    fullWidth: { control: 'boolean' },
    editable: { control: 'boolean' },
    onChange: { action: 'onChange' }
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

const Template = ({ onChange, ...args }) => ({
  Component: InlineEdit,
  props: { ...args },
  on: {
    change: onChange
  }
})

export const Default = Template.bind({})
Default.args = {
  placeholder: 'Edit text here'
}

export const FullWidth = Template.bind({})
FullWidth.args = {
  placeholder: 'Edit text here',
  fullWidth: true
}
