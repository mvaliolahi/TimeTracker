window.TimeTracker = (function () {
    let intervalId = 0;
    let intervalTimeout = 1000;
    let callback = null;

    // Private functions
    function saveSessionData(sessionKey, data) {
        localStorage.setItem(sessionKey, JSON.stringify(data));
    }

    function loadSessionData(sessionKey) {
        var data = localStorage.getItem(sessionKey);
        return data ? JSON.parse(data) : {};
    }

    function handleVisibilityChange(sessionKey, sessionData, changeStateCallback) {
        return function () {
            if (document.visibilityState === 'hidden') {
                pause(sessionKey, sessionData);
            } else {
                resume(sessionKey, sessionData);
            }

            // Invoke the callback with the updated session duration after visibility change
            if (changeStateCallback) {
                let sessionDuration = getSessionDuration(sessionKey);
                changeStateCallback(formatDuration(sessionDuration));
            }
        };
    }

    // Public methods
    function reset(sessionKey) {
        clearInterval(intervalId);
        saveSessionData(sessionKey, {});
    }

    function start(sessionKey, startCallback = null, startIntervalTimeout = null, changeStateCallback = null) {
        if (startCallback) {
            callback = startCallback;
        }

        if (!sessionKey) {
            throw new Error("Session key must be provided.");
        }

        if (startIntervalTimeout) {
            intervalTimeout = startIntervalTimeout;
        }

        // Store the start time when the start method is called
        var sessionData = loadSessionData(sessionKey);
        let startTime = new Date().getTime();

        // Add event listener for visibility change
        document.addEventListener('visibilitychange', handleVisibilityChange(sessionKey, sessionData, changeStateCallback));

        // Periodically invoke the callback with the updated session duration
        // Return the interval ID to allow stopping the updates if needed
        intervalId = period(startTime, sessionKey);
        return intervalId;
    }

    function period(startTime, sessionKey) {
        if (callback) {
            return setInterval(function () {
                let currentTime = new Date().getTime();
                let elapsed = currentTime - startTime;
                let sessionDuration = getSessionDuration(sessionKey) + elapsed;

                callback({
                    milliseconds: sessionDuration,
                    format: formatDuration(sessionDuration)
                });
            }, intervalTimeout); // Update every second
        }
    }

    function pause(sessionKey, sessionData) {
        var currentTime = new Date().getTime();
        var lastPausedTime = sessionData.lastPausedTime || currentTime;
        var duration = sessionData.duration || 0;

        // Calculate the elapsed time since the last pause
        var elapsed = currentTime - lastPausedTime;

        // Update the total duration
        sessionData.duration = duration + elapsed;
        sessionData.lastPausedTime = currentTime;

        // Save the updated session data
        saveSessionData(sessionKey, sessionData);
        clearInterval(intervalId);
    }

    function resume(sessionKey, sessionData) {
        sessionData.lastPausedTime = new Date().getTime();
        saveSessionData(sessionKey, sessionData);

        let startTime = new Date().getTime();
        intervalId = period(startTime, sessionKey);
    }

    function getSessionDuration(sessionKey) {
        var sessionData = loadSessionData(sessionKey);
        return sessionData.duration || 0;
    }

    function formatDuration(milliseconds) {
        // Convert milliseconds to seconds
        var totalSeconds = Math.floor(milliseconds / 1000);

        // Calculate hours, minutes, and seconds
        var hours = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor((totalSeconds % 3600) / 60);
        var seconds = totalSeconds % 60;

        // Format the duration string
        var durationString = '';
        if (hours > 0) {
            durationString += hours + ':';
        }
        if (minutes >= 0 || hours > 0) {
            durationString += (minutes < 10 ? '0' : '') + minutes + ':';
        }
        durationString += (seconds < 10 ? '0' : '') + seconds;

        return durationString;
    }

    function read(sessionKey) {
        let sessionDuration = getSessionDuration(sessionKey);

        return {
            milliseconds: sessionDuration || 0,
            format: formatDuration(sessionDuration) || ""
        }
    }

    // Public API
    return {
        start: start,
        pause: pause,
        resume: resume,
        reset: reset,
        read: read,
    };
})();
