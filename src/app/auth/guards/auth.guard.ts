import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanLoad, Route, RouterStateSnapshot, UrlSegment, UrlTree, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanLoad, CanActivate {

    idUser: string;
    subscrictionUser: Subscription;

    constructor(
        private authService: AuthService,
        private router: Router,
    ) {
    //obtiene el id del usuario actual
    this.subscrictionUser = this.authService.currentUser
        .pipe(
            tap(res => console.log( res ))
        )
        .subscribe(authData => {
            if (authData) {
                this.idUser = authData.uid
            }
        });
    }
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if (this.idUser) {
            return true;
        } else {
            console.log('Bloqueado por el AuthGuard canActivate')
            this.router.navigate(["/auth/login"]);
            return false;
        }
    }

    /**
     * Bloquea la carga de un módulo
     * @param route 
     * @param segments 
     * @returns 
     */
    canLoad(
        route: Route,
        segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
        if (this.idUser ) {
            return true;
        } else {
            console.log('Bloqueado por el AuthGuard canLoad')
            this.router.navigate(["/auth/login"]);
            return false;
        }
    }

}
