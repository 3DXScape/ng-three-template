import * as THREE from 'three';
import { Injectable, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { Vector3 } from 'three';

@Injectable({ providedIn: 'root' })
export class EngineService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.DirectionalLight;
  private alight: THREE.AmbientLight;

  private moon: THREE.Mesh;
  private earth: THREE.Mesh;
  private clock = new THREE.Clock();
  private rate = 0.25; //relative operating rate for model


  private frameId: number = null;

  public constructor(private ngZone: NgZone) {}

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // create the scene
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      75, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.camera.position.z = 6;
    this.scene.add(this.camera);

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
  }

  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( width, height );
  }
}
