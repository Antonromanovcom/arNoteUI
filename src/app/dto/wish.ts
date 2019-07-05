export class Wish {

  constructor(id: number, wish: string, price: number, priority: number, archive: boolean, description: string, url: string) {
    this.id = id;
    this.wish = wish;
    this.price = price;
    this.priority = priority;
    this.archive = archive;
    this.description = description;
    this.url = url;
  }

  id: number;
  wish: string;
  price: number;
  priority: number;
  archive: boolean;
  description: string;
  url: string;
}
