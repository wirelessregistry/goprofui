export default ListFactory 

function ListFactory (length) {
  this.length = length || 10;
  this.store = [];
  this.push = (item)=>{
    this.store.push(item);
    if(this.store.length > this.length) {
      this.store.shift();
    }
    if (item > this.max || this.max == undefined) {
      this.max = item;
    }
    if ((item < this.min || this.min == undefined) && item > 0) {
      this.min = item;
    }
    return this.store;
  }
  this.clear = ()=>{
    this.store = [];
    this.max = undefined;
    this.min = undefined;
  }
}