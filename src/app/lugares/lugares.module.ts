import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';

//Módulos propios
import { LugaresRoutingModule } from './lugares-routing.module';
import { MaterialModule } from '../material/material.module';

//Componentes
import { AgregarComponent } from './pages/agregar/agregar.component';
import { BuscarComponent } from './pages/buscar/buscar.component';
import { LugarComponent } from './pages/lugar/lugar.component';
import { HomeComponent } from './pages/home/home.component';
import { ListadoComponent } from './pages/listado/listado.component';
import { LugarTarjetaComponent } from './components/lugar-tarjeta/lugar-tarjeta.component';
import { ImagenPipe } from './pipes/imagen.pipe';
import { DeleteHtmlPipe } from './pipes/delete-html.pipe';
import { RecortarParrafoPipe } from './pipes/recortar-parrafo.pipe';



@NgModule({
  declarations: [
    AgregarComponent,
    BuscarComponent,
    LugarComponent,
    HomeComponent,
    ListadoComponent,
    LugarTarjetaComponent,
    ImagenPipe,
    DeleteHtmlPipe,
    RecortarParrafoPipe
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    FormsModule,
    MaterialModule,
    LugaresRoutingModule
  ]
})
export class LugaresModule { }
