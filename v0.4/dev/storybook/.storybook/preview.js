
import '!style-loader!css-loader!sass-loader!@anticrm/sparkling-theme/styles/global.scss';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  themes: {
    default: 'Dark',
    list: [
      { name: 'Dark', class: 'theme-dark', color: '#18181e' },
      { name: 'Grey', class: 'theme-grey', color: '#393844' },
      { name: 'Light', class: 'theme-light', color: '#fff' }
    ],
  }
}
