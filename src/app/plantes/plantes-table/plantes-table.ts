import { Component, ChangeDetectionStrategy, computed, inject, OnInit, signal } from '@angular/core';
import { form, required, min, FormField, submit } from '@angular/forms/signals';
import { Supaservice } from '../../services/supaservice';
import { BusquedaService } from '../../services/busqueda.service';
import { Planta } from '../planta';

@Component({
  selector: 'app-plantes-table',
  imports: [FormField],
  templateUrl: './plantes-table.html',
  styleUrl: './plantes-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlantesTable implements OnInit {
  /*
  Este formulario se hace con Signal-Forms como se indica en las especificaciones del github:
  Signal Form per a donar d'alta i editar plantes solars.
  */
  private supaservice: Supaservice = inject(Supaservice);
  private busquedaService: BusquedaService = inject(BusquedaService);
  cadenaBusqueda = this.busquedaService.obtenerCadenaBusqueda();

  plantes = signal<Planta[]>([]);
  filteredPlantes = computed(() => {
    const term = this.cadenaBusqueda().trim().toLowerCase();
    if (!term) {
      return this.plantes();
    }

    return this.plantes().filter((planta: any) => {
      const latitude = planta?.ubicacio?.latitude ?? planta?.ubicacio?.coordenadas?.lat ?? '';
      const longitude = planta?.ubicacio?.longitude ?? planta?.ubicacio?.coordenadas?.lon ?? '';
      const haystack = `${planta?.nom ?? ''} ${planta?.user ?? ''} ${planta?.capacitat ?? ''} ${latitude} ${longitude} ${planta?.id ?? ''}`.toLowerCase();
      return haystack.includes(term);
    });
  });
  esAdmin = signal(false);
  mostrarFormulario = signal(false);
  editando = signal(false);
  idEditando = signal<number | null>(null);
  enviando = signal(false);
  mensajeError = signal('');
  mensajeExito = signal('');

  modeloPlanta = signal({
    nom: '',
    capacitat: 0,
    latitude: 0,
    longitude: 0,
  });

  formularioPlanta = form(this.modeloPlanta, (esquema) => {
    required(esquema.nom, { message: 'El nombre es obligatorio' });
    required(esquema.capacitat, { message: 'La capacidad es obligatoria' });
    min(esquema.capacitat, 0, { message: 'La capacidad mínima es 0' });
    required(esquema.latitude, { message: 'La latitud es obligatoria' });
    required(esquema.longitude, { message: 'La longitud es obligatoria' });
  });

  archivoImagen = signal<File | null>(null);
  previstaImagen = signal('');

  async ngOnInit(): Promise<void> {
    await this.cargarRolYPlantas();
  }

  private async cargarRolYPlantas() {
    this.mensajeError.set('');
    try {
      const user = await this.supaservice.getCurrentUser();
      if (!user) {
        this.plantes.set([]);
        this.esAdmin.set(false);
        return;
      }

      const profile = await this.supaservice.getProfilePlacas(user.id);
      this.esAdmin.set(profile?.role === 'admin');

      const data = await this.supaservice.getPlantesByCurrentRole();
      this.plantes.set((data ?? []) as Planta[]);
    } catch (error: any) {
      this.mensajeError.set(error?.message ?? 'No se pudieron cargar las plantas');
      this.plantes.set([]);
    }
  }

  abrirFormCrear() {
    if (!this.esAdmin()) {
      return;
    }
    this.mostrarFormulario.set(true);
    this.editando.set(false);
    this.idEditando.set(null);
    this.modeloPlanta.set({ nom: '', capacitat: 0, latitude: 0, longitude: 0 });
    this.formularioPlanta().reset();
    this.archivoImagen.set(null);
    this.previstaImagen.set('');
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }

  abrirFormEditar(planta: Planta) {
    if (!this.esAdmin()) {
      return;
    }

    const ubicacio: any = planta.ubicacio as any;
    const latitude = Number(ubicacio?.latitude ?? ubicacio?.coordenadas?.lat ?? 0);
    const longitude = Number(ubicacio?.longitude ?? ubicacio?.coordenadas?.lon ?? 0);

    this.mostrarFormulario.set(true);
    this.editando.set(true);
    this.idEditando.set(planta.id);
    this.modeloPlanta.set({
      nom: planta.nom ?? '',
      capacitat: Number(planta.capacitat ?? 0),
      latitude,
      longitude,
    });
    this.formularioPlanta().reset();
    this.archivoImagen.set(null);
    this.previstaImagen.set((planta.foto as string) ?? '');
    this.mensajeError.set('');
    this.mensajeExito.set('');
  }

  cancelarFormulario(clearMessages = true) {
    this.mostrarFormulario.set(false);
    this.editando.set(false);
    this.idEditando.set(null);
    if (clearMessages) {
      this.mensajeError.set('');
      this.mensajeExito.set('');
    }
  }

  async enviarFormulario() {
    if (!this.esAdmin()) {
      return;
    }

    if (this.formularioPlanta().invalid()) {
      this.mensajeError.set('Completa todos los campos obligatorios con valores válidos');
      this.mensajeExito.set('');
      return;
    }

    const modelo = this.modeloPlanta();
    const user = await this.supaservice.getCurrentUser();

    if (!user) {
      this.mensajeError.set('No hay sesion activa');
      this.mensajeExito.set('');
      return;
    }

    this.enviando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    try {
      let fotoFinal = this.previstaImagen().trim() || null;
      if (this.archivoImagen()) {
        const upload = await this.supaservice.uploadPlantaImage(this.archivoImagen()!, user.id);
        fotoFinal = upload.publicUrl;
      }

      if (this.editando() && this.idEditando() != null) {
        await this.supaservice.updatePlanta(this.idEditando()!, {
          nom: modelo.nom,
          capacitat: modelo.capacitat,
          latitude: modelo.latitude,
          longitude: modelo.longitude,
          foto: fotoFinal,
        });
        this.mensajeExito.set('Planta actualizada correctamente');
      } else {
        await this.supaservice.createPlanta({
          nom: modelo.nom,
          capacitat: modelo.capacitat,
          latitude: modelo.latitude,
          longitude: modelo.longitude,
          foto: fotoFinal,
        });
        this.mensajeExito.set('Planta creada correctamente');
      }

      const data = await this.supaservice.getPlantesByCurrentRole();
      this.plantes.set((data ?? []) as Planta[]);
      this.cancelarFormulario(false);
    } catch (error: any) {
      this.mensajeError.set(error?.message ?? 'No se pudo guardar la planta');
    } finally {
      this.enviando.set(false);
    }
  }

  async alSeleccionarImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.mensajeError.set('');

    if (!file) {
      this.archivoImagen.set(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.mensajeError.set('El archivo debe ser una imagen válida');
      this.archivoImagen.set(null);
      return;
    }

    this.archivoImagen.set(file);
    try {
      const preview = await this.supaservice.readFileAsUrl(file);
      this.previstaImagen.set(preview);
    } catch {
      this.mensajeError.set('No se pudo previsualizar la imagen');
    }
  }

  usarUbicacionActual() {
    if (!this.esAdmin()) {
      return;
    }

    if (!navigator.geolocation) {
      this.mensajeError.set('Tu navegador no soporta geolocalización');
      this.mensajeExito.set('');
      return;
    }

    this.mensajeError.set('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const modelo = this.modeloPlanta();
        this.modeloPlanta.set({
          ...modelo,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        this.mensajeExito.set('Ubicación actual cargada');
      },
      () => {
        this.mensajeError.set('No se pudo obtener la ubicación actual');
        this.mensajeExito.set('');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  async borrarPlanta(planta: Planta) {
    if (!this.esAdmin()) {
      return;
    }

    const confirmed = window.confirm(`¿Seguro que quieres borrar la planta "${planta.nom}"?`);
    if (!confirmed) {
      return;
    }

    this.mensajeError.set('');
    this.mensajeExito.set('');
    try {
      await this.supaservice.deletePlanta(planta.id);
      this.mensajeExito.set('Planta borrada correctamente');
      const data = await this.supaservice.getPlantesByCurrentRole();
      this.plantes.set((data ?? []) as Planta[]);
    } catch (error: any) {
      this.mensajeError.set(error?.message ?? 'No se pudo borrar la planta');
    }
  }

  obtenerTextoCoordenadas(planta: Planta): string {
    const ubicacio: any = planta.ubicacio as any;
    const lat = ubicacio?.latitude ?? ubicacio?.coordenadas?.lat ?? '-';
    const lon = ubicacio?.longitude ?? ubicacio?.coordenadas?.lon ?? '-';
    return `${lat}, ${lon}`;
  }

}
