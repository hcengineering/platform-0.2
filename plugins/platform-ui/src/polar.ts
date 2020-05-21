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

import {
  Scene, WebGLRenderer, PCFShadowMap, FogExp2, SphereGeometry,
  MeshBasicMaterial, Color, Mesh, PointLight, DirectionalLight,
  MeshPhongMaterial, PlaneGeometry
} from 'three'

export function createGl () {

  const scene = new Scene();

  const renderer = new WebGLRenderer({
    // alpha: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMapEnabled = true; //Shadow
  renderer.shadowMapType = PCFShadowMap; //Shadow
  document.getElementById('container')?.appendChild(renderer.domElement)

  // scene.fog = new FogExp2("black", 0.0075)


  //=========================================================================================== light
  var sphereLight = new SphereGeometry(.05);
  var sphereLightMaterial = new MeshBasicMaterial({
    color: new Color("white")
  });
  var sphereLightMesh = new Mesh(sphereLight, sphereLightMaterial);
  sphereLightMesh.castShadow = true;
  sphereLightMesh.position.set(0, 2.5, 0)
  scene.add(sphereLightMesh);


  var distance = 10;
  var intensity = 2.5;

  var pointLight2 = new PointLight(new Color('white'), intensity / 4, distance);
  pointLight2.position.set(0, 0, -10.5);
  scene.add(pointLight2);


  var pointLight3 = new PointLight(new Color('#02a0ac'), intensity, distance);
  pointLight3.position.set(0, 0, 5);
  scene.add(pointLight3);


  var pointLight4 = new PointLight(new Color('purple'), intensity, distance);
  pointLight4.position.set(0, 0, 2.5);
  scene.add(pointLight4);



  var light = new DirectionalLight(new Color('white'), 400);
  light.position.set(0, .10, 4);      //push ligth back to cast shadow
  light.castShadow = true;
  scene.add(light);

  //Set up shadow properties for the light
  light.shadow.mapSize.width = 512;  // default
  light.shadow.mapSize.height = 512; // default
  light.shadow.camera.near = 0.5;    // default
  light.shadow.camera.far = 500;     // default

  var groundMaterial = new MeshPhongMaterial({
    color: new Color('#fff'),
    specular: new Color('skyblue'),
    shininess: 50,
  });
  var groundGeo = new PlaneGeometry(200, 200);
  var ground = new Mesh(groundGeo, groundMaterial);

  ground.position.set(0, 0, 0);
  ground.rotation.x = (-Math.PI / 2);
  ground.receiveShadow = true;
  scene.add(ground);

  return renderer

}