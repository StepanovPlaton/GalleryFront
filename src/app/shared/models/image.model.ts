export interface ITagWithoutBgColor {
  tagId: number;
  tag: string;
}
export interface ITag {
  tagId: number;
  tag: string;
  BgColor: string;
}
export interface ISection {
  sectionId: number;
  section: string;
}

export interface IImage {
  imageId: number;
  image: string;
  tags: ITagWithoutBgColor[];
  sections: ISection[];
}
