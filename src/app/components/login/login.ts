import { JsonPipe, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { Supaservice } from '../../services/supaservice';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NgClass, JsonPipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  formulario: FormGroup;
  formBuilder: FormBuilder = inject(FormBuilder);
  supaservice: Supaservice = inject(Supaservice);
  constructor(){
    this.formulario = this.formBuilder.group({
      email: ['', [Validators.email, Validators.required]],
      password: ['',[Validators.required, Validators.minLength(8)]],
    })
  }

  login(){
    const loginData = this.formulario.value;
    this.supaservice.login(loginData);
  }

  get emailNotValid(){
    return this.formulario.get('email')!.invalid &&
            this.formulario.get('email')!.touched;
  }

  get emailValid(){
    return this.formulario.get('email')!.valid &&
            this.formulario.get('email')!.touched;
  }
}
