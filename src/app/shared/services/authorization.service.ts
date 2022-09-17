import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { CookieService } from 'ngx-cookie';
import { map, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  token: string;
  $token: Subject<string> = new Subject<string>();
  authorized: boolean = false;

  constructor(
    private readonly apiService: ApiService,
    private readonly cookieService: CookieService
  ) {
    this.$token.subscribe((token) => {
      this.token = token;
      this.cookieService.put('token', token);
    });

    this.token = this.cookieService.get('token') ?? '';
    if (this.token !== '') {
      this.apiService.checkToken(this.token).subscribe((token_correct) => {
        if (!token_correct) this.token = '';
        this.$token.next(this.token);
        this.authorized = token_correct;
      });
    }
  }

  authorization(password: string) {
    return this.apiService.authorization(password).pipe(
      map((token) => {
        if (token) {
          this.token = token as string;
          this.$token.next(token as string);
          this.authorized = true;
        } else this.authorized = false;
      })
    );
  }
}
