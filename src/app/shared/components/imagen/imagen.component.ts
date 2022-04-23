import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Imagen } from '../../../shared/interfaces/imagen.interface';

@Component({
    selector: 'app-imagen',
    templateUrl: './imagen.component.html',
    styleUrls: ['./imagen.component.css']
})
export class ImagenComponent implements OnInit {
     
    // nuevo Esta variable nos dara el control si debemos de mostrar la imagen o no debemos de mostrarla.
    // @value: false = la imagen no se cargo (se muestra aun el loading).
    // @value: true  = la imagen se cargo , desaparece el loading y muestra la imagen.
    viewImage : boolean = false; 
    
    
    // Obtenemos una referencia hacia el tag "<img>" para poder manipularlo luego
    @ViewChild('lImage') lImage : ElementRef;


    constructor(
private cdRef: ChangeDetectorRef,
    ) { }

    
    //codigo viejo
    @Input() imagen: Imagen;
    @Output() imagenABorrar: EventEmitter<string> = new EventEmitter<string>();

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
        //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        //Add 'implements AfterViewInit' to the class.
    //    this.lImage.nativeElement.onload = () => {
    //        console.log('Carga completada')
    //        this.viewImage = true;
    //    }
    //    this.cdRef.detectChanges();
    }

    mostrarImagen(){
        this.viewImage = true;
    }

    removerImagen(imagen: string) {

        this.imagenABorrar.emit(imagen);
    }

}
