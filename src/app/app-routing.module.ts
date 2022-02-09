import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorPageComponent } from './shared/error-page/error-page.component';
import { AuthGuard } from './auth/guards/auth.guard';

const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: 'lugares',
        loadChildren: () => import('./lugares/lugares.module').then(m => m.LugaresModule),
        canLoad: [ AuthGuard ],
        canActivate: [ AuthGuard ],
    },
    {
        path: 'eventos',
        loadChildren: () => import('./eventos/eventos.module').then(m => m.EventosModule),
        canLoad: [ AuthGuard ],
        canActivate: [ AuthGuard ],
    },
    {
        path: 'donde-dormir',
        loadChildren: () => import('./donde-dormir/donde-dormir.module').then(m => m.DondeDormirModule),
        canLoad: [ AuthGuard ],
        canActivate: [ AuthGuard ],
    },
    {
        path: 'donde-comer',
        loadChildren: () => import('./donde-comer/donde-comer.module').then(m => m.DondeComerModule),
        canLoad: [ AuthGuard ],
        canActivate: [ AuthGuard ],
    },
    {
        path: 'artistas',
        loadChildren: () => import('./artistas/artistas.module').then(m => m.ArtistasModule),
        canLoad: [ AuthGuard ],
        canActivate: [ AuthGuard ],
    },
    {
        path: 'carruseles',
        loadChildren: () => import('./carruseles/carruseles.module').then(m => m.CarruselesModule),
        canLoad: [ AuthGuard ],
        canActivate: [ AuthGuard ],
    },
    {
        path: 'informacion',
        loadChildren: () => import('./informacion/informacion.module').then(m => m.InformacionModule),
        canLoad: [ AuthGuard ],
        canActivate: [ AuthGuard ],
    },
    {
        path: '404',
        component: ErrorPageComponent
    },
    {
        path: '**',
        redirectTo: '/lugares/listado'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
