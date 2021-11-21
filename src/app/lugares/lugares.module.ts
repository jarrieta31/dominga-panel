import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

//otros
import { AngularEditorModule } from '@kolkov/angular-editor';

//Módulos propios
import { LugaresRoutingModule } from './lugares-routing.module';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';

//Componentes
import { AgregarComponent } from './pages/agregar/agregar.component';
import { BuscarComponent } from './pages/buscar/buscar.component';
import { DeleteHtmlPipe } from './pipes/delete-html.pipe';
import { DialogEliminarComponent } from './components/dialog-eliminar/dialog-eliminar.component';
import { HomeComponent } from './pages/home/home.component';
import { ImagenPipe } from './pipes/imagen.pipe';
import { ListadoComponent } from './pages/listado/listado.component';
import { LugarComponent } from './pages/lugar/lugar.component';
import { LugarTarjetaComponent } from './components/lugar-tarjeta/lugar-tarjeta.component';
import { RecortarParrafoPipe } from './pipes/recortar-parrafo.pipe';


@NgModule({
    declarations: [
        AgregarComponent,
        BuscarComponent,
        DeleteHtmlPipe,
        DialogEliminarComponent,
        HomeComponent,
        ImagenPipe,
        ListadoComponent,
        LugarComponent,
        LugarTarjetaComponent,
        RecortarParrafoPipe,
    ],
    imports: [
        AngularEditorModule,
        CommonModule,
        FlexLayoutModule,
        FormsModule,
        HttpClientModule,
        LugaresRoutingModule,
        MaterialModule,
        ReactiveFormsModule,
        SharedModule,
    ]
})
export class LugaresModule { }
