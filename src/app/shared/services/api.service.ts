import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IImage } from '../models/image.model';
import { ISection } from '../models/sections.model';
import { catchError, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  getAllImages() {
    return this.http.get<IImage[]>(`/api/images`);
  }
  getSectionImages(sectionId: number) {
    return this.http.get<IImage[]>(`/api/sections/${sectionId}`);
  }

  getListOfSections() {
    return this.http.get<ISection[]>(`/api/sections`);
  }

  checkToken(token: string) {
    return this.http
      .post(`/api/admin/token`, {
        token: token,
      })
      .pipe(
        catchError(() => of(false)),
        switchMap(() => of(true))
      );
  }
  authorization(password: string) {
    return this.http
      .post<{ token: string }>(`/api/admin/auth`, { password: password })
      .pipe(
        catchError(() => of({ token: false })),
        switchMap(({ token }) => {
          return of(token);
        })
      );
  }
}
