import * as THREE from 'three';
import { Injectable, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { Vector3 } from 'three';
import { Console, debug } from 'console';

@Injectable({ providedIn: 'root' })
export class EngineService implements OnDestroy {
  private timeRateSlider: HTMLInputElement;
  private renderPorts: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private overviewCanvas: HTMLCanvasElement;
  private overviewRenderer: THREE.WebGLRenderer;
  private aCanvas: HTMLCanvasElement;
  private aRenderer: THREE.WebGLRenderer;
  private bCanvas: HTMLCanvasElement;
  private bRenderer: THREE.WebGLRenderer;
  private cCanvas: HTMLCanvasElement;
  private cRenderer: THREE.WebGLRenderer;
  private dCanvas: HTMLCanvasElement;
  private dRenderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private overviewCamera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private overviewScene: THREE.Scene;
  private light: THREE.DirectionalLight;
  private alight: THREE.AmbientLight;

  private moon: THREE.Mesh;
  private earth: THREE.Mesh;
  private clock = new THREE.Clock();
  private rate = 0.25; //relative operating rate for model

  private viewWidth: number = 280;
  private viewHeight: number = 280;

  private animateTime = 0;



  private frameId: number = null;

  public constructor(private ngZone: NgZone) {}

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }
  public SetSizes(cnvs: HTMLCanvasElement)
  {
    cnvs.height = this.viewHeight;
    cnvs.width = this.viewWidth;

  }
  // put a background fill with a circle in center of cell
  public DummyContent(cnvs: HTMLCanvasElement)
  {
    console.log("animate: height:" + cnvs.height + " width:" + cnvs.width);

    var ctx = cnvs.getContext("2d");
    ctx.beginPath();
    ctx.rect(0,0, this.viewWidth - 0, this.viewHeight - 0);
    ctx.fillStyle = '#242424';
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.arc(this.viewWidth/2, this.viewHeight/2, this.viewHeight/10, 0, 2 * Math.PI);
    ctx.stroke();
  }

  public createScene(timeRateSlider: ElementRef<HTMLInputElement>, renderPorts: ElementRef<HTMLDivElement>, canvas: ElementRef<HTMLCanvasElement>, overviewCanvas: ElementRef<HTMLCanvasElement>,
    aCanvas: ElementRef<HTMLCanvasElement>, bCanvas: ElementRef<HTMLCanvasElement>,cCanvas: ElementRef<HTMLCanvasElement>, dCanvas: ElementRef<HTMLCanvasElement>   ): void {
    // The first step is to get the reference of the canvas element from our HTML document
    this.renderPorts = renderPorts.nativeElement;
    this.canvas = canvas.nativeElement;
    this.overviewCanvas = overviewCanvas.nativeElement;
    this.aCanvas = aCanvas.nativeElement;
    this.bCanvas = bCanvas.nativeElement;
    this.cCanvas = cCanvas.nativeElement;
    this.dCanvas = dCanvas.nativeElement;
    this.timeRateSlider = timeRateSlider.nativeElement;
    console.log("Slider: " + timeRateSlider.nativeElement.value);

    console.log("createScene: height:" + this.renderPorts.clientHeight + " width:" + this.renderPorts.clientWidth);
    var portOffset = 8;
    this.viewWidth  = (this.renderPorts.clientWidth  / 3) - portOffset;
    this.viewHeight = (this.renderPorts.clientHeight / 2) - portOffset;

    this.SetSizes(this.aCanvas);
    this.SetSizes(this.bCanvas);
    this.SetSizes(this.cCanvas);
    this.SetSizes(this.dCanvas);


    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    //this.renderer.setSize(window.innerWidth/2, window.innerHeight/2);
    this.renderer.setSize(this.viewWidth, this.viewHeight);

    this.overviewRenderer = new THREE.WebGLRenderer({
      canvas: this.overviewCanvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.overviewRenderer.setSize(this.viewWidth, this.viewHeight);

    // create the scene
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      //75, window.innerWidth / window.innerHeight, 0.1, 1000
      75, this.viewWidth / this.viewHeight, 0.1, 1000
      );
    this.camera.position.z = 6.20;
    this.camera.position.y = 0.7;
    this.scene.add(this.camera);

    this.overviewCamera = new THREE.PerspectiveCamera(
      75, this.viewWidth / this.viewHeight, 0.1, 1000
    );
    this.overviewCamera.position.y = 8.0;
    this.scene.add(this.overviewCamera);

    // soft white light
    this.alight = new THREE.AmbientLight( 0x404040 );
    //this.scene.add(this.alight);
    this.light = new THREE.DirectionalLight( 0xffffff, 1.0 );
    this.light.position.z = 10;
    
    //const geometry = new THREE.BoxGeometry(2, 2, 2);
    //const material = new THREE.MeshStandardMaterial({ wireframe: true });
    //this.cube = new THREE.Mesh( geometry, material );
    //this.scene.add(this.cube);
    var EARTH_RADIUS = 1;
    var textureLoader = new THREE.TextureLoader();
    var earthGeometry = new THREE.SphereBufferGeometry( EARTH_RADIUS, 64, 64 );
    var earthMaterial = new THREE.MeshPhongMaterial( {
      specular: 0x333333,
      shininess: 5,
      //map: textureLoader.load( 'textures/planets/earth_atmos_2048.jpg' ),
      map: textureLoader.load( '../assets/planets/8k_earth_daymap.jpg' ),
      //map: textureLoader.load( 'textures/planets/ww15mgh.jpg' ),
      specularMap: textureLoader.load( '../assets/planets/earth_specular_2048.jpg' ),
      normalMap: textureLoader.load( '../assets/planets/earth_normal_2048.jpg' ),
      normalScale: new THREE.Vector2( 0.85, 0.85 )
    } );
    this.earth = new THREE.Mesh( earthGeometry, earthMaterial );
    //earth.rotation.x += 0.3;
    //earth.rotation.z += 0.3;
    //arrowX.rotation = earth.rotation;
    //arrowY.rotation = earth.rotation;

    //scene.add( geoid );
    this.scene.add( this.earth );

    var MOON_RADIUS = 0.27;
    var moonGeometry = new THREE.SphereBufferGeometry( MOON_RADIUS, 16, 16 );
    var moonMaterial = new THREE.MeshPhongMaterial( {
      shininess: 5,
      map: textureLoader.load( '../assets/planets/8k_moon.jpg' )
    } );
    this.moon = new THREE.Mesh( moonGeometry, moonMaterial );
    this.scene.add( this.moon );

    var latOffset = 0.5;
    var lonOffset = -2.8;
    //var latOffset = 0.1;
    //var lonOffset = -2.2;
    var planeSize = 0.1;
    var planeOffset = planeSize * 0.5;
    var planeRadius = 0.9994;
    var geometry = new THREE.PlaneGeometry( planeSize, planeSize, 2 );
    //var geometry = new THREE.SphereBufferGeometry( 0.05, 16, 16 );
    var material = new THREE.MeshPhongMaterial( {color: 0x101010, side: THREE.DoubleSide, opacity: 0.4, transparent: true} );
    //material. = 0.2;
    var plane = new THREE.Mesh( geometry, material );
    console.log("Plane: " + plane.position.x + " " + plane.position.y + " " + plane.position.z);
    const toRadians: number = 3.14159265 / 180.0;
    let lat: number = (51.812412 + latOffset) * toRadians;
    let lon: number = (9.056527 + lonOffset) * toRadians;
    let x: number = planeRadius * Math.sin(lat) * Math.cos(lon);
    let y: number = planeRadius * Math.sin(lat) * Math.sin(lon);
    let z: number = planeRadius * Math.cos(lat);
    console.log( x + " " + y + " " + z);
    plane.translateX(z); // xyz  yzx zxy.                  zyx  yxz xzy
    plane.translateY(x);
    plane.translateZ(y);
    //plane.position.x = z;
    //plane.position.z = y;
    //plane.position.y = x;
    console.log("Plane: " + plane.position.x + " " + plane.position.y + " " + plane.position.z);
    plane.lookAt(this.earth.position);
    //plane.rotation.z = 1.0;
    this.earth.add(plane);
    this.rate *= 0.1;


    this.light.lookAt(this.earth.position);
    this.scene.add(this.light);

    this.overviewCamera.lookAt(this.earth.position);
 
  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
 
        console.log("animate: height:" + this.renderPorts.clientHeight + " width:" + this.renderPorts.clientWidth);
        //this.SetSizes(this.canvas);
        this.DummyContent(this.aCanvas);
 
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }

      window.addEventListener('resize', () => {
        this.resize();
      });
    });
  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });
    var now = this.clock.getElapsedTime();
    this.rate = parseInt(this.timeRateSlider.value)/1000;
//    this.rate = parseInt(this.timeRateSlider.value)/1000;
    var elapsed = now * 1.0 * this.rate;
    //console.log("now: " + now);
    var earthDay = elapsed % 86400;
    var earthFactor = 3.14159265 * 2 / 86400; 
    var moonFactor = earthFactor / 29;
    this.earth.rotation.y  = earthDay * earthFactor * 50000;
    this.moon.position.set( Math.sin( elapsed*0.195 ) * 5, 0, Math.cos( elapsed*0.195 ) * 5 );
    this.moon.lookAt(this.earth.position);
    this.moon.rotateY(-1.5);

    //this.earth.rotation.x += 0.01;
   // this.earth.rotation.y += 0.01;
   this.renderer.render(this.scene, this.camera);
   //this.renderer.setSize( 256, 256);
   this.renderer.setSize( this.viewWidth, this.viewHeight+1);
   this.overviewRenderer.render(this.scene, this.overviewCamera);
   this.overviewRenderer.setSize( this.viewWidth, this.viewHeight+1);
 }

  public resize(): void {
    ///const width = window.innerWidth;
    ///const height = window.innerHeight;

    ///this.camera.aspect = width / height;
    ///this.camera.updateProjectionMatrix();

    ///this.renderer.setSize( width, height );
    //this.overviewRenderer.setSize( width, height );
    var portOffset = 8;
    this.viewWidth  = (this.renderPorts.clientWidth  / 3) - portOffset;
    this.viewHeight = (this.renderPorts.clientHeight / 2) - portOffset;
    var aspectRatio = this.viewWidth / this.viewHeight;

    this.SetSizes(this.aCanvas);
    this.SetSizes(this.bCanvas);
    this.SetSizes(this.cCanvas);
    this.SetSizes(this.dCanvas);

    this .renderer.setSize(this.viewWidth, this.viewHeight)
    this .overviewRenderer.setSize(this.viewWidth, this.viewHeight)
    this.camera.aspect = aspectRatio;
    this.camera.updateProjectionMatrix();
    this.overviewCamera.aspect = aspectRatio;
    this.overviewCamera.updateProjectionMatrix();

  }
}
