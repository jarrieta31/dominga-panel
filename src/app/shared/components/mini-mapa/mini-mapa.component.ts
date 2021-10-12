import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { DatosMapa } from '../../interfaces/datosMapa.interface';
import { MapaService } from '../../services/mapa.service';

@Component({
  selector: 'app-mini-mapa',
  templateUrl: './mini-mapa.component.html',
  styleUrls: ['./mini-mapa.component.css']
})
export class MiniMapaComponent implements OnInit, AfterViewInit {

  @ViewChild('mini_mapa') divMiniMapa: ElementRef;
  mapa!: mapboxgl.Map;
  marcador!: mapboxgl.Marker;

  constructor(private mapaService: MapaService) {

  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {


    this.mapa = new mapboxgl.Map({
      container: this.divMiniMapa.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.mapaService.dMiniMapa.centro,
      zoom: this.mapaService.dMiniMapa.zoom,
      interactive: false
    });

    const sourceMiniMapa = this.mapaService.miniMapaSubject$.subscribe(res => {

      if (res !== undefined && res.marcador == true ) {
        // Si el marcador no existe lo crea, de lo contrario cambia su ubicacion
        if (this.marcador === undefined) {
          this.addMarker();
        }else{
          this.marcador.setLngLat(res.centro)
        }
        console.log("afterViewInit del minimapa")
        this.flyToMarker()
      } else {
        this.deleteMarker();
      }
    });
  }

  /**Agrega un marcador y actualiza la información del mapa en el servicio mapa-service */
  addMarker() {
    this.marcador = new mapboxgl.Marker({
      color: "red",
      draggable: true
    })
      .setLngLat(this.mapaService.dMiniMapa.centro)
      .addTo(this.mapa);
    this.mapaService.dMiniMapa.marcador = true;
  }

  /**Eliminar el marcador actual y aleja el zoom del mapa */
  deleteMarker() {

    if (this.marcador !== undefined) {
      this.mapa.flyTo({
        center: this.marcador.getLngLat(),
        zoom: 6
      });
      this.marcador.remove();
      this.marcador = undefined;
      this.mapaService.resetDataMiniMapa();
    }


  }

  /** Mueve el mapa hasta la posición del marcador */
  flyToMarker() {
    if (this.marcador !== undefined) {
      this.mapa.flyTo({
        center: this.marcador.getLngLat(),
        zoom: 15,
        speed: 1.5,
        essential: true
      });
    }

  }

}
