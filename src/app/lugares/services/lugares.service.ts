import { Injectable } from '@angular/core';
import { Lugar } from '../interfaces/lugar.interface';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Item } from '../interfaces/item.interface';
import { Observable } from 'rxjs';

/*
const getObservable = (collection: AngularFirestoreCollection<Lugar> ) => {
  const subject = new BehaviorSubject([]);
  collection.valueChanges({ idField: 'id' }).subscribe((val: Lugar[]) => {
    subject.next(val);
  });
  return subject;
}
*/


@Injectable({
  providedIn: 'root'
})
export class LugaresService {


  constructor(private angularFirestore: AngularFirestore) {
  }
  
  
  
  getLugares() {
    return this.angularFirestore.collection('usuarios').snapshotChanges();
  }

  createLugar(lugar: Lugar){
    return new Promise<any>((resolve, reject) => {
      this.angularFirestore
      .collection('usuarios')
      .add(lugar)
      .then(
        response => {console.log(response)}, 
        error => reject(error))
    });
  }

  deleteLugar(lugar: Lugar) {
    return this.angularFirestore
      .collection('lugares')
      .doc(lugar.id)
      .delete();
  }

  updateLugar(lugar: Lugar, id: string) {
    return this.angularFirestore
      .collection('lugares')
      .doc(id)
      .update({
        
      });
  }

  

}
