
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  themes: {
    default: 'Dark',
    list: [
      { name: 'Dark', class: 'theme-dark', color: '#18181e' },
      { name: 'Grey', class: 'theme-grey', color: '#393844' },
      { name: 'Light', class: 'theme-light', color: '#fff' }
    ],
  },
  backgrounds: {
    values: [
      { name: 'Dark', value: '#18181e' },
      { name: 'Grey', value: '#393844' },
      { name: 'Light', value: '#fff' }
    ]
  }
}