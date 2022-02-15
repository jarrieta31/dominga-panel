import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { animate,  state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'image-async',
    templateUrl: 'loading-image.component.html',
    styleUrls:['loading-image.component.css'],
    animations: [
        trigger('imageAnimation',[
          state('show-image', style({
            opacity:'1',
          })),
          state('hide-image', style({
            opacity:'0'
          })),
          transition('show-image <=> hide-image', animate('1000ms ease-in')),
        ])
      ]
})

export class LoadingImageComponent implements OnInit {
    imageCtrl : string = 'hide-image';
    contentCtrl : string = 'show-image';

    @Input('url') set url(url:string){        
        if(url){                   
            this.loadImage(url);            
        }        
    }
    @ViewChild('lImage') lImage : ElementRef;
    
    constructor() { }

    ngOnInit() {
        this.lImage.nativeElement.onload=()=>{             
            this.imageCtrl='show-image';
            this.contentCtrl='hide-image';                   
        }
     }

    loadImage(urlImage){
        this.imageCtrl='hide-image';
        this.contentCtrl='show-image';  
        this.lImage.nativeElement.src = urlImage;        
    }
}
