import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DatosMapa, Posicion } from '../../interfaces/datosMapa.interface';
import { MapaComponent } from '../mapa/mapa.component';
import { MapaService } from '../../services/mapa.service';

@Component({
  selector: 'app-dialog-mapa',
  templateUrl: './dialog-mapa.component.html',
  styleUrls: ['./dialog-mapa.component.css']
})
export class DialogMapaComponent implements OnInit {


  constructor(
    public dialogRef: MatDialogRef<DialogMapaComponent>,
    private mapaService: MapaService,
    @Inject(MAT_DIALOG_DATA) public data: Posicion) {


  }

  confirmarMapa() {
    if (this.mapaService.dMapa.marcador == true) {
      this.mapaService.dMiniMapa.centro = this.mapaService.dMapa.centro;
      this.mapaService.dMiniMapa.marcador = true;
      this.mapaService.dMiniMapa.zoom = 15;
      this.mapaService.emitirMiniMapa();
    }
    else {
      //si no hay marcador resetea los datos del minimapa
      this.mapaService.resetDataMiniMapa();
      this.mapaService.emitirMiniMapa()
    }
  }

  ngOnInit(): void {
  }

  closeDialog() {
    this.mapaService.resetDataMapa();
    this.dialogRef.close();
  }

}
