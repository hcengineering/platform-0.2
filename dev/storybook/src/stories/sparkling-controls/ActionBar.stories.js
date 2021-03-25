import ActionBar from './ActionBar.svelte'
import ThemeDecorator from '../ThemeDecorator.svelte'

export default {
  title: 'Platform/ActionBar',
  component: ActionBar,
  argTypes: {
    actions: { control: 'array' },
    onTop: { control: 'number' }
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
  Component: ActionBar,
  props: {
    actions: [{
      label: 'Action Item 1', action: () => alert('PopupItem1.Action()')
    }, {
      label: 'Action Item 2', action: () => alert('PopupItem2.Action()')
    }, {
      label: 'Action Item 3', action: () => alert('PopupItem3.Action()')
    }, {
      label: '-'
    }, {
      label: 'Action Item 4', action: () => alert('PopupItem4.Action()')
    }],
    ...args
  }
})

export const Default = Template.bind({})
Default.args = {
  onTop: 2
}
