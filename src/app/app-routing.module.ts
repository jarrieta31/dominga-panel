import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorPageComponent } from './shared/error-page/error-page.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { AngularFireAuthGuard, hasCustomClaim, redirectUnauthorizedTo, redirectLoggedInTo, loggedIn  } from '@angular/fire/compat/auth-guard';
import { SharePlaceComponent } from './shared/pages/share-place/share-place.component';

//const adminOnly = () => hasCustomClaim('admin');
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['/auth/login']);
const redirectLoggedInToLugares = () => redirectLoggedInTo(['/lugares/listado']);
//const belongsToAccount = (next) => hasCustomClaim(`account-${next.params.id}`);
//const redirectLoggedInTo = () => redirectLoggedInTo(['/lugares/listado']);

const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
//        canActivate: [AngularFireAuthGuard], 
//        data: { authGuardPipe: redirectLoggedInTo }
        canActivate: [AngularFireAuthGuard], 
        data: { authGuardPipe:  redirectLoggedInToLugares}
    },
    {
        path: 'lugares',
        loadChildren: () => import('./lugares/lugares.module').then(m => m.LugaresModule),
        canActivate: [AngularFireAuthGuard], 
        data: { authGuardPipe: redirectUnauthorizedToLogin }
    },
    {
        path: 'eventos',
        loadChildren: () => import('./eventos/eventos.module').then(m => m.EventosModule),
        canActivate: [AngularFireAuthGuard], 
        data: { authGuardPipe: redirectUnauthorizedToLogin }
    ///    canLoad: [ AuthGuard ],
    ///    canActivate: [ AuthGuard ],
    },
    {
        path: 'donde-dormir',
        loadChildren: () => import('./donde-dormir/donde-dormir.module').then(m => m.DondeDormirModule),
        canActivate: [AngularFireAuthGuard], 
        data: { authGuardPipe: redirectUnauthorizedToLogin }
    ///    canLoad: [ AuthGuard ],
    ///    canActivate: [ AuthGuard ],
    },
    {
        path: 'donde-comer',
        loadChildren: () => import('./donde-comer/donde-comer.module').then(m => m.DondeComerModule),
        canActivate: [AngularFireAuthGuard], 
        data: { authGuardPipe: redirectUnauthorizedToLogin }
    ///    canLoad: [ AuthGuard ],
    ///    canActivate: [ AuthGuard ],
    },
    {
        path: 'artistas',
        loadChildren: () => import('./artistas/artistas.module').then(m => m.ArtistasModule),
        canActivate: [AngularFireAuthGuard], 
        data: { authGuardPipe: redirectUnauthorizedToLogin }
    ///    canLoad: [ AuthGuard ],
    ///    canActivate: [ AuthGuard ],
    },
    {
        path: 'carruseles',
        loadChildren: () => import('./carruseles/carruseles.module').then(m => m.CarruselesModule),
        canActivate: [AngularFireAuthGuard], 
        data: { authGuardPipe: redirectUnauthorizedToLogin }
    ///    canLoad: [ AuthGuard ],
    ///    canActivate: [ AuthGuard ],
    },
    {
        path: 'informacion',
        loadChildren: () => import('./informacion/informacion.module').then(m => m.InformacionModule),
        canActivate: [AngularFireAuthGuard], 
        data: { authGuardPipe: redirectUnauthorizedToLogin }
    //    canLoad: [ AuthGuard ],
    //    canActivate: [ AuthGuard ],
    },
    {
        path: 'share-place/:id',
        component: SharePlaceComponent,
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
