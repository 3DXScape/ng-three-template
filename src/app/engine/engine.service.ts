import * as THREE from 'three';
import { Injectable, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { Vector3 } from 'three';

@Injectable({ providedIn: 'root' })
export class EngineService implements OnDestroy {
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
  private overviewScene;
  private light: THREE.DirectionalLight;
  private alight: THREE.AmbientLight;

  private moon: THREE.Mesh;
  private earth: THREE.Mesh;
  private clock = new THREE.Clock();
  private rate = 0.25; //relative operating rate for model

  private viewWidth = 280;
  private viewHeight = 280;



  private frameId: number = null;

  public constructor(private ngZone: NgZone) {}

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>, overviewCanvas: ElementRef<HTMLCanvasElement>,
    aCanvas: ElementRef<HTMLCanvasElement>, bCanvas: ElementRef<HTMLCanvasElement>,cCanvas: ElementRef<HTMLCanvasElement>, dCanvas: ElementRef<HTMLCanvasElement>   ): void {
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;
    this.overviewCanvas = overviewCanvas.nativeElement;
    this.aCanvas = aCanvas.nativeElement;
    this.bCanvas = bCanvas.nativeElement;
    this.cCanvas = cCanvas.nativeElement;
    this.dCanvas = dCanvas.nativeElement;
    this.viewWidth = this.aCanvas.clientWidth; //window.innerWidth/7;
    this.viewHeight = this.aCanvas.clientHeight * 2; //window.innerHeight/3.5;
    this.canvas.height = this.viewHeight + 4;
    this.canvas.width = this.viewWidth + 4;
    this.overviewCanvas.height = this.viewWidth + 4;
    this.overviewCanvas.width = this.viewWidth + 4;
    this.aCanvas.height = this.viewHeight + 4;
    this.aCanvas.width = this.viewWidth + 4;
    this.bCanvas.height = this.viewHeight + 4;
    this.bCanvas.width = this.viewWidth + 4;
    this.cCanvas.height = this.viewHeight + 4;
    this.cCanvas.width = this.viewWidth + 4;
    this.dCanvas.height = this.viewHeight + 4;
    this.dCanvas.width = this.viewWidth + 4;
    
    //var c = this.dCanvas;
    //var c = document.getElementById("dCanvas");
   var ctx = aCanvas.nativeElement.getContext("2d");
    ctx.beginPath();
    ctx.rect(4, 4, this.viewWidth - 4, this.viewHeight - 4);
    ctx.fillStyle = '#242424';
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.arc(this.viewWidth/2, this.viewHeight/2, this.viewHeight/10, 0, 2 * Math.PI);
    ctx.stroke();

    ctx = bCanvas.nativeElement.getContext("2d");
    ctx.beginPath();
    ctx.rect(4, 4, this.viewWidth - 4, this.viewHeight - 4);
    ctx.fillStyle = '#808080';
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.arc(this.viewWidth/2, this.viewHeight/2, this.viewHeight/10, 0, 2 * Math.PI);
    ctx.stroke();

    ctx = cCanvas.nativeElement.getContext("2d");
    ctx.beginPath();
    ctx.rect(4, 4, this.viewWidth - 4, this.viewHeight - 4);
    ctx.fillStyle = '#303030';
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.arc(this.viewWidth/2, this.viewHeight/2, this.viewHeight/10, 0, 2 * Math.PI);
    ctx.stroke();

    ctx = dCanvas.nativeElement.getContext("2d");
    ctx.beginPath();
    ctx.rect(4, 4, this.viewWidth - 4, this.viewHeight - 4);
    ctx.fillStyle = '#404040';
    ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.arc(this.viewWidth/2, this.viewHeight/2, this.viewHeight/10, 0, 2 * Math.PI);
    ctx.stroke();


    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.renderer.setSize(window.innerWidth/2, window.innerHeight/2);

    this.overviewRenderer = new THREE.WebGLRenderer({
      canvas: this.overviewCanvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.overviewRenderer.setSize(window.innerWidth/2, window.innerHeight/2);

    // create the scene
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      //75, window.innerWidth / window.innerHeight, 0.1, 1000
      75, 1.00, 0.1, 1000
      );
    this.camera.position.z = 5.37;
    this.scene.add(this.camera);

    this.overviewCamera = new THREE.PerspectiveCamera(
      75, 1.0, 0.1, 1000
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
    var earthGeometry = new THREE.SphereBufferGeometry( EARTH_RADIUS, 32, 32 );
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

    this.light.lookAt(this.earth.position);
    this.scene.add(this.light);

    this.overviewCamera.lookAt(this.earth.position);
 
  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
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
    this.earth.rotation.y += 0.10*this.rate;
    var elapsed = this.clock.getElapsedTime() * 1.0 * this.rate;
    this.moon.position.set( Math.sin( elapsed*0.2 ) * 5, 0, Math.cos( elapsed*0.2 ) * 5 );
    this.moon.lookAt(this.earth.position);
    this.moon.rotateY(-1.5);

    //this.earth.rotation.x += 0.01;
   // this.earth.rotation.y += 0.01;
   this.renderer.render(this.scene, this.camera);
   this.renderer.setSize( this.viewWidth + 4, this.viewHeight + 4);
   this.overviewRenderer.render(this.scene, this.overviewCamera);
   this.overviewRenderer.setSize( this.viewWidth + 4, this.viewHeight + 4);
 }

  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( width, height );
    //this.overviewRenderer.setSize( width, height );
  }
}
