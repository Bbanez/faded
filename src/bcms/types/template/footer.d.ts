import type { FooterItemGroup} from '../group/footer_item';

export interface FooterTemplate {
  title: string;
  slug: string;
  items: Array<FooterItemGroup>;
}