import InlineEdit from '@anticrm/sparkling-controls/src/InlineEdit.svelte'
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

export const NotEditable = Template.bind({})
NotEditable.args = {
  placeholder: 'Don\'t edit text here',
  editable: false
}

export const FullWidth = Template.bind({})
FullWidth.args = {
  placeholder: 'Edit text here',
  fullWidth: true
}
