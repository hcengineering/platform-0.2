import MonthCalendar from '@anticrm/sparkling-controls/src/calendar/MonthCalendar.svelte'
import ThemeDecorator from '../../ThemeDecorator.svelte'

export default {
  title: 'Platform/MonthCalendar/MonthCalendar',
  component: MonthCalendar,
  argTypes: {
    mondayStart: { control: 'boolean' },
    weekFormat: {
      control: { type: 'select', options: ['narrow', 'short', 'long'] }
    },
    selectedDate: { control: 'date' }
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
  Component: MonthCalendar,
  props: { ...args },
  on: {
    click: onClick
  }
})

export const Default = Template.bind({})
Default.args = {
  weekFormat: 'short'
}

export const SelectedDay = Template.bind({})
SelectedDay.args = {
  weekFormat: 'short',
  selectedDate: new Date
}

export const MondayFirst = Template.bind({})
MondayFirst.args = {
  mondayStart: true,
  weekFormat: 'short'
}

export const TomorrowSelected = Template.bind({})
TomorrowSelected.args = {
  mondayStart: true,
  weekFormat: 'long',
  selectedDate: new Date(new Date - 86400000)
}
