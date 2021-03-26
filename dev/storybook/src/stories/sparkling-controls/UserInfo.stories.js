import UserInfo from './UserInfo.svelte'
import ThemeDecorator from '../ThemeDecorator.svelte'

export default {
  title: 'Platform/UserInfo',
  component: UserInfo,
  argTypes: {
    url: { control: 'text' },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    color: { control: 'color' },
    userColor: { control: 'color' },
    subtitleOnTop: { control: 'boolean' }
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
  Component: UserInfo,
  props: { ...args }
})

export const Default = Template.bind({})
Default.args = {
  url: 'https://platform.exhale24.ru/images/photo-1.png',
  title: 'User Name'
}

export const WithSubtitle = Template.bind({})
WithSubtitle.args = {
  url: 'https://platform.exhale24.ru/images/photo-1.png',
  title: 'User Name',
  subtitle: 'Designer'
}

export const SubtitleOnTop = Template.bind({})
SubtitleOnTop.args = {
  url: 'https://platform.exhale24.ru/images/photo-1.png',
  title: 'User Name',
  subtitle: 'Designer',
  subtitleOnTop: true
}
