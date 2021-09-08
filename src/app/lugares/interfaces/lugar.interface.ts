export interface Lugar {
    id?: string;
    activo: boolean;
    auto?: boolean;
    bicicleta?: boolean;
    caminar?: boolean;
    descripcion?: string;
    imagenHome?: string;
    facebook?: string;
    imagenPrincipal?: string;
    instagram?: string;
    latitud: number;
    longitud: number;
    nombre: string;
    tipo: string;
    url?: Url[];
    valoracion?: Valoracion[];
    videos?: Video[];
    web?: string;
    whatsapp?: string;
    distancia?: string;
    distanciaNumber?: number;
    phone?: string;    
}

interface Url {
    url: string;
}

interface Valoracion{
    usuario: string;
    valor: number;
}

interface Video{
    url: string;
}
