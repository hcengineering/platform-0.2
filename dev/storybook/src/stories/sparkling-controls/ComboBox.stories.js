import ComboBox from './ComboBox.svelte'
import ThemeDecorator from '../ThemeDecorator.svelte'

export default {
  title: 'Platform/ComboBox',
  component: ComboBox,
  argTypes: {
    items: { control: 'array' },
    selected: { control: 'number' },
    label: { control: 'text' },
    width: { control: 'text' }
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
  Component: ComboBox,
  props: { ...args }
})

export const Default = Template.bind({})
Default.args = {
  label: 'Label',
  selected: 0,
  items: [{
    id: 0, comboValue: 'Item 1'
  }, {
    id: 1, comboValue: 'Item 2'
  }, {
    id: 2, comboValue: 'Item 3'
  }, {
    id: 3, comboValue: 'Item 4'
  }, {
    id: 4, comboValue: 'Item 5'
  }, {
    id: 5, comboValue: 'Item 6'
  }, {
    id: 6, comboValue: 'Item 7'
  }]
}
