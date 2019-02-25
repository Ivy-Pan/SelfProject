// test/test.js

import Storage from '../lib/storage.js';
import Event from '../lib/Event.js';

let event = new Event();

event.addEvent('onLoad', () => {
  console.log(1)
})
event.addEvent('onLoad', () => {
  console.log(2)
})

event.data = {
  test: 'test'
}



Page(event)