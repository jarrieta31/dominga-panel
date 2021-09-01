export interface Lugar {
    id: string;
    auto: boolean;
    bicicleta: boolean;
    caminar: boolean;
    descripcion: string;
    nombre: string;
    url: string[];
    valoracion: string[];
    tipo: string;
    latitud: string;
    longitud: string;
    imagenPrincipal?: string;
    distancia?: string;
    distanciaNumber?: number;
    imagenHome?: string;
    web?: string;
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    phone?: string;
}
