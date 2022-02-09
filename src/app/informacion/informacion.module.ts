import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

//Modulos propios
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';

//Otros Modulos
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxPaginationModule } from 'ngx-pagination';
import { InformacionRoutingModule } from './informacion-routing.module';
import { AgregarComponent } from './pages/agregar/agregar.component';
import { ListadoComponent } from './pages/listado/listado.component';
import { DialogPublicarComponent } from './components/dialog-publicar/dialog-publicar.component';
import { DialogEliminarComponent } from './components/dialog-eliminar/dialog-eliminar.component';
import { InformacionTarjetaComponent } from './components/informacion-tarjeta/informacion-tarjeta.component';



@NgModule({
    declarations: [
        AgregarComponent,
        ListadoComponent,
        DialogPublicarComponent,
        DialogEliminarComponent,
        InformacionTarjetaComponent,
  ],
    imports: [
        CommonModule,
        FlexLayoutModule,
        HttpClientModule,
        InformacionRoutingModule,
        MaterialModule,
        NgxPaginationModule,
        ReactiveFormsModule,
        SharedModule,
    ]
})
export class InformacionModule { }
