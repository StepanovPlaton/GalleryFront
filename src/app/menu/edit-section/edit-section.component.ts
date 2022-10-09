import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ISection, ITag } from 'src/app/shared/models/image.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { AuthorizationService } from 'src/app/shared/services/authorization.service';
import { SectionsService } from 'src/app/shared/services/sections.service';

@Component({
  selector: 'app-edit-section',
  templateUrl: './edit-section.component.html',
  styleUrls: ['./edit-section.component.scss'],
})
export class EditSectionComponent implements OnInit {
  @Input()
  set section(v: ISection | null) {
    if (v) {
      this.focus = true;
    } else {
      setTimeout(() => {
        this.focus = false;
      }, 500);
    }
    this._section = v;
  }
  get section(): ISection | null {
    return this._section;
  }
  _section: ISection | null = null;
  focus: boolean = false;

  @Output()
  closeEdit = new EventEmitter<void>();

  constructor(
    private readonly apiService: ApiService,
    private readonly sectionsService: SectionsService
  ) {}

  ngOnInit() {}

  getTagSelectedForSection(tag: ITag) {
    console.log(this.section);
    if (this.section) {
      console.log(
        this.section,
        tag.tagId,
        this.section.tags.some((_tag) => _tag.tagId === tag.tagId)
      );
      return this.section.tags.some((_tag) => _tag.tagId === tag.tagId);
    }
    return false;
  }

  toggleTag(tag: ITag) {
    if (this.section) {
      (this.getTagSelectedForSection(tag)
        ? this.apiService.deleteTagFromSection
        : this.apiService.addTagToSection
      )
        .bind(this.apiService)(this.section.sectionId, tag.tagId)
        .subscribe(() => {
          if (this.section)
            this.sectionsService.toggleTagOnSection(tag, this.section);
        });
    }
  }

  close() {
    this.closeEdit.next();
  }
}
