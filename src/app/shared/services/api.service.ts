import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { IImage, ISection, ITagWithoutBgColor } from '../models/image.model';
import { catchError, of, switchMap } from 'rxjs';
import { TagsColorService } from '../utils/tags-colors.service';
import { AuthorizationService } from './authorization.service';

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
  getImage(imageId: number) {
    return this.http.get<IImage>(`/api/images/${imageId}`);
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
  addImage(image: File) {
    let data = new FormData();
    data.append('upload_image', image);
    const req = new HttpRequest('POST', `/api/images`, data, {
      reportProgress: true,
    });
    return this.http.request<{ imageId: number }>(req);
  }

  getAllTags() {
    return this.http.get<ITagWithoutBgColor[]>(`/api/tags`).pipe(
      switchMap((tags) => {
        return of(tags.map(this.tagsColorService.addColorToTag));
      })
    );
  }
  addTagToImage(imageId: number, tagId: number) {
    return this.http.post(`/api/images/${imageId}/tags/${tagId}`, {});
  }
  deleteTagFromImage(imageId: number, tagId: number) {
    return this.http.delete(`/api/images/${imageId}/tags/${tagId}`, {});
  }
  changeTagName(tagId: number, newTagName: string) {
    return this.http.put(`/api/tags/${tagId}?edited_name=${newTagName}`, {});
  }
  createTag(tagName: string) {
    return this.http.post<{ tagId: number }>(
      `/api/tags?tag_name=${tagName}`,
      {}
    );
  }
  deleteTag(tagId: number) {
    return this.http.delete(`/api/tags/${tagId}`, {});
  }

  getListOfSections() {
    return this.http.get<ISection[]>(`/api/sections`);
  }
  addTagToSection(sectionId: number, tagId: number) {
    return this.http.post(`/api/sections/${sectionId}/tags/${tagId}`, {});
  }
  deleteTagFromSection(imageId: number, tagId: number) {
    return this.http.delete(`/api/sections/${imageId}/tags/${tagId}`, {});
  }
  changeSectionName(sectionId: number, section: string) {
    return this.http.put(`/api/sections/${sectionId}?section=${section}`, {});
  }

  checkToken(token?: string) {
    // the token can be added to the interceptor
    return this.http
      .post(`/api/admin/token`, token ? { token: token } : {})
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
