import ScrollView from './ScrollView.svelte'
import ThemeDecorator from '../ThemeDecorator.svelte'

export default {
  title: 'Platform/ScrollView',
  component: ScrollView,
  argTypes: {
    scrollPosition: { control: 'number' },
    autoscroll: { control: 'boolean' },
    accentColor: { control: 'boolean' },
    width: { control: 'text' },
    height: { control: 'text' },
    margin: { control: 'text' }
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
  Component: ScrollView,
  props: { ...args }
})

export const Default = Template.bind({})
Default.args = {
  width: '300px',
  height: '300px',
  content: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem beatae necessitatibus, accusantium exercitationem ipsa fugiat mollitia aperiam optio quae modi labore eos ipsum porro, placeat nisi commodi excepturi molestiae consequatur.
  Earum doloremque rem quibusdam natus velit fugiat quos repellat, eius impedit similique veritatis placeat ipsam esse tenetur ex mollitia numquam sequi reprehenderit beatae animi dicta. Rerum sint quo nihil necessitatibus?
  Similique aperiam, magni hic quasi blanditiis reprehenderit. Dolore sequi deleniti, tenetur voluptatibus itaque eum porro laborum quod tempora dolores voluptate rerum cumque blanditiis cupiditate sit velit laboriosam molestiae, perferendis architecto!
  Quam vel porro fugit commodi ab quaerat facere obcaecati voluptatum, iusto iure quisquam adipisci sapiente recusandae non perspiciatis voluptates sed id provident assumenda culpa autem blanditiis quibusdam? Autem, accusamus reprehenderit!
  Saepe quidem repellendus labore modi ullam eos tenetur quibusdam deleniti repellat nulla cumque deserunt fugit doloribus cum illum ratione fugiat distinctio inventore explicabo numquam repudiandae natus, odit et voluptas? Nemo.
  Cumque eos asperiores harum et, possimus, itaque quod doloribus repellat amet quasi aliquam cupiditate quis corrupti sequi tempora. Velit quidem nemo quae? Cupiditate officia ad inventore nam, incidunt assumenda molestiae.
  Voluptates reprehenderit repellat eligendi dignissimos ratione aliquid distinctio, dolorem eius alias laborum perferendis nihil ipsam quisquam! Sunt id in neque doloribus. Commodi labore facere sapiente dicta voluptate eaque necessitatibus animi.
  Molestias omnis quasi esse, vero rerum asperiores culpa distinctio commodi laudantium error dicta ullam earum, eveniet magnam harum porro adipisci vitae, fuga odit. Ducimus ex vitae facilis accusantium cupiditate corrupti?
  Enim labore sit corporis blanditiis aliquam nesciunt harum quas quae sapiente non officiis asperiores, quo, quasi nam repellendus laborum commodi nisi iure fuga autem. Quaerat voluptate sequi enim ut hic?
  Magnam saepe iusto voluptatibus nostrum quos eligendi suscipit minima iste, earum corrupti officiis molestias enim recusandae at aspernatur repudiandae praesentium, eveniet amet odio illum deserunt asperiores? Natus officia culpa et.`
}
