import { Imagen } from '../../shared/interfaces/imagen.interface';
import { Posicion } from '../../shared/interfaces/datosMapa.interface';

export interface Evento{
        carpeta:string;
        departamento: string;
        descripcion: string;
        direccion?: string;
        facebook?: string;
        fechaFin?: any;
        fechaInicio: any;
        id?: string;
        imagen: Imagen;
        instagram: string;
        localidad: string;
        lugar: string;
        moneda: string;
        nombre: string; 
        precio: number;
        precioUnico: boolean;
        publicado: boolean;
        ticktAntel?: string;
        tipo:string;
        ubicacion: Posicion;
        whatsapp?: string; 
}