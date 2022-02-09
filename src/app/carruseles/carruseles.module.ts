import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//Modulos Propios
import { CarruselesRoutingModule } from './carruseles-routing.module';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';

//Otros Modulos
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxPaginationModule } from 'ngx-pagination'; 

//Paginas y componentes 
import { SliderDondeComerComponent } from './pages/slider-donde-comer/slider-donde-comer.component';
import { SliderInfoComponent } from './pages/slider-info/slider-info.component';
import { SliderTarjetaComponent } from './components/slider-tarjeta/slider-tarjeta.component';
import { DialogEliminarComponent } from './components/dialog-eliminar/dialog-eliminar.component';
import { ImagenPipe } from './pipes/imagen.pipe';
import { TextoPantallaPipe } from './pipes/texto-pantalla.pipe';
import { DialogPublicarComponent } from './components/dialog-publicar/dialog-publicar.component';
import { SliderDondeDormirComponent } from './pages/slider-donde-dormir/slider-donde-dormir.component';
import { SliderLugaresComponent } from './pages/slider-lugares/slider-lugares.component';
import { SliderArtistasComponent } from './pages/slider-artistas/slider-artistas.component';
import { SliderEventosComponent } from './pages/slider-eventos/slider-eventos.component';


@NgModule({
  declarations: [
    DialogEliminarComponent,
    DialogPublicarComponent,
    ImagenPipe,
    SliderDondeComerComponent,
    SliderDondeDormirComponent,
    SliderInfoComponent,
    SliderLugaresComponent,
    SliderTarjetaComponent,
    SliderArtistasComponent,
    SliderEventosComponent,
    TextoPantallaPipe,
  ],
  imports: [
    CommonModule,
    CarruselesRoutingModule,
    FlexLayoutModule,
    MaterialModule,
    NgxPaginationModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,

  ]
})
export class CarruselesModule { }
