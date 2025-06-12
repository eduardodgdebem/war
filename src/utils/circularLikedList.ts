export default class CircularLikedList<T> {
  private head: T | undefined = undefined;
  private tail: T | undefined = undefined;
  private size: number = 0;
  private current: T | undefined = undefined;

  constructor(arr?: T[]) {
    if (arr) {
      arr.forEach(item => this.add(item));
    }
  }

  add(item: T): void {  
    this.size++;
    if (!this.head) {
      this.head = item;
      this.tail = item;
      (this.tail as any).next = this.head;
    } else {
      (this.tail as any).next = item;
      this.tail = item;
      (this.tail as any).next = this.head;
    }
  }

  getHead(): T | undefined {
    return this.head;
  }

  clearCurrent(): void {
    this.current = undefined;
  }

  getCurrent(): T | undefined {
    if (!this.current) {
      this.current = this.head;
    }
    return this.current;
  }

  setCurrent(checkCallBack: (t: T) => boolean): void {
    const item = this.getItem(checkCallBack);
    if (!item) {
      this.current = undefined;
      return; 
    } else {
      this.current = item;
    }
  }

  getItem(checkCallBack: (t: T) => boolean): T | undefined {
    if (!this.head) return undefined;

    let current = this.head;
    do {
      if (checkCallBack(current)) {
        return current;
      }
      current = (current as any).next;
    } while (current !== this.head);

    return undefined;
  }

  next(): T | undefined {
    if (!this.head) return undefined;
    if (!this.current) {
      this.current = this.head;
    } else {
      this.current = (this.current as any).next;
    }
    return this.current;
  }

  clear(): void {
    this.head = undefined;
    this.tail = undefined;
    this.size = 0;
    this.current = undefined;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  getList(): T[] {
    const list: T[] = [];
    if (!this.head) return list;

    let current = this.head;
    do {
      list.push(current);
      current = (current as any).next;
    } while (current !== this.head);

    return list;
  }
}
