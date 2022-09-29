import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import { LOGO } from '../shared/consts/images.const';
import { ITag } from '../shared/models/image.model';
import { ISection } from '../shared/models/sections.model';
import { ApiService } from '../shared/services/api.service';
import { TagsService } from '../shared/services/tags.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  LOGO = LOGO;

  sections: ISection[] = [];
  tags: ITag[] = [];

  selectedTags: ITag[] = [];

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router,
    private readonly tagService: TagsService,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.apiService.getListOfSections().subscribe((sections) => {
      this.sections = sections;
      this.cdr.markForCheck();
    });
    this.tags = this.tagService.tags;
    this.selectedTags = this.tagService.filter;
    this.tagService.$tags.subscribe((tags) => {
      this.tags = tags;
      this.cdr.markForCheck();
    });
  }

  ngOnInit() {}

  tagInFilter(tagId: number) {
    return this.selectedTags.some((tag) => tag.tagId === tagId);
  }
  tagInFilterToggle(tag: ITag, selected: boolean) {
    if (selected) {
      this.tagService.addTagToFilter(tag);
    } else {
      this.tagService.deleteTagFromFilter(tag.tagId);
    }
  }

  openSection(sectionId: number) {
    this.router.navigate(['pages', 'main', 'sections', sectionId]);
  }
  openAllImagesSection() {
    this.router.navigate(['pages', 'main']);
  }
}
