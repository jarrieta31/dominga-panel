import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DatosMapa, Posicion } from '../interfaces/datosMapa.interface';

@Injectable({
  providedIn: 'root'
})
export class MapaService {

  dMapa: DatosMapa;
  dMiniMapa: DatosMapa;
  mapaSubject$: Subject<Posicion>;
  miniMapaSubject$: Subject<DatosMapa>

  constructor() {
    this.mapaSubject$ = new Subject();
    this.miniMapaSubject$ = new Subject();
    this.dMapa = { centro: { lng: -56.43721973207522, lat: -32.824680163553545 }, zoom: 6, marcador: false };
    this.dMiniMapa = { centro: { lng: -56.43721973207522, lat: -32.824680163553545 }, zoom: 5, marcador: false };
  }

  /** Retorna un obsevable para ver el estado del minimapa */
  getObsMiniMapa(): Observable<DatosMapa> {
    return this.miniMapaSubject$.asObservable();
  }

  /** Retorna un obsevable para ver el estado del mapa */
  getObsMapa(): Observable<Posicion> {
    return this.mapaSubject$.asObservable();
  }

  /** Limpia los dato del mapa */
  resetDataMapa() {
    this.dMapa = { centro: { lng: -56.43721973207522, lat: -32.824680163553545 }, zoom: 6, marcador: false };
  }
  
  /** Limpia los datos del minimapa */
  resetDataMiniMapa() {
    this.dMiniMapa = { centro: { lng: -56.43721973207522, lat: -32.824680163553545 }, zoom: 5, marcador: false };
    this.emitirMiniMapa();
  }

  /**Emite el nuevo valor de dataMap a todos los subscriptores y
   * setea el valor de dataMapa
   */
  emitirDataMap(posicion:Posicion){
    this.mapaSubject$.next(posicion);
    this.dMiniMapa.centro = posicion;
    this.dMiniMapa.zoom = 15;
    this.dMiniMapa.marcador = true;
  }

  /** actualiza el minimapa con los datos de dMiniMapa y emite su valor todos los observadores */
  emitirMiniMapa(){
    this.miniMapaSubject$.next(this.dMiniMapa);
  }


  


}
