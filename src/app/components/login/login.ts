import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Supaservice } from '../../services/supaservice';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  formulario: FormGroup;
  formBuilder: FormBuilder = inject(FormBuilder);
  supaservice: Supaservice = inject(Supaservice);
  router: Router = inject(Router);
  errorMessage = '';
  isSubmitting = false;
  constructor(){
    this.formulario = this.formBuilder.group({
      email: ['', [Validators.email, Validators.required]],
      password: ['',[Validators.required, Validators.minLength(8)]],
    })
  }

  async login() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.errorMessage = 'Formulario no valido';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    const loginData = this.formulario.value as { email: string; password: string };

    try {
      await this.supaservice.login(loginData);
      await this.router.navigate(['/plantes']);
    } catch (error: any) {
      this.errorMessage = this.getLoginErrorMessage(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private getLoginErrorMessage(error: any): string {
    const rawMessage = (error?.message ?? '').toString().toLowerCase();

    if (rawMessage.includes('invalid login credentials')) {
      return 'Email o password incorrectos';
    }

    if (rawMessage.includes('email not confirmed')) {
      return 'Debes confirmar el email antes de iniciar sesion';
    }

    if (rawMessage.includes('too many requests')) {
      return 'Demasiados intentos. Espera un momento y prueba otra vez';
    }

    return error?.message ?? 'No se pudo iniciar sesion';
  }

  get emailNotValid(){
    return this.formulario.get('email')!.invalid &&
            this.formulario.get('email')!.touched;
  }

  get emailValid(){
    return this.formulario.get('email')!.valid &&
            this.formulario.get('email')!.touched;
  }

  get passwordNotValid() {
    return this.formulario.get('password')!.invalid &&
            this.formulario.get('password')!.touched;
  }
}
