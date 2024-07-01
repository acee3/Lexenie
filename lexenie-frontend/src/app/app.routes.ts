import { Routes } from '@angular/router';
import { LandingPageComponent } from './features/landing-page/landing-page.component';
import { AuthCardComponent } from './features/landing-page/auth-card/auth-card.component';
import { LandingCardComponent } from './features/landing-page/landing-card/landing-card.component';
import { ChatPageComponent } from './features/chat-page/chat-page.component';
import { LoginComponent } from './features/landing-page/auth-card/login/login.component';
import { SignupComponent } from './features/landing-page/auth-card/signup/signup.component';

export const routes: Routes = [
  {
    path: '',
    title: 'Lexenie',
    component: LandingPageComponent,
    children: [
      {
        path: '',
        title: 'Lexenie',
        component: LandingCardComponent
      },
      {
        path: 'auth',
        title: 'Lexenie: Authenticate',
        component: AuthCardComponent,
        children: [
          {
            path:'',
            redirectTo: 'login',
            pathMatch: 'full' 
          },
          {
            path: 'login',
            title: 'Lexenie: Login',
            component: LoginComponent
          },
          {
            path: 'signup',
            title: 'Lexenie: Register',
            component: SignupComponent
          }
        ]
      },
    ]
  },
  {
    path: 'chat',
    title: 'Lexenie: Chat',
    component: ChatPageComponent
  }
];
