import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//Paginas
import { AgregarComponent } from './pages/agregar/agregar.component';
import { HomeComponent } from '../lugares/pages/home/home.component';
import { ListadoComponent } from './pages/listado/listado.component';


const routes: Routes = [
    {
        path: '',
        component: HomeComponent, //ruta padre
        children: [
            {
                path: 'listado',
                component: ListadoComponent
            },
            {
                path: 'agregar',
                component: AgregarComponent
            },
            {
                path: 'editar/:id',
                component: AgregarComponent
            },
            {
                path: '**',
                redirectTo: '/404'
            }
        ]
    }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
      RouterModule,
  ]
})
export class ArtistasRoutingModule { }
