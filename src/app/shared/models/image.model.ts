export interface ITag {
  tagId: number;
  tag: string;
}
export interface ISection {
  sectionId: number;
  section: string;
}

export interface IImage {
  imageId: number;
  image: string;
  tags: ITag[];
  sections: ISection[];
}
