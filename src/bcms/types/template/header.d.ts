import type { HeaderItemGroup} from '../group/header_item';

export interface HeaderTemplate {
  title: string;
  slug: string;
  items: Array<HeaderItemGroup>;
}