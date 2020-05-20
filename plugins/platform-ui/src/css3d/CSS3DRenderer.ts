//
// Copyright © 2020 Anticrm Platform Contributors.
// 
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// 
// See the License for the specific language governing permissions and
// limitations under the License.
//

/**
 * Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs
 * @author mrdoob / http://mrdoob.com/
 * @author yomotsu / https://yomotsu.net/
 */

import {
  Matrix4,
  Object3D,
  Vector3,
  WebGLRenderer,
  WebGLRendererParameters,
  Geometry,
  Material,
  Group,
  Scene,
  Camera,
  PerspectiveCamera,
  OrthographicCamera
} from "three"

class CSS3DObject extends Object3D {
  element: HTMLElement

  constructor(element: HTMLElement) {
    super()
    this.element = element
  }
}

class CSS3DSprite extends CSS3DObject {
  constructor(element: HTMLElement) {
    super(element)
  }
}

// export const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000)
// camera.position.z = 1000

// export const scene = new THREE.Scene()


class CSS3DRenderer extends WebGLRenderer {

  private cameraElement: HTMLElement

  private width!: number
  private height!: number
  private widthHalf!: number
  private heightHalf!: number

  private matrix = new Matrix4()
  private cache = {
    camera: { fov: 0, style: '' },
    objects: new WeakMap()
  }

  constructor(parameters?: WebGLRendererParameters) {
    super(parameters)

    const domElement = document.createElement('div')
    domElement.style.overflow = 'hidden'

    this.domElement = domElement as any

    this.cameraElement = document.createElement('div')

    //cameraElement.style.WebkitTransformStyle = 'preserve-3d'
    this.cameraElement.style.transformStyle = 'preserve-3d'
    this.cameraElement.style.pointerEvents = 'none'

    this.domElement.appendChild(this.cameraElement)
  }

  setSize (width: number, height: number) {
    console.log('setSize: ' + width + ' ' + height)
    super.setSize(width, height)
    console.log('setSize: ' + width + ' ' + height)

    this.width = width
    this.height = height
    this.widthHalf = width / 2
    this.heightHalf = height / 2

    this.domElement.style.width = width + 'px'
    this.domElement.style.height = height + 'px'

    this.cameraElement.style.width = width + 'px'
    this.cameraElement.style.height = height + 'px'
  }

  renderObject (object: Object3D, scene: Scene, camera: Camera, cameraCSSMatrix: string) {

    if (object instanceof CSS3DObject) {

      object.onBeforeRender(this, scene, camera, undefined as unknown as Geometry, undefined as unknown as Material, undefined as unknown as Group)

      var style

      if (object instanceof CSS3DSprite) {

        // http://swiftcoder.wordpress.com/2008/11/25/constructing-a-billboard-matrix/

        this.matrix.copy(camera.matrixWorldInverse)
        this.matrix.transpose()
        this.matrix.copyPosition(object.matrixWorld)
        this.matrix.scale(object.scale)

        this.matrix.elements[3] = 0
        this.matrix.elements[7] = 0
        this.matrix.elements[11] = 0
        this.matrix.elements[15] = 1

        style = getObjectCSSMatrix(this.matrix)

      } else {

        style = getObjectCSSMatrix(object.matrixWorld)

      }

      var element = object.element
      var cachedObject = this.cache.objects.get(object)

      if (cachedObject === undefined || cachedObject.style !== style) {

        //element.style.WebkitTransform = style
        element.style.transform = style

        var objectData = { style: style }

        this.cache.objects.set(object, objectData)
      }

      element.style.display = object.visible ? '' : 'none'

      if (element.parentNode !== this.cameraElement) {

        this.cameraElement.appendChild(element)

      }

      object.onAfterRender(this, scene, camera, undefined as unknown as Geometry, undefined as unknown as Material, undefined as unknown as Group)

    }

    for (var i = 0, l = object.children.length; i < l; i++) {

      this.renderObject(object.children[i], scene, camera, cameraCSSMatrix)

    }


  }

  renderX (scene: Scene, camera: Camera) {

    console.log('rendering...')

    var fov = camera.projectionMatrix.elements[5] * this.heightHalf

    if (this.cache.camera.fov !== fov) {

      if (camera instanceof PerspectiveCamera) {

        this.domElement.style.perspective = fov + 'px'

      } else {

        this.domElement.style.perspective = ''

      }

      this.cache.camera.fov = fov

    }

    if (scene.autoUpdate === true) scene.updateMatrixWorld()
    if (camera.parent === null) camera.updateMatrixWorld()

    var cameraCSSMatrix = camera instanceof OrthographicCamera ?
      'scale(' + fov + ')' + 'translate(' + epsilon(- (camera.right + camera.left) / 2) + 'px,' +
      epsilon((camera.top + camera.bottom) / 2) + 'px)' + getCameraCSSMatrix(camera.matrixWorldInverse) :
      'translateZ(' + fov + 'px)' + getCameraCSSMatrix(camera.matrixWorldInverse)

    var style = cameraCSSMatrix +
      'translate(' + this.widthHalf + 'px,' + this.heightHalf + 'px)'


    if (this.cache.camera.style !== style) {

      this.cameraElement.style.transform = style
      this.cache.camera.style = style

    }

    this.renderObject(scene, scene, camera, cameraCSSMatrix)
  }

  x () { console.log('x') }

}

function epsilon (value: number) {
  return Math.abs(value) < 1e-10 ? 0 : value
}

function getCameraCSSMatrix (matrix: Matrix4) {

  var elements = matrix.elements

  return 'matrix3d(' +
    epsilon(elements[0]) + ',' +
    epsilon(- elements[1]) + ',' +
    epsilon(elements[2]) + ',' +
    epsilon(elements[3]) + ',' +
    epsilon(elements[4]) + ',' +
    epsilon(- elements[5]) + ',' +
    epsilon(elements[6]) + ',' +
    epsilon(elements[7]) + ',' +
    epsilon(elements[8]) + ',' +
    epsilon(- elements[9]) + ',' +
    epsilon(elements[10]) + ',' +
    epsilon(elements[11]) + ',' +
    epsilon(elements[12]) + ',' +
    epsilon(- elements[13]) + ',' +
    epsilon(elements[14]) + ',' +
    epsilon(elements[15]) +
    ')'

}

function getObjectCSSMatrix (matrix: Matrix4) {

  const elements = matrix.elements
  const matrix3d = 'matrix3d(' +
    epsilon(elements[0]) + ',' +
    epsilon(elements[1]) + ',' +
    epsilon(elements[2]) + ',' +
    epsilon(elements[3]) + ',' +
    epsilon(- elements[4]) + ',' +
    epsilon(- elements[5]) + ',' +
    epsilon(- elements[6]) + ',' +
    epsilon(- elements[7]) + ',' +
    epsilon(elements[8]) + ',' +
    epsilon(elements[9]) + ',' +
    epsilon(elements[10]) + ',' +
    epsilon(elements[11]) + ',' +
    epsilon(elements[12]) + ',' +
    epsilon(elements[13]) + ',' +
    epsilon(elements[14]) + ',' +
    epsilon(elements[15]) +
    ')'


  return 'translate(-50%,-50%)' + matrix3d

}

export { CSS3DObject, CSS3DSprite, CSS3DRenderer }