import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IImage, ITagWithoutBgColor } from '../models/image.model';
import { ISection } from '../models/sections.model';
import { catchError, of, switchMap } from 'rxjs';
import { TagsColorService } from '../utils/tags-colors.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly tagsColorService: TagsColorService
  ) {}

  getAllImages() {
    return this.http.get<IImage[]>(`/api/images`);
  }
  getSectionImages(sectionId: number) {
    return this.http.get<IImage[]>(`/api/sections/${sectionId}`);
  }

  getImageFile(image: string) {
    return this.http.get(`/api/static/images/full_size/${image}`, {
      responseType: 'blob',
    });
  }
  getPreviewImageFile(image: string) {
    return this.http.get(`/api/static/images/previews/${image}`, {
      responseType: 'blob',
    });
  }

  getAllTags() {
    return this.http.get<ITagWithoutBgColor[]>(`/api/tags`).pipe(
      switchMap((tags) => {
        console.log(tags);
        return of(tags.map(this.tagsColorService.addColorToTag));
      })
    );
  }
  addTagToImage(imageId: number, tagId: number, token: string) {
    return this.http.post(`/api/images/${imageId}/tags/${tagId}`, {
      token: token,
    });
  }
  deleteTagFromImage(imageId: number, tagId: number, token: string) {
    return this.http.delete(`/api/images/${imageId}/tags/${tagId}`, {
      body: { token: token },
    });
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
