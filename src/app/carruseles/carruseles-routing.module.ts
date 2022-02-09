import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';


import { HomeComponent } from '../lugares/pages/home/home.component';
import { SliderDondeComerComponent } from './pages/slider-donde-comer/slider-donde-comer.component';
import { SliderInfoComponent } from './pages/slider-info/slider-info.component';
import { SliderDondeDormirComponent } from './pages/slider-donde-dormir/slider-donde-dormir.component';
import { SliderLugaresComponent } from './pages/slider-lugares/slider-lugares.component';
import { SliderArtistasComponent } from './pages/slider-artistas/slider-artistas.component';
import { SliderEventosComponent } from './pages/slider-eventos/slider-eventos.component';

const routes: Routes = [
    {
        path: '',
        component: HomeComponent, //ruta padre
        children: [
            {
                path: 'slider-donde-comer',
                component: SliderDondeComerComponent 
            },
            {
                path: 'slider-donde-dormir',
                component: SliderDondeDormirComponent
            },
            {
                path: 'slider-informacion',
                component: SliderInfoComponent
            },
            {
                path: 'slider-lugares',
                component: SliderLugaresComponent
            },
            {
                path: 'slider-artistas',
                component: SliderArtistasComponent
            },
            {
                path: 'slider-eventos',
                component: SliderEventosComponent
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
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule
  ]
})
export class CarruselesRoutingModule { }
