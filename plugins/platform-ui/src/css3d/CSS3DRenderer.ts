
/**
 * Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs
 * @author mrdoob / http://mrdoob.com/
 * @author yomotsu / https://yomotsu.net/
 */

import {
  Matrix4,
  Object3D,
  Scene,
  Camera
} from "three"

class CSS3DObject extends Object3D {
  element: HTMLElement

  constructor(element: HTMLElement) {
    super()
    this.element = element
    this.element.style.position = 'absolute'
    this.element.style.pointerEvents = 'auto'
  }
}

class CSS3DSprite extends CSS3DObject {
  constructor(element: HTMLElement) {
    super(element)
  }
}

//

class CSS3DRenderer {

  domElement: HTMLElement
  cameraElement: HTMLElement

  widthHalf!: number
  heightHalf!: number

  matrix = new Matrix4()

  cache = {
    camera: { fov: 0, style: '' },
    objects: new WeakMap()
  }

  constructor() {

    this.domElement = document.createElement('div')
    this.domElement.style.overflow = 'hidden'

    this.cameraElement = document.createElement('div')

    this.cameraElement.style.transformStyle = 'preserve-3d'
    this.cameraElement.style.pointerEvents = 'none'

    this.domElement.appendChild(this.cameraElement)
  }

  setSize (width: number, height: number) {

    this.widthHalf = width / 2
    this.heightHalf = height / 2

    this.domElement.style.width = width + 'px'
    this.domElement.style.height = height + 'px'

    this.cameraElement.style.width = width + 'px'
    this.cameraElement.style.height = height + 'px'

  }

  renderObject (object: any, scene: any, camera: any, cameraCSSMatrix: string) {

    console.log('render object')
    console.log(object)
    console.log(scene)

    if (object instanceof CSS3DObject) {

      object.onBeforeRender(this as any, scene, camera, undefined as any, undefined as any, undefined as any)

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

        style = getObjectCSSMatrix(this.matrix, cameraCSSMatrix)

      } else {

        style = getObjectCSSMatrix(object.matrixWorld, cameraCSSMatrix)

      }

      var element = object.element
      var cachedObject = this.cache.objects.get(object)

      if (cachedObject === undefined || cachedObject.style !== style) {

        element.style.transform = style

        var objectData = { style: style }

        this.cache.objects.set(object, objectData)

      }

      element.style.display = object.visible ? '' : 'none'

      if (element.parentNode !== this.cameraElement) {

        this.cameraElement.appendChild(element)

      }

      object.onAfterRender(this as any, scene, camera, undefined as any, undefined as any, undefined as any)

    }

    for (var i = 0, l = object.children.length; i < l; i++) {

      this.renderObject(object.children[i], scene, camera, cameraCSSMatrix)

    }

  }

  render (scene: Scene, camera: any) {

    var fov = camera.projectionMatrix.elements[5] * this.heightHalf

    if (this.cache.camera.fov !== fov) {

      if (camera.isPerspectiveCamera) {

        this.domElement.style.perspective = fov + 'px'

      } else {

        this.domElement.style.perspective = ''

      }

      this.cache.camera.fov = fov

    }

    if (scene.autoUpdate === true) scene.updateMatrixWorld()
    if (camera.parent === null) camera.updateMatrixWorld()

    if (camera.isOrthographicCamera) {

      var tx = - (camera.right + camera.left) / 2
      var ty = (camera.top + camera.bottom) / 2

    }

    var cameraCSSMatrix = camera.isOrthographicCamera ?
      'scale(' + fov + ')' + 'translate(' + epsilon(tx) + 'px,' + epsilon(ty) + 'px)' + getCameraCSSMatrix(camera.matrixWorldInverse) :
      'translateZ(' + fov + 'px)' + getCameraCSSMatrix(camera.matrixWorldInverse)

    var style = cameraCSSMatrix +
      'translate(' + this.widthHalf + 'px,' + this.heightHalf + 'px)'

    if (this.cache.camera.style !== style) {

      this.cameraElement.style.transform = style

      this.cache.camera.style = style

    }

    this.renderObject(scene, scene, camera, cameraCSSMatrix)

  }

}

function epsilon (value) {

  return Math.abs(value) < 1e-10 ? 0 : value

}

function getCameraCSSMatrix (matrix) {

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

function getObjectCSSMatrix (matrix, cameraCSSMatrix) {

  var elements = matrix.elements
  var matrix3d = 'matrix3d(' +
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