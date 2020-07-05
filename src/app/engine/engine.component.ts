import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EngineService } from './engine.service';

@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html'
})
export class EngineComponent implements OnInit {

  @ViewChild('timeRateSlider', {static: true})
  public timeRateSlider: ElementRef<HTMLInputElement>;
  @ViewChild('renderPorts', {static: true})
  public renderPorts: ElementRef<HTMLDivElement>;
  @ViewChild('overviewCanvas', {static: true})
  public overviewCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('rendererCanvas', {static: true})
  public rendererCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('aCanvas', {static: true})
  public aCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('bCanvas', {static: true})
  public bCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('cCanvas', {static: true})
  public cCanvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('dCanvas', {static: true})
  public dCanvas: ElementRef<HTMLCanvasElement>;

  public constructor(private engServ: EngineService) { }

  public ngOnInit(): void {
    this.engServ.createScene(this.timeRateSlider, this.renderPorts, this.rendererCanvas, this.overviewCanvas, this.aCanvas, this.bCanvas, this.cCanvas, this.dCanvas);
    this.engServ.animate();
  }

}
