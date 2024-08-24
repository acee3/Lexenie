import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CoolButtonComponent } from '../../../../shared/components/cool-button/cool-button.component';
import { AuthService } from '../../../../core/auth.service';
import { isServerError } from '../../../../core/socket.service.provider';

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
  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    if (this.signup.invalid) {
      alert('Invalid signup');
      return;
    }
    if (this.signup.value.username === null
      || this.signup.value.email === null 
      || this.signup.value.password === null
      || this.signup.value.username === undefined
      || this.signup.value.email === undefined
      || this.signup.value.password === undefined
    ) {
      alert('Invalid signup');
      return;
    }
    try {
      this.authService.createUser(this.signup.value.username, this.signup.value.password, this.signup.value.email)
      .subscribe({
        next: (result) => {
          alert('User created successfully ' + result);
          this.router.navigate(['/chat']);
        },
        error: (err) => {
          if (err.error && isServerError(err.error)) {
            switch (err.error.status) {
              case 400:
                throw new Error("Invalid username, password, or email.");
              case 409:
                throw new Error("Username or email already exists.");
              default:
                throw new Error("Unknown error with creating user.");
            }
          }
        }
      });
    } catch (error) {
      alert('Invalid signup');
      return;
    }
    
  }

  signup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    username: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });
}
