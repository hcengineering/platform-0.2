import ToolbarPage from './components/internal/toolbar.svelte'
import RefInputPage from './components/internal/ReferenceInput.svelte'

export interface GuideBookPage {
  id: string
  label: string
  component: any
  level: number
}

export const pages: GuideBookPage[] = []
export const pageIndex: Map<string, GuideBookPage> = new Map()

// ****************************************************************
// Components
// ****************************************************************

function addPage(page: GuideBookPage) {
  pages.push(page)
  pageIndex.set(page.id, page)
}

addPage({
  id: 'toolbar',
  label: 'Toolbar',
  level: 0,
  component: ToolbarPage
} as GuideBookPage)
// addPage({ id: 'buttons', label: 'Styles', level: 1, component: ButtonsPage } as GuideBookPage)
addPage({
  id: 'ref.input',
  label: 'Reference input',
  level: 0,
  component: RefInputPage
} as GuideBookPage)
