<template>
  <main>
      <div class="frame">
          <button class="frame__button" id="intro"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="60" height="60"><path d="M45.563 29.174l-22-15A1 1 0 0022 15v30a.999.999 0 001.563.826l22-15a1 1 0 000-1.652zM24 43.107V16.893L43.225 30 24 43.107z"/><path d="M30 0C13.458 0 0 13.458 0 30s13.458 30 30 30 30-13.458 30-30S46.542 0 30 0zm0 58C14.561 58 2 45.439 2 30S14.561 2 30 2s28 12.561 28 28-12.561 28-28 28z"/></svg></button>
          <div class="frame__content">
              <h2 class="frame__content-title">BRAVE GIRLS</h2>
              <p class="frame__content-text">Select another video here:</p>
              <nav class="frame__switch" id="nav">
                  <a class="frame__switch-item js-nav" data-nav="0">Rollin</a>
                  <a class="frame__switch-item js-nav" data-nav="1">high heels</a>
                  <a class="frame__switch-item js-nav" data-nav="2">We Ride</a>
              </nav>
          </div>
      </div>
      <div class="video">
          <div id="canvas"></div>
          <div class="wrapper">
              <div class="plane" data-duration="2.5">
                  <video playsinline muted src="@/assets/videos/Rollin.webm" data-sampler="firstTexture" preload="auto"></video>
                  <video playsinline muted src="@/assets/videos/HighHeels.webm" data-sampler="secondTexture"></video>
                  <video playsinline muted src="@/assets/videos/WeRide.webm" data-sampler="thirdTexture"></video>
              </div>
          </div>
      </div>
  </main>
</template>

<script>
  import { Curtains, Plane } from "curtainsjs";
  import { gsap, Power2 } from "gsap";
  import fragment from "@/assets/shaders_circle/fragment.glsl";
  import vertex from "@/assets/shaders_circle/vertex.glsl";

  export default {

    name: "HelloBraveGirls",
    mounted() {
      // let activeTexture = 0;
      let currentTexture = 0;
      // let transitionTimer = 0;
      let timer = 0;
      let isRunning = 0;
      // set up our WebGL context and append the canvas to our wrapper
      const curtains = new Curtains({
        container: "canvas",
        alpha: true,
        pixelRatio: Math.min(1.5, window.devicePixelRatio), // limit pixel ratio for performance
      });

      // get our plane element
      const planeElements = [...document.getElementsByClassName("plane")];
      const navElements = [...document.getElementsByClassName("js-nav")];
      const duration = planeElements[0].getAttribute("data-duration") || 2;
      // set our initial parameters (basic uniforms)
      const params = {
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          transitionTimer: {
            name: "uTransitionTimer",
            type: "1f",
            value: 0,
          },
          fadeIn: {
            name: "uFadeIn",
            type: "1f",
            value: 0,
          },
          timer: {
            name: "uTimer",
            type: "1f",
            value: 0,
          },
          to: {
            name: "uTo",
            type: "1f",
            value: 0,
          },
          from: {
            name: "uFrom",
            type: "1f",
            value: 0,
          },
        },
      };

      const multiTexturesPlane = new Plane(curtains, planeElements[0], params);

      // set up our basic methods
      multiTexturesPlane
        .onReady(() => {
          // display the button

          document.body.classList.add("curtains-ready");
          let length = multiTexturesPlane.videos.length;

          // planeElements[0].addEventListener("click", () => {
          //   gsap.to(multiTexturesPlane.uniforms.transitionTimer, {
          //     duration: duration,
          //     value: currentTexture + 1,
          //     easing: 'power2.in',
          //     onStart: () => {
          //       multiTexturesPlane.videos[(currentTexture + 1) % length].play();
          //       currentTexture = currentTexture + 1;
          //     },
          //     onComplete: () => {
          //       multiTexturesPlane.videos[
          //         (currentTexture + length - 1) % length
          //       ].pause();
          //       multiTexturesPlane.videos[
          //         (currentTexture + length + 1) % length
          //       ].pause();
          //     },
          //   });
          // });

          navElements.forEach((nav) => {
            nav.addEventListener("click", (event) => {
              let to = event.target.getAttribute("data-nav");
              if (isRunning || to == currentTexture) return;
              var elems = document.querySelectorAll(".frame__switch-item");
              [].forEach.call(elems, function (el) {
                el.classList.remove("frame__switch-item--current");
              });
              event.target.classList.add("frame__switch-item--current");
              isRunning = true;

              multiTexturesPlane.uniforms.to.value = to;

              let fake = { progress: 0 };
              gsap.to(fake, {
                duration: duration,
                progress: 1,
                easing: Power2.easeIn,
                onStart: () => {
                  multiTexturesPlane.videos[to].play();
                  currentTexture = to;
                },
                onUpdate: () => {
                  if (fake.progress === 1) {
                    multiTexturesPlane.uniforms.from.value = to;
                  }
                  multiTexturesPlane.uniforms.transitionTimer.value =
                    fake.progress;
                },
                onComplete: () => {
                  multiTexturesPlane.uniforms.from.value = to;
                  multiTexturesPlane.videos[
                    (currentTexture + length - 1) % length
                  ].pause();
                  multiTexturesPlane.videos[
                    (currentTexture + length + 1) % length
                  ].pause();
                  isRunning = false;
                },
              });
            });
          });

          // click to play the videos
          document.getElementById("intro").addEventListener(
            "click",
            () => {
              // fade out animation
              gsap.to("#intro", { duration: 0.1, autoAlpha: 0 });
              document.body.classList.add("video-started");

              gsap.to(multiTexturesPlane.uniforms.fadeIn, {
                duration: 1,
                value: 1,
              });

              // play all videos to force uploading the first frame of each texture
              multiTexturesPlane.playVideos();

              // wait a tick and pause the rest of videos (the ones that are hidden)
              curtains.nextRender(() => {
                multiTexturesPlane.videos[1].pause();
                multiTexturesPlane.videos[2].pause();
              });
            },
            false
          );
        })
        .onRender(() => {
          timer += 0.001;
          multiTexturesPlane.uniforms.timer.value = timer;
        });
    },
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
