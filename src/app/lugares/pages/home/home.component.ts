import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

    idUser: string;
    nameUser: string;
    emailUser: string;
    constructor(
        private authService: AuthService,
        private router: Router,

    ) {

    }
    ngOnInit(): void {
        this.subscrictionUser;
        console.log(this.idUser)
    }

    //obtiene el id del usuario actual
    subscrictionUser = this.authService.currentUser.subscribe(authData => {
        if (authData) {
            this.idUser = authData.uid
            this.nameUser = authData.displayName;
            this.emailUser = authData.email;
            console.log(authData)
            console.log(authData.email)
        }
    }
    );


    cerrarSesion() {
        this.authService.signOut();
        this.router.navigate(['/auth/login']);
    }



}
