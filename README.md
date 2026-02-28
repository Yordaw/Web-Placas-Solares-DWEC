# ☀️ Solar - Gestor de Plantas Solares

**Proyecto DWEC** (Desarrollo de Aplicaciones Web en Entorno Cliente)

## 1. Requisitos Iniciales

**Repositorio del Profesor:** [https://github.com/xxjcaxx/exemples-dwec/tree/master/09-angular/2526/solar](https://github.com/xxjcaxx/exemples-dwec/tree/master/09-angular/2526/solar)

Objectius inicials:
- La base de dades serà Supabase
- Utilitzarem SDK de supabase per autenticar, dades, imatges i websockets
- RLS per als permisos dels clients
- Es guarden les plantes solars amb ubicació i foto de forma que l'instal·lador les puga donar d'alta amb el mòvil. La ubicació es trau de l'API del navegador.
- Cada planta solar emet uns registres cada cert temps que es guarden a la base de dades. Aquests registres són de consum i generació elèctrica.
- Cal fer un usuari administrador que ho pot gestionar tot. (CRUD)
- Els usuaris clients poden veure les seues plantes i registres de les mateixes.
- Cada planta tindrà una vista de detall amb la foto, les dades i una gràfica en temps real amb websockets i alguna llibreria de gráfiques.

**Formularis:**
- Formulari de plantilla per al buscador reactiu de plantes solars
- Formulari reactiu per al registre, login i perfil d'usuari
- Signal Form per a donar d'alta i editar plantes solars
- Tots els formularis tenen validació i es farà una validació personalitzada al menys

**Reactivitat:**
- Els servicis utilitzaran Observables i Subjects amb pipe, també els web sockets
- Els components i formularis utilitzaran majoritariament Signals

**Components:**
- Els components obtindran les dades per input() ja siga de components pares o de les rutes
- Els components fills que tinguen interaccions es comuniquen amb els pares amb output()
- Els components principals són els que es relacionen amb els servicis principalment amb Observables

**Ampliacions:**
- Opcionalment es veurà un mapa amb totes les plantes de tots els clients o per client
- Es mantindrà l'estat de l'aplicació amb Redux
- S'utilitzaran components d'Angular Material

> **Nota:** Finalmente, no se han implementado WebSockets en esta versión. Los datos se actualizan mediante consultas convencionales a la API de Supabase. La funcionalidad de tiempo real es una simulación.

---

## 2. Descripción General

**Lux Solar** es una aplicación web moderna para la gestión integral de plantas solares. Permite a administradores crear, actualizar y eliminar plantas solares con sus datos de ubicación y fotografías. Los usuarios clientes pueden visualizar sus plantas asignadas, consultar datos de generación y consumo eléctrico, y acceder a gráficas en tiempo real.

Características principales:
- ✅ Autenticación segura con Supabase Auth
- ✅ Gestión de plantas solares con ubicación GPS y fotografías
- ✅ Buscador reactivo en tiempo real
- ✅ Vista de mapa con todas las plantas
- ✅ Gráficas de consumo y generación eléctrica
- ✅ Sistema de roles (Admin/Cliente)
- ✅ Validación completa de formularios (Formularios de Plantilla, Reactive-Forms y Signal-Forms)
- ✅ Control de acceso basado en roles (RLS)
- ✅ Interfaz responsive y moderna

---

## 3. Tecnologías Utilizadas

| Tecnología | Uso |
|------------|-----|
| **Angular v21+** | Framework frontend moderno con Signals |
| **TypeScript** | Tipado estático |
| **Supabase** | Backend (auth, BD, storage) |
| **Signal Forms API** | Validación reactiva (Plantas CRUD) |
| **Reactive Forms** | Formularios Login, Register, Profile |
| **Template Forms** | Buscador (header) |
| **Leaflet.js** | Mapas interactivos |
| **Chart.js** | Gráficas de datos |
| **Bootstrap 5** | Framework CSS |
| **RxJS** | Programación reactiva |

---

## 4. Estructura del Proyecto

```
solar/
├── src/app/
│   ├── components/
│   │   ├── header/              → Buscador (Template Form)
│   │   ├── login/               → Reactive Form
│   │   ├── register/            → Reactive Form + validación
│   │   ├── profile/             → Reactive Form + badge rol
│   │   └── home/
│   │
│   ├── plantes/
│   │   ├── plantes-list/        → Búsqueda reactiva
│   │   ├── plantes-table/       → Signal Forms API
│   │   ├── plantes-detail/      → Gráficas
│   │   ├── plantes-map/         → Leaflet
│   │   └── plantes-item/
│   │
│   ├── services/
│   │   ├── supaservice.ts       → CRUD, auth, uploads
│   │   ├── busqueda.service.ts  → Búsqueda centralizada
│   │   └── guards/
│   │       ├── auth.guard.ts
│   │       └── admin.guard.ts
│   │
│   └── app.ts
│
├── public/imagenesDocu/         → 1.png - 16.png
└── README.md
```

---

## 5. Tipos de Formularios

### A) Reactive Forms (Login, Register, Profile)
- Validación granular
- Validadores personalizados
- Mensajes de error específicos

### B) Template Forms (Buscador Header)
- Binding simple con ngModel
- Bajo overhead
- Integración con Signals

### C) Signal Forms API (Plantas CRUD)
- API nativa Angular v21+
- Validadores signal-based
- Binding con [formField]
- Errores reactivos

---

## 6. Validaciones

✅ Validators.required, email, minLength
✅ Validador personalizado (passwordIguales en Register)
✅ Signal Forms validators (required, min)
✅ Mensajes inline bajo cada campo
✅ Estados (touched, invalid, pristine)

---

## 7. Roles de Usuario

**Administrador:** CRUD completo, gestión de usuarios
**Cliente:** Ver plantas asignadas, datos personales

---

## 8. Características Principales

- 🔐 Autenticación (Reactive Forms)
- 🌍 Geolocalización (navigator.geolocation)
- 📸 Upload de imágenes (Supabase Storage)
- 🔍 Búsqueda reactiva (Template Form)
- 📊 Gráficas (Chart.js)
- 🗺️ Mapa interactivo (Leaflet)
- ⚡ Control de acceso RLS

---

## 9. Metodologías Implementadas

**Angular v21+ Moderno:**
- ✅ Signals (no RxJS)
- ✅ @if, @for, @switch (no *ngIf, *ngFor)
- ✅ input(), output() (no @Input, @Output)
- ✅ ChangeDetectionStrategy.OnPush
- ✅ Signal Forms API

---

## 10. Paleta de Colores

Se ha apostado por un **degradado verde-azul-amarillo** que crea un contraste visual moderno y energético. El esquema combina colores naturales (verde para energía renovable) con tonalidades vibrantes que destacan elementos interactivos.

**Degradado Principal (Botones y Elementos Destacados):**
- 🟢 **Verde Éxito** (#198754): 35% - Base natural y confianza
- 🔵 **Azul Principal** (#0d6efd): 40% - Interactividad y profesionalismo
- 🟡 **Amarillo Solar** (#f1b24a): 25% - Energía y contraste solar

| Color | Código | Uso |
|-------|--------|-----|
| Amarillo Solar | #f1b24a | Acentos, icono perfil, energía |
| Azul Principal | #0d6efd | Botones, links, interactividad |
| Rojo | #dc3545 | Errores, eliminar, peligro |
| Verde | #198754 | Éxito, validación, energía renovable |
| Gris | #f8f9fa | Fondos, superficies neutras |

**Tema:** Claro con degradado solar verde-azul, ideal para aplicación de energías renovables

---

## 11. Instalación

```bash
npm install
ng serve
```

Acceder a `http://localhost:4200/`

---

## 12. Rutas

| Ruta | Guard | Acceso |
|------|-------|--------|
| `/login` | - | Público |
| `/register` | - | Público |
| `/profile` | auth | Autenticado |
| `/plantes` | auth | Autenticado |
| `/plantes_table` | admin | Admin |
| `/mapa` | auth | Autenticado |

---

**Versión:** v1.0.0
**Proyecto DWEC:** Desarrollo de Aplicaciones Web en Entorno Cliente
**Última actualización:** Febrero 2026
