<!--
  -
  - Copyright © 2020 Anticrm Platform Contributors.
  -
  - Licensed under the Eclipse Public License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License. You may
  - obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  -
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -
  -->

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { Vector3, Object3D as O3D } from 'three'

import Camera from './Camera.vue'
import Object3D from './Object3D.vue'

const table = [
  ["H", "Hydrogen", "1.00794", 1, 1,],
  ["He", "Helium", "4.002602", 18, 1,],
  ["Li", "Lithium", "6.941", 1, 2,],
  ["Be", "Beryllium", "9.012182", 2, 2,],
  ["B", "Boron", "10.811", 13, 2,],
  ["C", "Carbon", "12.0107", 14, 2,],
  ["N", "Nitrogen", "14.0067", 15, 2,],
  ["O", "Oxygen", "15.9994", 16, 2,],
  ["F", "Fluorine", "18.9984032", 17, 2,],
  ["Ne", "Neon", "20.1797", 18, 2,],
  ["Na", "Sodium", "22.98976...", 1, 3,],
  ["Mg", "Magnesium", "24.305", 2, 3,],
  ["Al", "Aluminium", "26.9815386", 13, 3,],
  ["Si", "Silicon", "28.0855", 14, 3,],
  ["P", "Phosphorus", "30.973762", 15, 3,],
  ["S", "Sulfur", "32.065", 16, 3,],
  ["Cl", "Chlorine", "35.453", 17, 3,],
  ["Ar", "Argon", "39.948", 18, 3,],
  ["K", "Potassium", "39.948", 1, 4,],
  ["Ca", "Calcium", "40.078", 2, 4,],
  ["Sc", "Scandium", "44.955912", 3, 4,],
  ["Ti", "Titanium", "47.867", 4, 4,],
  ["V", "Vanadium", "50.9415", 5, 4,],
  ["Cr", "Chromium", "51.9961", 6, 4,],
  ["Mn", "Manganese", "54.938045", 7, 4,],
  ["Fe", "Iron", "55.845", 8, 4,],
  ["Co", "Cobalt", "58.933195", 9, 4,],
  ["Ni", "Nickel", "58.6934", 10, 4,],
  ["Cu", "Copper", "63.546", 11, 4,],
  ["Zn", "Zinc", "65.38", 12, 4,],
  ["Ga", "Gallium", "69.723", 13, 4,],
  ["Ge", "Germanium", "72.63", 14, 4,],
  ["As", "Arsenic", "74.9216", 15, 4,],
  ["Se", "Selenium", "78.96", 16, 4,],
  ["Br", "Bromine", "79.904", 17, 4,],
  ["Kr", "Krypton", "83.798", 18, 4,],
  ["Rb", "Rubidium", "85.4678", 1, 5,],
  ["Sr", "Strontium", "87.62", 2, 5,],
  ["Y", "Yttrium", "88.90585", 3, 5,],
  ["Zr", "Zirconium", "91.224", 4, 5,],
  ["Nb", "Niobium", "92.90628", 5, 5,],
  ["Mo", "Molybdenum", "95.96", 6, 5,],
  ["Tc", "Technetium", "(98)", 7, 5,],
  ["Ru", "Ruthenium", "101.07", 8, 5,],
  ["Rh", "Rhodium", "102.9055", 9, 5,],
  ["Pd", "Palladium", "106.42", 10, 5,],
  ["Ag", "Silver", "107.8682", 11, 5,],
  ["Cd", "Cadmium", "112.411", 12, 5,],
  ["In", "Indium", "114.818", 13, 5,],
  ["Sn", "Tin", "118.71", 14, 5,],
  ["Sb", "Antimony", "121.76", 15, 5,],
  ["Te", "Tellurium", "127.6", 16, 5,],
  ["I", "Iodine", "126.90447", 17, 5,],
  ["Xe", "Xenon", "131.293", 18, 5,],
  ["Cs", "Caesium", "132.9054", 1, 6,],
  ["Ba", "Barium", "132.9054", 2, 6,],
  ["La", "Lanthanum", "138.90547", 4, 9,],
  ["Ce", "Cerium", "140.116", 5, 9,],
  ["Pr", "Praseodymium", "140.90765", 6, 9,],
  ["Nd", "Neodymium", "144.242", 7, 9,],
  ["Pm", "Promethium", "(145)", 8, 9,],
  ["Sm", "Samarium", "150.36", 9, 9,],
  ["Eu", "Europium", "151.964", 10, 9,],
  ["Gd", "Gadolinium", "157.25", 11, 9,],
  ["Tb", "Terbium", "158.92535", 12, 9,],
  ["Dy", "Dysprosium", "162.5", 13, 9,],
  ["Ho", "Holmium", "164.93032", 14, 9,],
  ["Er", "Erbium", "167.259", 15, 9,],
  ["Tm", "Thulium", "168.93421", 16, 9,],
  ["Yb", "Ytterbium", "173.054", 17, 9,],
  ["Lu", "Lutetium", "174.9668", 18, 9,],
  ["Hf", "Hafnium", "178.49", 4, 6,],
  ["Ta", "Tantalum", "180.94788", 5, 6,],
  ["W", "Tungsten", "183.84", 6, 6,],
  ["Re", "Rhenium", "186.207", 7, 6,],
  ["Os", "Osmium", "190.23", 8, 6,],
  ["Ir", "Iridium", "192.217", 9, 6,],
  ["Pt", "Platinum", "195.084", 10, 6,],
  ["Au", "Gold", "196.966569", 11, 6,],
  ["Hg", "Mercury", "200.59", 12, 6,],
  ["Tl", "Thallium", "204.3833", 13, 6,],
  ["Pb", "Lead", "207.2", 14, 6,],
  ["Bi", "Bismuth", "208.9804", 15, 6,],
  ["Po", "Polonium", "(209)", 16, 6,],
  ["At", "Astatine", "(210)", 17, 6,],
  ["Rn", "Radon", "(222)", 18, 6,],
  ["Fr", "Francium", "(223)", 1, 7,],
  ["Ra", "Radium", "(226)", 2, 7,],
  ["Ac", "Actinium", "(227)", 4, 10,],
  ["Th", "Thorium", "232.03806", 5, 10,],
  ["Pa", "Protactinium", "231.0588", 6, 10,],
  ["U", "Uranium", "238.02891", 7, 10,],
  ["Np", "Neptunium", "(237)", 8, 10,],
  ["Pu", "Plutonium", "(244)", 9, 10,],
  ["Am", "Americium", "(243)", 10, 10,],
  ["Cm", "Curium", "(247)", 11, 10,],
  ["Bk", "Berkelium", "(247)", 12, 10,],
  ["Cf", "Californium", "(251)", 13, 10,],
  ["Es", "Einstenium", "(252)", 14, 10,],
  ["Fm", "Fermium", "(257)", 15, 10,],
  ["Md", "Mendelevium", "(258)", 16, 10,],
  ["No", "Nobelium", "(259)", 17, 10,],
  ["Lr", "Lawrencium", "(262)", 18, 10,],
  ["Rf", "Rutherfordium", "(267)", 4, 7,],
  ["Db", "Dubnium", "(268)", 5, 7,],
  ["Sg", "Seaborgium", "(271)", 6, 7,],
  ["Bh", "Bohrium", "(272)", 7, 7,],
  ["Hs", "Hassium", "(270)", 8, 7,],
  ["Mt", "Meitnerium", "(276)", 9, 7,],
  ["Ds", "Darmstadium", "(281)", 10, 7,],
  ["Rg", "Roentgenium", "(280)", 11, 7,],
  ["Cn", "Copernicium", "(285)", 12, 7,],
  ["Nh", "Nihonium", "(286)", 13, 7,],
  ["Fl", "Flerovium", "(289)", 14, 7,],
  ["Mc", "Moscovium", "(290)", 15, 7,],
  ["Lv", "Livermorium", "(293)", 16, 7,],
  ["Ts", "Tennessine", "(294)", 17, 7,],
  ["Og", "Oganesson", "(294)", 18, 7],
]

interface Elem3D {
  info: any[],
  x: number, y: number, z: number
  rx: number, ry: number, rz: number
}

function init (): Elem3D[] {
  const result = []
  for (const info of table) {
    result.push({
      info,
      x: Math.random() * 4000 - 2000,
      y: Math.random() * 4000 - 2000,
      z: Math.random() * 4000 - 2000,
    })
  }
  return result
}

function asTable (): Elem3D[] {
  return table.map((info, i) => ({
    info,
    x: ((info[3] as number) * 140) - 1330,
    y: - ((info[4] as number) * 180) + 990,
    z: 0,
    rx: 0, ry: 0, rz: 0,
  }))
}

function helix (): Elem3D[] {
  const result = []
  var vector = new Vector3();

  for (var i = 0, l = table.length; i < l; i++) {
    var theta = i * 0.175 + Math.PI;
    var y = - (i * 8) + 450;
    var object = new O3D();

    object.position.setFromCylindricalCoords(900, theta, y);

    vector.x = object.position.x * 2;
    vector.y = object.position.y;
    vector.z = object.position.z * 2;

    object.lookAt(vector);

    result.push({
      info: table[i],
      x: object.position.x,
      y: object.position.y,
      z: object.position.z,
      rx: object.rotation.x,
      ry: object.rotation.y,
      rz: object.rotation.z,
    })
  }
  return result
}


export default defineComponent({
  components: { Camera, Object3D },
  setup () {
    const elements = ref(helix())
    function elementColor () {
      console.log('element color')
      return 'rgba(0, 127, 127, ' + (Math.random() * 0.5 + 0.25) + ')'
    }
    return { elements, elementColor }
  }
})
</script>

<template>
  <Camera :fov="40" :near="1" :far="10000" :w="1000" :h="1000" :x="0" :y="0" :z="3000">
    <Object3D
      v-for="(elem, index) in elements"
      :key="index"
      :x="elem.x"
      :y="elem.y"
      :z="elem.z"
      :rx="elem.rx"
      :ry="elem.ry"
      :rz="elem.rz"
    >
      <div class="element" :style="{ backgroundColor: elementColor()}">
        <div class="number">{{index+1}}</div>
        <div class="symbol">{{elem.info[0]}}</div>
        <div class="details">
          {{elem.info[1]}}
          <br />
          {{elem.info[2]}}
        </div>
      </div>
    </Object3D>
  </Camera>
</template>

<style lang="scss">
.element {
  width: 120px;
  height: 160px;
  box-shadow: 0px 0px 12px rgba(0, 255, 255, 0.5);
  border: 1px solid rgba(127, 255, 255, 0.25);
  font-family: Helvetica, sans-serif;
  text-align: center;
  line-height: normal;
  cursor: default;
}

.element:hover {
  box-shadow: 0px 0px 12px rgba(0, 255, 255, 0.75);
  border: 1px solid rgba(127, 255, 255, 0.75);
}

.element .number {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 12px;
  color: rgba(127, 255, 255, 0.75);
}

.element .symbol {
  position: absolute;
  top: 40px;
  left: 0px;
  right: 0px;
  font-size: 60px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.75);
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.95);
}

.element .details {
  position: absolute;
  bottom: 15px;
  left: 0px;
  right: 0px;
  font-size: 12px;
  color: rgba(127, 255, 255, 0.75);
}
</style>