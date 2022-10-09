import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { EDIT, LOGO } from '../shared/consts/images.const';
import { ISection, ITag } from '../shared/models/image.model';
import { ApiService } from '../shared/services/api.service';
import { AuthorizationService } from '../shared/services/authorization.service';
import { SectionsService } from '../shared/services/sections.service';
import { TagsService } from '../shared/services/tags.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  LOGO = LOGO;
  EDIT = EDIT;

  sections: (ISection & { edit?: boolean })[] = [];
  tags: ITag[] = [];

  selectedTags: ITag[] = [];

  authorized: boolean = false;

  editableSection: ISection | null = null;

  @ViewChild('editSectionNameInput') editSectionNameInput: ElementRef | null =
    null;

  constructor(
    private readonly router: Router,
    private readonly tagsService: TagsService,
    private readonly cdr: ChangeDetectorRef,
    private readonly authService: AuthorizationService,
    private readonly sectionsService: SectionsService
  ) {
    this.sectionsService.getSections().subscribe((sections) => {
      this.sections = sections;
      this.cdr.markForCheck();
    });
    this.tags = this.tagsService.tags;
    this.selectedTags = this.tagsService.filter;
    this.tagsService.$tags.subscribe((tags) => {
      this.tags = tags;
      this.cdr.markForCheck();
    });
    this.tagsService.$filter.subscribe(
      (filter) => (this.selectedTags = filter)
    );

    this.authorized = this.authService.authorized;
    this.authService.$token.subscribe(
      () => (this.authorized = this.authService.authorized)
    );
  }

  ngOnInit() {}

  tagInFilter(tagId: number) {
    return this.selectedTags.some((tag) => tag.tagId === tagId);
  }
  tagInFilterToggle(tag: ITag, selected: boolean) {
    if (selected) {
      this.tagsService.addTagToFilter(tag);
    } else {
      this.tagsService.deleteTagFromFilter(tag.tagId);
    }
  }

  focusOnSection(section: ISection) {
    this.sections.forEach((_section) => {
      if (_section.sectionId === section.sectionId) {
        _section.edit = true;
      }
    });
    this.editableSection = section;
  }
  resetEditSection(save: boolean = true) {
    if (save && this.editSectionNameInput && this.editableSection)
      this.changeSectionName(
        this.editableSection.sectionId,
        this.editSectionNameInput.nativeElement.value
      );
    setTimeout(() => {
      this.editableSection = null;
      this.sections.forEach((section) => {
        if (section.edit) section.edit = false;
      });
      this.cdr.markForCheck();
    }, 100);
  }
  changeSectionName(sectionId: number, newSectionName: string) {
    this.sectionsService
      .changeSectionName(sectionId, newSectionName)
      .subscribe();
  }

  openSection(sectionId: number) {
    this.tagsService.clearFilter();
    this.router.navigate(['pages', 'main', 'sections', sectionId]);
  }
  openAllImagesSection() {
    this.router.navigate(['pages', 'main']);
  }
}
