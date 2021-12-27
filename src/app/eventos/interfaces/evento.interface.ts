import { Imagen } from '../../shared/interfaces/imagen.interface';
import { Posicion } from '../../shared/interfaces/datosMapa.interface';
import { Timestamp } from '../../shared/interfaces/timestamp.interface';

export interface Evento{
        carpeta:string;
        departamento: string;
        descripcion: string;
        direccion?: string;
        facebook?: string;
        fecha?: Timestamp;
        id?: string;
        imagen: Imagen;
        instagram: string;
        localidad: string;
        lugar?: string;
        nombre: string; 
        publicado: boolean;
        ticktAntel?: string;
        tipo?:string;
        ubicacion?: Posicion;
        whatsapp?: string; 
}