<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  // let ctx, radius, canvas;
  
  // var canvas = document.getElementById("canvas");
  // var ctx = canvas.getContext("2d");
  // var radius = canvas.height / 2;
  // ctx.translate(radius, radius);
  // radius = radius * 0.90;
  // export let canvas;

  
  // let isDrawing = false;
  // let x = 0;
  // let y = 0;
  const canvas = document?.getElementById("canvas");
   const ctx = canvas?.getContext("2d");
   let radius = canvas?.height / 2 ;
   ctx?.translate(radius, radius); 

    console.log('ctx draw', ctx);
   radius = radius* 0.90;
   drawClock();
  function drawClock() {
    if(!ctx) return;
    drawFace(ctx, radius);
    drawNumbers(ctx, radius);
    drawDayEvent(ctx, radius);
    drawTime(ctx, radius);
  }

  function degToRad(degree){
      var factor = Math.PI / 180;
      return degree * factor;
  }


  // canvas.addEventListener('mousedown', e => {
  //   x = e.offsetX;
  //   y = e.offsetY;
  //   isDrawing = true;
  // });

  // canvas.addEventListener('mousemove', e => {
  //   if (isDrawing === true) {
  //     drawLine(ctx, x, y, e.offsetX, e.offsetY);
  //     x = e.offsetX;
  //     y = e.offsetY;
  //   }
  // });

  // window.addEventListener('mouseup', e => {
  //   if (isDrawing === true) {
  //     drawLine(ctx, x, y, e.offsetX, e.offsetY);
  //     x = 0;
  //     y = 0;
  //     isDrawing = false;
  //   }
  // });

  // function drawLine(ctx, x1, y1, x2, y2) {
  //   ctx.beginPath();
  //   ctx.strokeStyle = 'black';
  //   ctx.lineWidth = 100;
  //   ctx.moveTo(x1 - canvas.height / 2, y1 - canvas.height / 2);
  //   ctx.lineTo(x2 - canvas.height / 2, y2 - canvas.height / 2);
  //   ctx.stroke();
  //   ctx.closePath();
  // }

  function drawDayEvent(ctx, radius) {//event paint
    ctx.beginPath();
    ctx.arc(0, 0, radius*0.85, degToRad(-75), degToRad(-50));
    ctx.strokeStyle = 'rgb(255, 51, 0, 0.5)';
    ctx.lineWidth = radius*0.15;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, radius*0.85, degToRad(-35), degToRad(15));
    ctx.strokeStyle = 'rgb(153, 255, 153, 0.5)';
    ctx.lineWidth = radius*0.15;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, radius*0.65, degToRad(-180), degToRad(90));
    ctx.strokeStyle = 'rgb(153, 102, 255, 0.5)';
    ctx.lineWidth = radius*0.15;
    ctx.stroke();
  }

  function drawFace(ctx, radius) {
    var grad;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2*Math.PI);
    console.log('blur', ctx.filter);
    ctx.fillStyle = 'white';
    ctx.fill();
    grad = ctx.createRadialGradient(0,0,radius*0.95, 0,0,radius*1.05);
    grad.addColorStop(0, '#333');
    grad.addColorStop(0.5, 'white');
    grad.addColorStop(1, '#333');
    ctx.strokeStyle = grad;
    ctx.lineWidth = radius*0.1;
    ctx.stroke();
    // ctx.filter = "blur(3px)";
    ctx.beginPath();
    ctx.arc(0, 0, radius*0.08, 0, 2*Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
    // ctx.filter = "none";

  }

  function drawNumbers(ctx, radius) {
    var ang;
    var num;
    ctx.font = radius*0.15 + "px arial";
    ctx.textBaseline="middle";
    ctx.textAlign="center";
    for(num = 1; num < 13; num++){
      ang = num * Math.PI / 6;
      ctx.rotate(ang);
      ctx.translate(0, -radius*0.85);
      ctx.rotate(-ang);
      ctx.fillText(num.toString(), 0, 0);
      ctx.rotate(ang);
      ctx.translate(0, radius*0.85);
      ctx.rotate(-ang);
    }
  }

  function drawTime(ctx, radius){
    ctx.strokeStyle = '#333';
      var now = new Date();
      var hour = now.getHours();
      var minute = now.getMinutes();
      var second = now.getSeconds();
      //hour
      hour=hour%12;
      hour=(hour*Math.PI/6)+
      (minute*Math.PI/(6*60))+
      (second*Math.PI/(360*60));
      drawHand(ctx, hour, radius*0.5, radius*0.07);
      //minute
      minute=(minute*Math.PI/30)+(second*Math.PI/(30*60));
      drawHand(ctx, minute, radius*0.8, radius*0.07);
      // second
      second=(second*Math.PI/30);
      drawHand(ctx, second, radius*0.9, radius*0.02);
  }

  function drawHand(ctx, pos, length, width) {
      ctx.beginPath();
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.moveTo(0,0);
      ctx.rotate(pos);
      ctx.lineTo(0, -length);
      ctx.stroke();
      ctx.rotate(-pos);
  }


  onMount(() => {
		const interval = setInterval(drawClock, 1000);

		return () => {
			clearInterval(interval);
		};
	});

  // onDestroy(()=>{clearInterval(interval)});
  // onMount(
  //  setInterval(() => {
	// 		// console.log('custTicks22');
	// 	}, 1000));

  //   let tick = 0;
  // setInterval(() => {
  //   tick += 1
  // }, 1000);

  // $: console.log(tick)
</script>

<div  class={$$props.class + " analog-clock"}>
  <canvas id="canvas" />
</div>

<style lang="scss">
  .analog-clock {
    display: block;
  }
</style>
