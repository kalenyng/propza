import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';     // ⬅️ add this
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],             // ⬅️ add CommonModule here
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']             // ⬅️ also note the plural: styleUrls
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMsg = '';

  constructor(private auth: AuthService, private router: Router) {}

  async submit(): Promise<void> {
    this.loading = true;
    this.errorMsg = '';
    const err = await this.auth.signInWithPassword(this.email, this.password);
    this.loading = false;

    if (err) {
      this.errorMsg = err.message;
    } else {
      this.router.navigateByUrl('/');
    }
  }
}
