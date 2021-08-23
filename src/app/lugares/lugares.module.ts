import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

//Módulos propios
import { LugaresRoutingModule } from './lugares-routing.module';
import { MaterialModule } from '../material/material.module';

//Componentes
import { AgregarComponent } from './pages/agregar/agregar.component';
import { BuscarComponent } from './pages/buscar/buscar.component';
import { LugarComponent } from './pages/lugar/lugar.component';
import { HomeComponent } from './pages/home/home.component';
import { ListadoComponent } from './pages/listado/listado.component';



@NgModule({
  declarations: [
    AgregarComponent,
    BuscarComponent,
    LugarComponent,
    HomeComponent,
    ListadoComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    LugaresRoutingModule
  ]
})
export class LugaresModule { }
