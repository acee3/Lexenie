import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CoolButtonComponent } from '../../../../shared/components/cool-button/cool-button.component';

@Component({
  selector: 'signup',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ReactiveFormsModule, CoolButtonComponent],
  templateUrl: './signup.component.html',
  host: {
    class: "h-full min-h-fit w-full min-w-fit flex flex-col justify-start items-center"
  }
})
export class SignupComponent {
  signup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });
}
