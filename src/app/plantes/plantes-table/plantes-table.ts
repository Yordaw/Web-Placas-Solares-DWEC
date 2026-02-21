import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Supaservice } from '../../services/supaservice';
import { Planta } from '../planta';

@Component({
  selector: 'app-plantes-table',
  imports: [],
  templateUrl: './plantes-table.html',
  styleUrl: './plantes-table.css',
})
export class PlantesTable implements OnInit {
  private supaservice: Supaservice = inject(Supaservice);
  searchString = this.supaservice.getSearchString();

  plantes = signal<Planta[]>([]);
  filteredPlantes = computed(() => {
    const term = this.searchString().trim().toLowerCase();
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
  isAdmin = signal(false);

  showForm = signal(false);
  isEditing = signal(false);
  editingId = signal<number | null>(null);

  isSubmitting = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  formNom = signal('');
  formCapacitat = signal('');
  formLatitude = signal('');
  formLongitude = signal('');
  imageFile = signal<File | null>(null);
  imagePreview = signal('');

  async ngOnInit(): Promise<void> {
    await this.loadRoleAndPlantes();
  }

  private async loadRoleAndPlantes() {
    this.errorMessage.set('');
    try {
      const user = await this.supaservice.getCurrentUser();
      if (!user) {
        this.plantes.set([]);
        this.isAdmin.set(false);
        return;
      }

      const profile = await this.supaservice.getProfilePlacas(user.id);
      this.isAdmin.set(profile?.role === 'admin');

      const data = await this.supaservice.getPlantesByCurrentRole();
      this.plantes.set((data ?? []) as Planta[]);
    } catch (error: any) {
      this.errorMessage.set(error?.message ?? 'No se pudieron cargar las plantas');
      this.plantes.set([]);
    }
  }

  openCreateForm() {
    if (!this.isAdmin()) {
      return;
    }
    this.showForm.set(true);
    this.isEditing.set(false);
    this.editingId.set(null);
    this.formNom.set('');
    this.formCapacitat.set('');
    this.formLatitude.set('');
    this.formLongitude.set('');
    this.imageFile.set(null);
    this.imagePreview.set('');
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  openEditForm(planta: Planta) {
    if (!this.isAdmin()) {
      return;
    }

    const ubicacio: any = planta.ubicacio as any;
    const latitude = ubicacio?.latitude ?? ubicacio?.coordenadas?.lat ?? '';
    const longitude = ubicacio?.longitude ?? ubicacio?.coordenadas?.lon ?? '';

    this.showForm.set(true);
    this.isEditing.set(true);
    this.editingId.set(planta.id);
    this.formNom.set(planta.nom ?? '');
    this.formCapacitat.set(String(planta.capacitat ?? ''));
    this.formLatitude.set(String(latitude));
    this.formLongitude.set(String(longitude));
    this.imageFile.set(null);
    this.imagePreview.set((planta.foto as string) ?? '');
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  cancelForm(clearMessages = true) {
    this.showForm.set(false);
    this.isEditing.set(false);
    this.editingId.set(null);
    if (clearMessages) {
      this.errorMessage.set('');
      this.successMessage.set('');
    }
  }

  async submitForm() {
    if (!this.isAdmin()) {
      return;
    }

    const nom = this.formNom().trim();
    const capacitat = Number(this.formCapacitat());
    const latitude = Number(this.formLatitude());
    const longitude = Number(this.formLongitude());
    const user = await this.supaservice.getCurrentUser();

    if (!user) {
      this.errorMessage.set('No hay sesion activa');
      this.successMessage.set('');
      return;
    }

    if (!nom || Number.isNaN(capacitat) || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      this.errorMessage.set('Completa todos los campos obligatorios con valores válidos');
      this.successMessage.set('');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      let fotoFinal = this.imagePreview().trim() || null;
      if (this.imageFile()) {
        const upload = await this.supaservice.uploadPlantaImage(this.imageFile()!, user.id);
        fotoFinal = upload.publicUrl;
      }

      if (this.isEditing() && this.editingId() != null) {
        await this.supaservice.updatePlanta(this.editingId()!, {
          nom,
          capacitat,
          latitude,
          longitude,
          foto: fotoFinal,
        });
        this.successMessage.set('Planta actualizada correctamente');
      } else {
        await this.supaservice.createPlanta({
          nom,
          capacitat,
          latitude,
          longitude,
          foto: fotoFinal,
        });
        this.successMessage.set('Planta creada correctamente');
      }

      const data = await this.supaservice.getPlantesByCurrentRole();
      this.plantes.set((data ?? []) as Planta[]);
      this.cancelForm(false);
    } catch (error: any) {
      this.errorMessage.set(error?.message ?? 'No se pudo guardar la planta');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.errorMessage.set('');

    if (!file) {
      this.imageFile.set(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('El archivo debe ser una imagen válida');
      this.imageFile.set(null);
      return;
    }

    this.imageFile.set(file);
    try {
      const preview = await this.supaservice.readFileAsUrl(file);
      this.imagePreview.set(preview);
    } catch {
      this.errorMessage.set('No se pudo previsualizar la imagen');
    }
  }

  useCurrentLocation() {
    if (!this.isAdmin()) {
      return;
    }

    if (!navigator.geolocation) {
      this.errorMessage.set('Tu navegador no soporta geolocalización');
      this.successMessage.set('');
      return;
    }

    this.errorMessage.set('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.formLatitude.set(String(position.coords.latitude));
        this.formLongitude.set(String(position.coords.longitude));
        this.successMessage.set('Ubicación actual cargada');
      },
      () => {
        this.errorMessage.set('No se pudo obtener la ubicación actual');
        this.successMessage.set('');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

  async deletePlanta(planta: Planta) {
    if (!this.isAdmin()) {
      return;
    }

    const confirmed = window.confirm(`¿Seguro que quieres borrar la planta "${planta.nom}"?`);
    if (!confirmed) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    try {
      await this.supaservice.deletePlanta(planta.id);
      this.successMessage.set('Planta borrada correctamente');
      const data = await this.supaservice.getPlantesByCurrentRole();
      this.plantes.set((data ?? []) as Planta[]);
    } catch (error: any) {
      this.errorMessage.set(error?.message ?? 'No se pudo borrar la planta');
    }
  }

  getCoordText(planta: Planta): string {
    const ubicacio: any = planta.ubicacio as any;
    const lat = ubicacio?.latitude ?? ubicacio?.coordenadas?.lat ?? '-';
    const lon = ubicacio?.longitude ?? ubicacio?.coordenadas?.lon ?? '-';
    return `${lat}, ${lon}`;
  }

}
