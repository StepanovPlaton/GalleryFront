import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IImage } from '../models/image.model';
import { ISection } from '../models/sections.model';

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
}
