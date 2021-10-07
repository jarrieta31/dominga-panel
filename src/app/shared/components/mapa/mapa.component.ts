import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, enableProdMode } from '@angular/core';
import { MapaService } from '../../services/mapa.service';
import * as mapboxgl from 'mapbox-gl';
import { DatosMapa } from '../../interfaces/datosMapa.interface';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent implements OnInit {

  @ViewChild('mapa') divMapa: ElementRef;
  mapa!: mapboxgl.Map;
  marcador!: mapboxgl.Marker;
  add_btn:boolean = false;
  delete_btn: boolean = true;
  move_btn: boolean = true;

  constructor(private mapaService: MapaService,
    private cdRef: ChangeDetectorRef
    ) { }

  ngOnInit(): void {
    console.log("onInit minimapa.marcador: " + this.mapaService.dMiniMapa.marcador)
  }

  ngOnDestroy(): void {
    // Guarda los datos del marcador en mapa-service para obtenerlos desde agregar lugar
    //   if(this.marcador !== undefined){
    //     this.mapaService.dataTemporal.marcador = true;
    //     this.mapaService.dataTemporal.centro = this.marcador.getLngLat();
    //     this.mapaService.dataTemporal.zoom = 16;
    //     //Luego de guardar el dato emite el vento antes de cerrarse
    //     //this.mapaService.emitirDataMap();
    //   }
  }

  ngAfterViewInit(): void {

    //compia el marcador del minimapa si existe marcador
    if(this.mapaService.dMiniMapa.marcador == true ){
      this.mapaService.dMapa.marcador = true;
      this.mapaService.dMapa.centro = this.mapaService.dMiniMapa.centro;
      this.mapaService.dMapa.zoom = 15;
    }

    //crea el mapa
    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.mapaService.dMapa.centro,
      zoom: this.mapaService.dMapa.zoom
    });

    //Si dMapa tiene marcador en true se crea el marcador y se centra en el
    console.log("AfterViewInit dMapa.marcador = " + this.mapaService.dMapa.marcador )
    if (this.mapaService.dMapa.marcador) {
      this.addMarker();
      this.flyToMarker();
      //falta deshabilitar el boton de agregar
    }

    //seccion para posicionar los controles
    const btnMarker = document.getElementById("add-marker");
    const btnZoom = document.getElementById('control-zoom');
    const map = document.getElementById("mapa").getBoundingClientRect();
    btnMarker.style.top = (map.top + 10) + "px";
    btnMarker.style.left = (map.left + 10) + "px";

    //es para que no se vea el error de cambio
    this.cdRef.detectChanges();
  }

  /**Agrega un marcador y actualiza la información del mapa en el servicio mapa-service */
  addMarker() {
    if (this.marcador === undefined) {
      this.marcador = new mapboxgl.Marker({
        color: "red",
        draggable: true
      })
        .setLngLat(this.mapaService.dMapa.centro)
        .addTo(this.mapa);
      this.mapaService.dMapa.marcador = true;
      this.mapaService.dMapa.zoom = 15;
      this.refreshButtons();
      this.marcador.on('dragend', () =>{
        this.mapaService.dMapa.centro = this.marcador.getLngLat();
      })
    }
  }

  /**Eliminar el marcador actual y aleja el zoom del mapa */
  deleteMarker() {
    if (this.marcador !== undefined) {
      this.marcador.off('dragend', () => {});
      this.mapa.flyTo({
        center: this.marcador.getLngLat(),
        zoom: 6
      });
      this.marcador.remove();
      this.marcador = undefined;
      this.mapaService.resetDataMapa();
      this.refreshButtons();

    }
  }


  /** Mueve el mapa hasta la posición del marcador */
  flyToMarker() {
    if (this.marcador !== undefined) {
      this.mapa.flyTo({
        center: this.marcador.getLngLat(),
        zoom: 15,
        essential: true
      });
    }

  }

  refreshButtons(){
    if(this.marcador === undefined){
      this.delete_btn = true;
      this.add_btn = false;
      this.move_btn = true;
    }else{
      this.delete_btn = false;
      this.add_btn = true;
      this.move_btn = false;
    }
  }

}
