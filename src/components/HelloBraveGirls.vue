<template>
  <main>
      <div class="frame">
          <button class="frame__button" id="intro" @click="fadeOutIntro()"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="60" height="60"><path d="M45.563 29.174l-22-15A1 1 0 0022 15v30a.999.999 0 001.563.826l22-15a1 1 0 000-1.652zM24 43.107V16.893L43.225 30 24 43.107z"/><path d="M30 0C13.458 0 0 13.458 0 30s13.458 30 30 30 30-13.458 30-30S46.542 0 30 0zm0 58C14.561 58 2 45.439 2 30S14.561 2 30 2s28 12.561 28 28-12.561 28-28 28z"/></svg></button>
          <div class="frame__content">
              <h2 class="frame__content-title">BRAVE GIRLS</h2>
              <p class="frame__content-text">Select BRAVEGIRLS music video!!</p>
              <nav class="frame__switch" id="nav">
                  <a class="frame__switch-item" 
                   ref="jsNav" 
                   v-for="(navItem, navItemKey) in navItems"
                   :key="navItemKey"
                   :dataNav="navItemKey"
                  >
                    {{ navItem.title }}
                  </a>
              </nav>
          </div>
      </div>
      <div class="video">
          <div id="canvas"></div>
          <div class="wrapper">
              <div class="plane">
                  <video playsinline muted preload="auto"
                   v-for="videoItem in videoItems"
                   :key="videoItem.index"
                   :src="`/videos/${videoItem.fileName}`"
                   :data-sampler="videoItem.dataSampler"
                  ></video>
                  <!-- 리터럴 경로로 설정할 때는 vue.config.js에서 설정하고 아래처럼 하면 된다 -->
                  <!-- :src="require(`~/assets/videos/${url}`)" -->
                  
                  <!-- <video playsinline muted src="@/assets/videos/Rollin.webm" data-sampler="firstTexture" preload="auto"></video>
                  <video playsinline muted src="@/assets/videos/HighHeels.webm" data-sampler="secondTexture" preload="auto"></video>
                  <video playsinline muted src="@/assets/videos/WeRide.webm" data-sampler="thirdTexture" preload="auto"></video> -->
                 
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
    data() {
      return {
        navItems: [
          {
            title: 'Rollin',
          },
          {
            title: 'high heels',
          },
          {
            title: 'We Ride',
          },
        ],
        videoItems: [
          {
            fileName: 'Rollin.webm',
            dataSampler: 'firstTexture'
          },
          {
            fileName: 'HighHeels.webm',
            dataSampler: 'secondTexture'
          },
          {
            fileName: 'WeRide.webm',
            dataSampler: 'thirdTexture'
          },
        ],
        dataDuration: 2.5
      }
    },
    mounted() {
      // let activeTexture = 0;
      let currentTexture = 0;
      // let transitionTimer = 0;
      let timer = 0;
      let isRunning = 0;

      // set up our WebGL context and append the canvas to our wrapper
      this.curtains = new Curtains({
        container: "canvas",
        alpha: true,
        pixelRatio: Math.min(1.5, window.devicePixelRatio), // limit pixel ratio for performance
      });

      // get our plane element
      const planeElements = [...document.getElementsByClassName("plane")];
      const navElements = [...this.$refs.jsNav];
      const duration = this.dataDuration || 10
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

      this.multiTexturesPlane = new Plane(this.curtains, planeElements[0], params);

      // set up our basic methods
      this.multiTexturesPlane
        .onReady(() => {
          // display the button
          // document.body.classList.add("curtains-ready");
          let length = this.multiTexturesPlane.videos.length;

          navElements.forEach((nav) => {
            nav.addEventListener("click", (event) => {
              let to = event.target.getAttribute("dataNav");
              if (isRunning || to == currentTexture) return;
              var elems = document.querySelectorAll(".frame__switch-item");
              [].forEach.call(elems, function (el) {
                el.classList.remove("frame__switch-item--current");
              });
              event.target.classList.add("frame__switch-item--current");
              isRunning = true;

              this.multiTexturesPlane.uniforms.to.value = to;

              let fake = { progress: 0 };
              gsap.to(fake, {
                duration: duration,
                progress: 1,
                easing: Power2.easeIn,
                onStart: () => {
                  this.multiTexturesPlane.videos[to].play();
                  currentTexture = to;
                },
                onUpdate: () => {
                  if (fake.progress === 1) {
                    this.multiTexturesPlane.uniforms.from.value = to;
                  }
                  this.multiTexturesPlane.uniforms.transitionTimer.value =
                    fake.progress;
                },
                onComplete: () => {
                  this.multiTexturesPlane.uniforms.from.value = to;
                  this.multiTexturesPlane.videos[
                    (currentTexture + length - 1) % length
                  ].pause();
                  this.multiTexturesPlane.videos[
                    (currentTexture + length + 1) % length
                  ].pause();
                  isRunning = false;
                },
              });
            });
          });
        })
        .onRender(() => {
          timer += 0.001;
          this.multiTexturesPlane.uniforms.timer.value = timer;
        });
      console.log('mounted complete')
    },
    methods: {
      loadVideo(url){
        return require(`~/assets/videos/${url}`)
      },
      fadeOutIntro() {
        // fade out animation
        gsap.to("#intro", { duration: 0.1, autoAlpha: 0 });
        document.body.classList.add("video-started");

        gsap.to(this.multiTexturesPlane.uniforms.fadeIn, {
          duration: 1,
          value: 1,
        });

        // play all videos to force uploading the first frame of each texture
        this.multiTexturesPlane.playVideos();

        // wait a tick and pause the rest of videos (the ones that are hidden)
        this.curtains.nextRender(() => {
          this.multiTexturesPlane.videos[1].pause();
          this.multiTexturesPlane.videos[2].pause();
        });
      },
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
