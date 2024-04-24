# TimeTracker
TimeTracker is a JavaScript library designed to track time durations, specifically for managing session durations in web applications. It provides functionalities to start, pause, and resume session tracking, as well as reading the current session duration.

## Features
- Start Session: Begin tracking session duration.
- Pause Session: Pause session tracking.
- Resume Session: Resume session tracking after pausing.
- Read Session Duration: Get the current session duration in milliseconds and formatted string.

### Installation
```bash
npm install @mvaliolahi/time-tracker
```

### Start tracking
This code starts a tracker for the `home` key, and every 1 second the callback will be run with a data object containing format and milliseconds keys.
Also, the start method returns `intervalId` to allow stopping the updates if needed.
Note: the second argument can change interval timeout, it's proper to make the callback for sending data in long periods to the server.
Also, you can watch the `pause` and `resume` state change by passing a callback as a third argument.

```js
TimeTracker.start("home", (data) => {
    console.log(data.format, data.milliseconds)
});
```

### Pause tracking
```js
TimeTracker.pause('sessionKey');
```

### Resume tracking
```js
TimeTracker.resume('sessionKey');
```

### Read tracking data
```js
const data = TimeTracker.read("about")
console.log(data.format)
```
