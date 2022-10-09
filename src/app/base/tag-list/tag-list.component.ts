import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ADD } from 'src/app/shared/consts/images.const';
import { ITag } from 'src/app/shared/models/image.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { AuthorizationService } from 'src/app/shared/services/authorization.service';
import { TagsService } from 'src/app/shared/services/tags.service';
import { TagsColorService } from 'src/app/shared/utils/tags-colors.service';

type ITagWithSelection = ITag & { selected: boolean };

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss'],
})
export class TagListComponent implements OnInit {
  ADD = ADD;

  authorized: boolean = false;
  tags: ITagWithSelection[] = [];
  addingNewTag: boolean = false;

  @Input()
  getSelectStatus: {
    (tag: ITag): boolean;
  } = () => false;

  @Output()
  toggle = new EventEmitter<ITag>();

  constructor(
    private readonly authService: AuthorizationService,
    private readonly tagsService: TagsService,
    private readonly apiService: ApiService,
    private readonly tagsColorService: TagsColorService
  ) {
    this.authorized = this.authService.authorized;
    this.authService.$token.subscribe(
      () => (this.authorized = this.authService.authorized)
    );
  }

  ngOnInit() {
    this.tags = this.tagsService.tags.map((_tag) => {
      return { ..._tag, selected: this.getSelectStatus(_tag) };
    });
    this.tagsService.$tags.subscribe(
      (tags) =>
        (this.tags = tags.map((_tag) => {
          return { ..._tag, selected: this.getSelectStatus(_tag) };
        }))
    );
  }

  changeTagName(tagId: number, newTagName: string) {
    this.apiService.changeTagName(tagId, newTagName).subscribe(() => {
      this.tagsService.changeTag(tagId, newTagName);
    });
  }
  createNewTag(tagName: string) {
    this.apiService.createTag(tagName).subscribe(({ tagId }) => {
      this.tags.push({
        ...this.tagsColorService.addColorToTag({
          tagId: tagId,
          tag: tagName,
        }),
        selected: false,
      });
      this.addingNewTag = false;
    });
  }
  deleteTag(tagId: number) {
    this.apiService.deleteTag(tagId).subscribe(() => {
      this.tags = this.tags.filter((tag) => tag.tagId !== tagId);
    });
  }
}
