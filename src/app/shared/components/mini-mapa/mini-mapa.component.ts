import { AfterViewInit, Component, ElementRef, OnInit, ResolvedReflectiveFactory, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Subscription } from 'rxjs';
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
    sourceMiniMapa: Subscription;


    constructor(private mapaService: MapaService) {

    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        //Called once, before the instance is destroyed.
        //Add 'implements OnDestroy' to the class.
        this.sourceMiniMapa.unsubscribe();
    }

    ngAfterViewInit(): void {

        this.mapa = new mapboxgl.Map({
            container: this.divMiniMapa.nativeElement,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: this.mapaService.dMiniMapa.centro,
            zoom: this.mapaService.dMiniMapa.zoom,
            interactive: false
        });

        this.sourceMiniMapa = this.mapaService.getObsMiniMapa().subscribe(res => {

            if (res !== undefined && res.marcador == true) {
                // Si el marcador no existe lo crea, de lo contrario cambia su ubicacion
                if (this.marcador === undefined) {// si no existe lo crea
                    this.addMarker();
                } else {
                    this.marcador.setLngLat(res.centro)
                }
                console.log("minimapa centro: " + res.centro.lat )
                this.flyToMarker()
            } else {
                this.deleteMarker();
            }
        });
        this.mapaService.emitirMiniMapa();
    }

    /**Agrega un marcador y actualiza la información del mapa en el servicio mapa-service */
    addMarker() {
        this.marcador = new mapboxgl.Marker({
            color: "red",
            draggable: false
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
