import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Supaservice } from '../../services/supaservice';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  formBuilder: FormBuilder = inject(FormBuilder);
  supaservice: Supaservice = inject(Supaservice);
  formulario: FormGroup;
  errorMessage = signal('');

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

  register(){
    if (this.formulario.valid){
      this.errorMessage.set('');
      const { email, password } = this.formulario.value;
      this.supaservice.register({ email, password });
    } else {
      this.errorMessage.set('Formulario no valido');
    }
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
