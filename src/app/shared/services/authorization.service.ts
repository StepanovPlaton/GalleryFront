import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CookieService } from 'ngx-cookie';
import { map, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  token: string | null;
  $token: Subject<string | null> = new Subject<string | null>();
  authorized: boolean = false;

  constructor(
    private readonly apiService: ApiService,
    private readonly cookieService: CookieService
  ) {
    this.$token.subscribe((token) => {
      this.token = token;
      if (token) this.cookieService.put('token', token);
    });

    this.token = this.cookieService.get('token') ?? '';
    if (this.token !== '') {
      this.apiService.checkToken(this.token).subscribe((token_correct) => {
        console.log('token', token_correct);
        if (!token_correct) this.token = '';
        this.authorized = token_correct;
        this.$token.next(this.token);
      });
    }
  }

  authorization(password: string) {
    return this.apiService.authorization(password).pipe(
      map((token) => {
        if (token) {
          this.token = token as string;
          this.authorized = true;
          this.$token.next(token as string);
        } else this.authorized = false;
      })
    );
  }
  logout() {
    this.cookieService.remove('token');
    this.authorized = false;
    this.$token.next(null);
  }
}
