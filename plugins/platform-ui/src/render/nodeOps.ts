
import { Scene } from 'three'
import { CSS3DObject } from '../lib/CSS3DRenderer.js'

import { RendererOptions } from '@vue/runtime-core'

export const svgNS = 'http://www.w3.org/2000/svg'

const doc = (typeof document !== 'undefined' ? document : null) as Document

let tempContainer: HTMLElement
let tempSVGContainer: SVGElement

export const scene = new Scene()

const objects = new Array()

export const nodeOps: Omit<RendererOptions<Node, Element>, 'patchProp'> = {
  insert: (child, parent, anchor) => {
    console.log('insert')
    console.log(child)
    console.log(parent)
    console.log(anchor)
    if (parent.id === 'app') {
      console.log('Skip!')
      return
    }
    if (anchor) {
      parent.insertBefore(child, anchor)
    } else {
      parent.appendChild(child)
    }
  },

  remove: child => {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },

  createElement: (tag, isSVG, is): Element => {
    console.log('createElement: ' + tag)
    if (tag === 'css3DObject') {
      console.log('here')
      const element = document.createElement('div')
      element.className = 'element'
      element.style.backgroundColor = 'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')'

      let object = new CSS3DObject(element)
      object.position.x = 0//Math.random() * 4000 - 2000
      object.position.y = 0//Math.random() * 4000 - 2000
      object.position.z = 0//Math.random() * 4000 - 2000
      scene.add(object)

      objects.push(object)


      return element
    }
    return isSVG
      ? doc.createElementNS(svgNS, tag)
      : doc.createElement(tag, is ? { is } : undefined)
  },

  createText: text => doc.createTextNode(text),

  createComment: text => doc.createComment(text),

  setText: (node, text) => {
    node.nodeValue = text
  },

  setElementText: (el, text) => {
    el.textContent = text
  },

  parentNode: node => node.parentNode as Element | null,

  nextSibling: node => node.nextSibling,

  querySelector: selector => doc.querySelector(selector),

  setScopeId (el, id) {
    el.setAttribute(id, '')
  },

  cloneNode (el) {
    return el.cloneNode(true)
  },

  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent (content, parent, anchor, isSVG) {
    const temp = isSVG
      ? tempSVGContainer ||
      (tempSVGContainer = doc.createElementNS(svgNS, 'svg'))
      : tempContainer || (tempContainer = doc.createElement('div'))
    temp.innerHTML = content
    const first = temp.firstChild as Element
    let node: Element | null = first
    let last: Element = node
    while (node) {
      last = node
      nodeOps.insert(node, parent, anchor)
      node = temp.firstChild as Element
    }
    return [first, last]
  }
}
