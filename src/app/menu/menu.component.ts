import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LOGO } from '../shared/consts/images.const';
import { ISection } from '../shared/models/sections.model';
import { ApiService } from '../shared/services/api.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  LOGO = LOGO;

  sections: ISection[] = [];

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router
  ) {
    this.apiService
      .getListOfSections()
      .subscribe((sections) => (this.sections = sections));
  }

  ngOnInit() {}

  openSection(sectionId: number) {
    console.log(['pages', 'main', 'sections', sectionId]);
    this.router.navigate(['pages', 'main', 'sections', sectionId]);
  }
}
