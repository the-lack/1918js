import { defineConfig } from 'vitepress'
import { groupIconMdPlugin, groupIconVitePlugin } from 'vitepress-plugin-group-icons'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "1918js",
  base: "/1918js/",
  description: "validation library for polish identifiers",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
   search: {
      provider: 'local'
    },
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Overview', link: '/overview' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'Error reference', link: '/error-reference' }
        ]
      }      
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/the-lack/1918js' }
    ]
  },
  markdown: {
    config(md) {
      md.use(groupIconMdPlugin)
    },
  },
  vite: {
    plugins: [
      groupIconVitePlugin()
    ],
  },
})
