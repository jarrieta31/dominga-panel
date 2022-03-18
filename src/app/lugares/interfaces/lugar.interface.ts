import { Posicion } from '../../shared/interfaces/datosMapa.interface';
import { Imagen } from '../../shared/interfaces/imagen.interface';
import { Telefono } from '../../shared/interfaces/telefono.interface';
import { Video } from '../../shared/interfaces/video.interface';
import { Accesibilidad } from '../../shared/interfaces/accesibilidad.interface';


export interface Lugar {
    accesibilidad?:Accesibilidad;
    auto?: boolean;
    bicicleta?: boolean;
    caminar?: boolean;
    carpeta:string;
    departamento: string;
    descripcion?: string;
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
