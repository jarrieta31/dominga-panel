import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-dialog-publicar',
    templateUrl: './dialog-publicar.component.html',
    styleUrls: ['./dialog-publicar.component.css']
})
export class DialogPublicarComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<DialogPublicarComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }

    ngOnInit(): void {
    }


    /**
     * Cierra el dialog que advierte cuando se va a eliminar un lugar
     */
    closeDialog() {
        this.dialogRef.close();
    }
}
