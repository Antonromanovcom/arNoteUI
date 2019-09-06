export class Wish {

  constructor(id: number, wish: string, price: number, priority: number, archive: boolean,
              description: string, url: string, realized: boolean) {
    this.id = id;
    this.wish = wish;
    this.price = price;
    this.priority = priority;
    this.archive = archive;
    this.description = description;
    this.url = url;
    this.realized = realized;
  }

  id: number;
  wish: string;
  price: number;
  priority: number;
  archive: boolean;
  description: string;
  url: string;
  realized: boolean;
  priorityGroup: number;
  creationDate: string;
}
