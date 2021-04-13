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
  weekFormat: 'short',
  selectedDate: new Date(2020, 4, 1)
}

export const SelectedDay = Template.bind({})
SelectedDay.args = {
  weekFormat: 'short',
  selectedDate: new Date(2020, 4, 1)
}

export const MondayFirst = Template.bind({})
MondayFirst.args = {
  mondayStart: true,
  weekFormat: 'short',
  selectedDate: new Date(2020, 4, 1)
}

export const TomorrowSelected = Template.bind({})
TomorrowSelected.args = {
  mondayStart: true,
  weekFormat: 'long',
  selectedDate: new Date(new Date(2020, 4, 1) - 86400000)
}
