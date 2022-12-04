
export interface CommentsTemplate {
  title: string;
  slug: string;
  account_id?: string;
  comment: string;
  replied_to_id?: string;
  post_id: string;
  is_thread?: boolean;
}