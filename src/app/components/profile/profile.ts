import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Supaservice } from '../../services/supaservice';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile implements OnInit {
  /*
  Este formulario se hace con Reactive-Forms como se indica en las especificaciones del github:
  *Formulari reactiu per al registre, login i perfil d'usuari*
  */
  private supaservice: Supaservice = inject(Supaservice);
  private formBuilder: FormBuilder = inject(FormBuilder);
  formulario: FormGroup;
  idUsuario: string | null = null;
  mensajeError = signal('');
  mensajeExito = signal('');
  cargando = signal(false);
  enviando = signal(false);
  rolUsuario = signal<string | null>(null);
  avatarsDisponibles = [
    '/avatars/avatar-1.png',
    '/avatars/avatar-2.png',
    '/avatars/avatar-3.png',
    '/avatars/avatar-4.png',
    '/avatars/avatar-5.png',
    '/avatars/avatar-6.png',
  ];

  constructor() {
    this.formulario = this.formBuilder.group({
      username: ['', [Validators.minLength(3)]],
      full_name: [''],
      avatar_url: [''],
      website: [''],
    });
  }

  async ngOnInit() {
    this.cargando.set(true);
    this.mensajeError.set('');
    try {
      const user = await this.supaservice.getCurrentUser();
      if (!user) {
        this.mensajeError.set('No hay sesion activa');
        return;
      }

      this.idUsuario = user.id;
      const profile = await this.supaservice.getProfilePlacas(user.id);
      if (profile) {
        this.formulario.patchValue({
          username: profile.username ?? '',
          full_name: profile.full_name ?? '',
          avatar_url: profile.avatar_url ?? '',
          website: profile.website ?? '',
        });
        this.rolUsuario.set(profile.role ?? 'cliente');
      }
    } catch (error: any) {
      this.mensajeError.set(error?.message ?? 'Error al cargar el perfil');
    } finally {
      this.cargando.set(false);
    }
  }

  async guardarPerfil() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mensajeError.set('Formulario no valido');
      this.mensajeExito.set('');
      return;
    }

    if (!this.idUsuario) {
      this.mensajeError.set('No hay sesion activa');
      this.mensajeExito.set('');
      return;
    }

    this.enviando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');
    const { username, full_name, avatar_url, website } = this.formulario.value as {
      username?: string;
      full_name?: string;
      avatar_url?: string;
      website?: string;
    };

    try {
      await this.supaservice.upsertProfilePlacas({
        id: this.idUsuario,
        username: username?.trim() || null,
        full_name: full_name?.trim() || null,
        avatar_url: avatar_url?.trim() || null,
        website: website?.trim() || null,
      });
      this.mensajeExito.set('Perfil actualizado correctamente');
    } catch (error: any) {
      this.mensajeError.set(error?.message ?? 'No se pudo guardar el perfil');
    } finally {
      this.enviando.set(false);
    }
  }

  seleccionarAvatar(avatarPath: string) {
    this.formulario.patchValue({ avatar_url: avatarPath });
  }

  avatarSeleccionado(avatarPath: string): boolean {
    return this.formulario.get('avatar_url')?.value === avatarPath;
  }

  get usernameNoValido() {
    return this.formulario.get('username')!.invalid &&
            this.formulario.get('username')!.touched;
  }
}
