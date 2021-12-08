import { Posicion } from '../../shared/interfaces/datosMapa.interface';
import { FolderStorage } from '../../shared/interfaces/folderStorage';



export interface Lugar {
    accesibilidad?: boolean;
    auto?: boolean;
    bicicleta?: boolean;
    caminar?: boolean;
    departamento: string;
    descripcion?: string;
    carpeta?:FolderStorage;
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
    telefonos?: string[];
    tipo: string;
    ubicacion: Posicion;
    valoraciones?: Valoracion[];
    videos?: Video[];
    web?: string;
    whatsapp?: string;
}

export interface Imagen {
    name: string;
    url: string;
}

export interface Valoracion {
    usuario: string;
    valor: number;
}

export interface Video {
    name: string;
    url: string;
}

