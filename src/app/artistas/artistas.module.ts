import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

//Paginas
import { ArtistaComponent } from './pages/artista/artista.component';
import { AgregarComponent } from './pages/agregar/agregar.component';
import { ListadoComponent } from './pages/listado/listado.component';

//Componentes
import { DialogEliminarComponent } from './components/dialog-eliminar/dialog-eliminar.component';
import { ArtistaTarjetaComponent } from './components/artista-tarjeta/artista-tarjeta.component';
import { DialogPublicarComponent } from './components/dialog-publicar/dialog-publicar.component';

import { FiltrosPipe } from './pipes/filtros.pipe';

//Modulos propios
import { ArtistasRoutingModule } from './artistas-routing.module';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';

//Otros Modulos
import { AngularEditorModule } from '@kolkov/angular-editor';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { ImagenPipe } from './pipes/imagen.pipe'; 


@NgModule({
    declarations: [
        AgregarComponent,
        ArtistaComponent,
        ArtistaTarjetaComponent,
        DialogEliminarComponent,
        DialogPublicarComponent,
        FiltrosPipe,
        ListadoComponent,
        ImagenPipe,
    ],
    imports: [
        AngularEditorModule,
        ArtistasRoutingModule,
        CommonModule,
        FlexLayoutModule,
        FormsModule,
        HttpClientModule,
        MaterialModule,
        NgxPaginationModule,
        ReactiveFormsModule,
        SharedModule,
    ]
})
export class ArtistasModule { }
