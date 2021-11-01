import { Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private referencia: AngularFireStorageReference;

  constructor(
    private storage: AngularFireStorage) {
    //this.pageTokenExample();
  }

  /**
   * Función para subir los ficheros al Storage de Firebase.
   * @param nombreArchivo - Nombre del archivo a subir.
   * @param datos - El es propio archivo
   * @returns 
   */
  public subirArchivoCloudStorage(directorio: string, nombreArchivo: string, datos: any) {
    return this.storage.upload(`${directorio}/${nombreArchivo}`, datos);
  }

  /**
   * Obtiene una referencia al archvo en la nube de firebase storage.
   * @param {string} nombreArchivo - Nombre del archivo al que queremos referenciar.
   * @returns - Refercia al archivo.
   */
  public referenciaCloudStorage(directorio: string, nombreArchivo: string) {
    return this.storage.ref(`${directorio}/${nombreArchivo}`);
  }

  /**
   * Borra un archivo del Storage de Firebase.
   * El nombre del directorio donde se encuentra el archivo depende de la variable
   * basePath.
   * @param {string} nombreArchivo - Nombre del archivo que queremos borrar.
   */
  public borrarArchivoStorage(directorio: string, nombreArchivo: string) {
    const storageRef = this.storage.ref(directorio);
    storageRef.child(nombreArchivo).delete();
  }
}



