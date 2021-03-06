import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorPageComponent } from './error-page/error-page.component';
import { UploadFilesComponent } from './components/upload-files/upload-files.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ImagenComponent } from './components/imagen/imagen.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../material/material.module';
import { MiniMapaComponent } from './components/mini-mapa/mini-mapa.component';
import { MapaComponent } from './components/mapa/mapa.component';
import { DialogMapaComponent } from './components/dialog-mapa/dialog-mapa.component';
import { QuitarEspaciosPipe } from './pipes/quitar-espacios.pipe';
import { ImagenPipe } from './pipes/imagen.pipe';
import { RecortarParrafoPipe } from './pipes/recortar-parrafo.pipe';
import { RecortarTituloPipe } from './pipes/recortar-titulo.pipe';
import { LoadingImageComponent } from './components/loading-image/loading-image.component';
import { SubirUnaImagenComponent } from './components/subir-una-imagen/subir-una-imagen.component';
import { SubirMultiplesImagensComponent } from './components/subir-multiples-imagens/subir-multiples-imagens.component';



@NgModule({
    declarations: [
        DialogMapaComponent,
        ErrorPageComponent,
        ImagenComponent,
        ImagenPipe,
        MapaComponent,
        MiniMapaComponent,
        QuitarEspaciosPipe,
        RecortarParrafoPipe,
        RecortarTituloPipe,
        UploadFilesComponent,
        LoadingImageComponent,
        SubirUnaImagenComponent,
        SubirMultiplesImagensComponent,
    ],
    exports: [
        ErrorPageComponent,
        ImagenComponent,
        MapaComponent,
        MiniMapaComponent,
        RecortarParrafoPipe,
        RecortarTituloPipe,
        UploadFilesComponent,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        MaterialModule
    ]
})
export class SharedModule { }
