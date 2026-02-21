import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Supaservice } from '../../services/supaservice';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  formBuilder: FormBuilder = inject(FormBuilder);
  supaservice: Supaservice = inject(Supaservice);
  router: Router = inject(Router);
  formulario: FormGroup;
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  constructor(){
    this.formulario = this.formBuilder.group(
      {
        email: ['', [Validators.email, Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        password2: ['', [Validators.required, Validators.minLength(8)]]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const password2 = control.get('password2');
    if (password && password2 && password.value !== password2.value) {
      return { passwordValidator: true };
    }
    return null;
  }

  async register() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.errorMessage = 'Formulario no valido';
      this.successMessage = '';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';
    const { email, password } = this.formulario.value as { email: string; password: string };

    try {
      await this.supaservice.register({ email, password });
      this.successMessage = 'Registro completado correctamente. Ya puedes iniciar sesion';
      this.formulario.reset();
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1200);
    } catch (error: any) {
      this.errorMessage = this.getRegisterErrorMessage(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private getRegisterErrorMessage(error: any): string {
    const rawMessage = (error?.message ?? '').toString().toLowerCase();

    if (rawMessage.includes('user already registered')) {
      return 'Este email ya esta registrado';
    }

    if (rawMessage.includes('password')) {
      return 'La password no cumple los requisitos';
    }

    if (rawMessage.includes('email')) {
      return 'Email no valido';
    }

    return error?.message ?? 'No se pudo completar el registro';
  }

  get emailNotValid() {
    return this.formulario.controls['email'].invalid && this.formulario.controls['email'].touched;
  }

  get emailValid() {
    return this.formulario.controls['email'].valid && this.formulario.controls['email'].touched;
  }

  passwortdNotValid(name: string){
    return (
      (this.formulario.controls[name].invalid || this.formulario.hasError('passwordValidator')) &&
      this.formulario.controls[name].touched
    );
  }

  passwordValid(name: string){
    return (
      (this.formulario.get(name)!.valid && !this.formulario.hasError('passwordValidator')) &&
      this.formulario.get(name)!.touched
    );
  }

  get passwordCrossValidation() {
    return (
      this.formulario.hasError('passwordValidator') &&
      this.formulario.get('password')?.touched &&
      this.formulario.get('password2')?.touched
    );
  }
}
