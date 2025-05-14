export class DoublyLinkedNode<T> {
  value: T;
  prev: DoublyLinkedNode<T> | null = null;
  next: DoublyLinkedNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export default class DoublyLinkedList<T> {
  head: DoublyLinkedNode<T> | null = null;
  tail: DoublyLinkedNode<T> | null = null;
  current: DoublyLinkedNode<T> | null = null;

  push(value: T) {
    const node = new DoublyLinkedNode(value);
    if (!this.head) {
      this.head = this.tail = this.current = node;
    } else {
      if (this.current && this.current.next) {
        this.current.next.prev = null;
        this.current.next = null;
        this.tail = this.current;
      }
      node.prev = this.tail;
      if (this.tail) this.tail.next = node;
      this.tail = node;
      this.current = node;
    }
  }

  undo(): T | null {
    if (this.current && this.current.prev) {
      this.current = this.current.prev;
      return this.current.value;
    }
    return null;
  }

  redo(): T | null {
    if (this.current && this.current.next) {
      this.current = this.current.next;
      return this.current.value;
    }
    return null;
  }

  getCurrent(): T | null {
    return this.current ? this.current.value : null;
  }

  getList(): T[] {
    const list: T[] = [];
    let current = this.head;
    while (current) {
      list.push(current.value);
      current = current.next;
    }
    return list;
  }
}