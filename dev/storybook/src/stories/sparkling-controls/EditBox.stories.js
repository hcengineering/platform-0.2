import EditBox from '@anticrm/sparkling-controls/src/EditBox.svelte'
import ThemeDecorator from '../ThemeDecorator.svelte'

export default {
  title: 'Platform/EditBox',
  component: EditBox,
  argTypes: {
    width: { control: 'text' },
    label: { control: 'text' },
    value: { control: 'text' },
    placeholder: { control: 'text' },
    id: { control: 'text' },
    hoverState: { control: 'boolean' },
    onInput: { action: 'onInput' },
    onFocus: { action: 'onFocus' },
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

const Template = ({ onInput, onFocus, onChange, ...args }) => ({
  Component: EditBox,
  props: { ...args },
  on: {
    input: onInput,
    focus: onFocus,
    change: onChange
  }
})

export const Default = Template.bind({})
Default.args = {
  placeholder: 'Edit text here'
}

export const Labeled = Template.bind({})
Labeled.args = {
  placeholder: 'Edit text here',
  label: 'Label',
  hoverState: false
}
