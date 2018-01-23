export default function addEventListener(type, listener, options) {
    this.addEventListener(type, listener, options);
    return () => this.removeEventListener(type, listener, options);
}