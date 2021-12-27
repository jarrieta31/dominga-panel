import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, enableProdMode, Output, EventEmitter } from '@angular/core';
import { MapaService } from '../../services/mapa.service';
import * as mapboxgl from 'mapbox-gl';
import { DatosMapa } from '../../interfaces/datosMapa.interface';
import { MatSliderChange } from '@angular/material/slider';

@Component({
    selector: 'app-mapa',
    templateUrl: './mapa.component.html',
    styleUrls: ['./mapa.component.css']
})
export class MapaComponent implements OnInit {

    @ViewChild('mapa') divMapa: ElementRef;
    mapa!: mapboxgl.Map;
    marcador!: mapboxgl.Marker;
    add_btn: boolean = false;
    delete_btn: boolean = true;
    move_btn: boolean = true;
    zoom: number = 12;
    //@Output() zoomSlider:EventEmitter<MatSliderChange> = new EventEmitter<MatSliderChange>();

    constructor(private mapaService: MapaService,
        private cdRef: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        /** Deja de escuchar los eventos zoom del mapa */
        this.mapa.off('zoom', () => {});
    }

    ngAfterViewInit(): void {
        //compia el marcador del minimapa si existe marcador
        if (this.mapaService.dMiniMapa.marcador == true) {
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

        this.zoom = this.mapa.getZoom();

        //Si dMapa tiene marcador en true se crea el marcador y se centra en el
        if (this.mapaService.dMapa.marcador) {
            this.addMarker();
            this.flyToMarker();
        }

        //seccion para posicionar los controles
        const btnMarker = document.getElementById("add-marker");
        const btnZoom = document.getElementById('control-zoom');
        const map = document.getElementById("mapa").getBoundingClientRect();
        btnMarker.style.top = (map.top + 10) + "px";
        btnMarker.style.left = (map.left + 10) + "px";
        btnZoom.style.top = (map.left + 380) + "px";
        btnZoom.style.left = (map.left + 10) + "px";
        
        //Queda escuchando el evento zoom del mapa para ver cuando cuambia 
        // y actualizar el valor zoom que se muestra el la barra deslizable.
        this.mapa.on('zoom', (event) => {
            this.zoom = this.mapa.getZoom();
        })

        /** Queda escuchando el vento zoom del mapa para limitar que
         * no supere el valor que le asignemos
         */
        this.mapa.on('zoom', (event) => {
            if( this.mapa.getZoom() > 19 ){
                this.mapa.zoomTo(19);
            }
        })

        //es para que no se vea el error de cambio
        this.cdRef.detectChanges();
    }

    /**
     * Agrega un marcador y actualiza la información del mapa en el servicio mapa-service.
     */
    addMarker() {
        if (this.marcador === undefined) {
            this.marcador = new mapboxgl.Marker({
                color: "red",
                draggable: true
            })
                .setLngLat(this.mapa.getCenter())
                .addTo(this.mapa);
            this.mapaService.dMapa.marcador = true;
            this.mapaService.dMapa.zoom = 15;
            this.refreshButtons();
            this.marcador.on('dragend', () => {
                this.mapaService.dMapa.centro = { "lng": this.marcador.getLngLat().lng, "lat": this.marcador.getLngLat().lat };
            });
        }
    }

    /** 
     * Eliminar el marcador actual y aleja el zoom del mapa
     */
    deleteMarker() {
        if (this.marcador !== undefined) {
            this.marcador.off('dragend', () => { });
            this.mapa.flyTo({
                center: this.marcador.getLngLat(),
                zoom: 6
            });
            this.marcador.remove();
            this.marcador = undefined;
            this.mapaService.resetDataMapa();
            this.refreshButtons();
            this.zoom = this.mapa.getZoom();
            this.mapaService.resetDataMiniMapa();
        }
    }


    /** 
     * Mueve el mapa hasta la posición del marcador
     */
    flyToMarker() {
        if (this.marcador !== undefined) {
            this.mapa.flyTo({
                center: this.marcador.getLngLat(),
                zoom: 15,
                essential: true
            });
        }
    }

    /**
     * Actualiza el estado de los botones en función de sí existe marcador o no. 
     */
    refreshButtons() {
        if (this.marcador === undefined) {
            this.delete_btn = true;
            this.add_btn = false;
            this.move_btn = true;
        } else {
            this.delete_btn = false;
            this.add_btn = true;
            this.move_btn = false;
        }
    }

    /**
     * Aumenta el zoom del mapa cada vez que se presiona el botón más y actualiza el valor de la variable zoom
     */
    zoomIn() {
        this.mapa.zoomIn();
        this.zoom = this.mapa.getZoom();
    }

    /**
     * Desminuye el zoom del mapa cada vez que se presiona el botón menos y actualiza el valor de la variable zoom
     */
    zoomOut() {
        this.mapa.zoomOut()
        this.zoom = this.mapa.getZoom();
    }

    /**
     * Actualizar el zoom del mapa cada vez que se desliza la barra slider
     */
    updateZoom(){
        this.mapa.zoomTo(this.zoom);
    }

}
