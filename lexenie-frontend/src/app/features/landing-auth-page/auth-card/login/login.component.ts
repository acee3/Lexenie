import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CoolButtonComponent } from '../../../../shared/components/cool-button/cool-button.component';
import { AuthService } from '../../../../core/auth.service';

@Component({
  selector: 'login',
  standalone: true,
  imports: [RouterOutlet, RouterLink, ReactiveFormsModule, CoolButtonComponent],
  templateUrl: './login.component.html',
  host: {
    class: "h-full min-h-fit w-full min-w-fit flex flex-col justify-start items-center"
  }
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    if (this.login.invalid) {
      alert('Invalid login');
      return;
    }
    if (this.login.value.email === null 
      || this.login.value.password === null
      || this.login.value.email === undefined
      || this.login.value.password === undefined
    ) {
      alert('Invalid login');
      return;
    }
    try {
      this.authService.login(this.login.value.email, this.login.value.password)
      .subscribe({
        next: (result) => {
          this.router.navigate(['/chat']);
        },
        error: (err) => {
          alert('Error creating user ' + err);
          throw new Error('Error creating user');
        }
      });
    } catch (error) {
      alert('Invalid login');
      return;
    }
  }

  login = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });
}
