import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthorizationService } from '../services/authorization.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  token: string = '';
  constructor(private readonly authService: AuthorizationService) {
    this.token = this.authService.token ?? '';
    this.authService.$token.subscribe((token) => {
      this.token = token ?? '';
    });
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const authReq = req.clone({
      body:
        req.body instanceof FormData
          ? req.body
          : {
              token: this.token ?? '',
              ...req.body,
            },
    });
    console.log(authReq, req);
    return next.handle(authReq);
  }
}
