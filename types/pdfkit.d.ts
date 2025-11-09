declare module 'pdfkit' {
  import { Stream } from 'stream';

  class PDFDocument {
    constructor(options?: any);
    addPage(options?: any): this;
    font(name?: string | Buffer, size?: number): this;
    fontSize(size: number): this;
    moveDown(): this;
  text(text: string, x?: number, y?: number, options?: any): this;
  // overload where options can be passed as second argument
  text(text: string, options?: any): this;
    pipe(dest: Stream): void;
    end(): void;
    on(event: 'data' | 'end' | string, cb: (...args: any[]) => void): this;
  }

  export default PDFDocument;
}
declare module "pdfkit" {
  // Minimal ambient declaration so TypeScript won't complain when types are not installed.
  // If you need strict typing, consider installing `@types/pdfkit` or adding a complete definition.
  const PDFDocument: any;
  export default PDFDocument;
}
