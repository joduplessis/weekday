/**
 * Interface for file attachments
 *
 * @interface IAttachment
 */
export interface IAttachment {
  uri: string,
  preview?: string,
  mime: String,
  name: String,
  size: Number,
}
