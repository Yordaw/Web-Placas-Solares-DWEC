import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Supaservice } from '../../services/supaservice';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private supaservice: Supaservice = inject(Supaservice);
  private formBuilder: FormBuilder = inject(FormBuilder);
  formulario: FormGroup;
  userId: string | null = null;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  isSubmitting = false;
  availableAvatars = [
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
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const user = await this.supaservice.getCurrentUser();
      if (!user) {
        this.errorMessage = 'No hay sesion activa';
        return;
      }

      this.userId = user.id;
      const profile = await this.supaservice.getProfilePlacas(user.id);
      if (profile) {
        this.formulario.patchValue({
          username: profile.username ?? '',
          full_name: profile.full_name ?? '',
          avatar_url: profile.avatar_url ?? '',
          website: profile.website ?? '',
        });
      }
    } catch (error: any) {
      this.errorMessage = error?.message ?? 'Error al cargar el perfil';
    } finally {
      this.isLoading = false;
    }
  }

  async saveProfile() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.errorMessage = 'Formulario no valido';
      this.successMessage = '';
      return;
    }

    if (!this.userId) {
      this.errorMessage = 'No hay sesion activa';
      this.successMessage = '';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    const { username, full_name, avatar_url, website } = this.formulario.value as {
      username?: string;
      full_name?: string;
      avatar_url?: string;
      website?: string;
    };

    try {
      await this.supaservice.upsertProfilePlacas({
        id: this.userId,
        username: username?.trim() || null,
        full_name: full_name?.trim() || null,
        avatar_url: avatar_url?.trim() || null,
        website: website?.trim() || null,
      });
      this.successMessage = 'Perfil actualizado correctamente';
    } catch (error: any) {
      this.errorMessage = error?.message ?? 'No se pudo guardar el perfil';
    } finally {
      this.isSubmitting = false;
    }
  }

  selectAvatar(avatarPath: string) {
    this.formulario.patchValue({ avatar_url: avatarPath });
  }

  isAvatarSelected(avatarPath: string): boolean {
    return this.formulario.get('avatar_url')?.value === avatarPath;
  }

  get usernameNotValid() {
    return this.formulario.get('username')!.invalid &&
            this.formulario.get('username')!.touched;
  }
}
