export interface HighlightTag {
  indices: {
    start: number;
    end: number;
  };
  cssClass?: string;
  data?: any;
}
