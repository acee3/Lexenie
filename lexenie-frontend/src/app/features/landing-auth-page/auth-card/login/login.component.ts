import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CoolButtonComponent } from '../../../../shared/components/cool-button/cool-button.component';

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
  constructor(private route: ActivatedRoute, private router: Router) { }

  onSubmit() {
    this.router.navigate(['/chat']);
  }

  login = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });
}
