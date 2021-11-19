import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorPageComponent } from './error-page/error-page.component';
import { UploadFilesComponent } from './components/upload-files/upload-files.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ImagenComponent } from './components/imagen/imagen.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from '../material/material.module';
import { MiniMapaComponent } from './components/mini-mapa/mini-mapa.component';
import { MapaComponent } from './components/mapa/mapa.component';
import { DialogMapaComponent } from './components/dialog-mapa/dialog-mapa.component';
import { QuitarEspaciosPipe } from './pipes/quitar-espacios.pipe';


@NgModule({
  declarations: [
    ErrorPageComponent,
    UploadFilesComponent,
    ImagenComponent,
    MiniMapaComponent,
    MapaComponent,
    DialogMapaComponent,
    QuitarEspaciosPipe
  ],
  exports:[
    ErrorPageComponent,
    UploadFilesComponent,
    ImagenComponent,
    MiniMapaComponent,
    MapaComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule
  ]
})
export class SharedModule { }
