type Subscriber = (type: String, payload: any) => void;

class EventBus {
  private subscribers: Subscriber[] = [];

  subscribe(subscriber: Subscriber) {
    this.subscribers.push(subscriber);
  }
  publish(type: String, payload: any) {
    this.subscribers.forEach((sub) => sub(type, payload));
  }
}

const bus = new EventBus();

export default bus;
