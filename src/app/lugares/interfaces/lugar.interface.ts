import { Posicion } from '../../shared/interfaces/datosMapa.interface';
import { Imagen } from '../../shared/interfaces/imagen.interface';
import { Telefono } from '../../shared/interfaces/telefono.interface';
import { Video } from '../../shared/interfaces/video.interface';


export interface Lugar {
    accesibilidad?: boolean;
    auto?: boolean;
    bicicleta?: boolean;
    caminar?: boolean;
    departamento: string;
    descripcion?: string;
    carpeta:string;
    facebook?: string;
    id?: string;
    imagenHome?: Imagen;
    imagenPrincipal?: Imagen;
    imagenes?: Imagen[];
    instagram?: string;
    localidad: string;
    nombre: string;
    patrimonial: boolean;
    prioridad: number;
    publicado: boolean;
    telefonos?: Telefono[];
    tipo: string;
    ubicacion: Posicion;
    valoraciones?: Valoracion[];
    videos?: Video[];
    web?: string;
    whatsapp?: string;
}


export interface Valoracion {
    usuario: string;
    valor: number;
}
