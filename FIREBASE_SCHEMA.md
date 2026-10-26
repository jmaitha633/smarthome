# Firebase Realtime Database schema for JKSmartNest upgrade

The existing website uses `controls` and `status`. The upgraded dashboard expects these optional fields:

```json
{
  "controls": {
    "light1": false,
    "light2": false,
    "light3": false,
    "armed": true
  },
  "status": {
    "online": true,
    "lastSeen": 1793000000000,
    "motion": false,
    "doorOpen": false,
    "distanceCm": 155,
    "tamper": false,
    "alarm": false,
    "alarmReason": "",
    "gasRaw": 0,
    "gasAlarm": false,
    "flame": false,
    "temperatureC": 27.4,
    "sensorFault": false,
    "sensorHealth": "OK",
    "safetyMessage": "",
    "solarWatts": 45.2,
    "solarVolts": 18.1,
    "loadWatts": 12.3,
    "loadAmps": 1.02,
    "batteryVolts": 13.1,
    "batteryAmps": -0.8,
    "batterySoc": 78,
    "loadShed": false
  },
  "accessEvents": {
    "eventAutoId": {
      "timestamp": 1793000000000,
      "identity": "RFID user label or masked ID",
      "method": "RFID",
      "event": "Entry verification",
      "result": "Denied"
    }
  }
}
```

## Integration notes
- Timestamps should be Unix milliseconds or parseable ISO date strings.
- `lastSeen` is expected as Unix milliseconds.
- The ESP32 should update `status` periodically and set `online` false or use a heartbeat/timeout strategy.
- `accessEvents` should be written only by trusted firmware/backend paths after an actual access attempt. Do not accept identity claims from arbitrary browser clients.
- Lock/unlock commands should be disabled until the lock mechanism, limit switches, manual egress and safety behavior are tested.
- Add Firebase Authentication and strict Realtime Database Rules before connecting real hardware. The browser client must not have unrestricted write access to `status` or `accessEvents`.
- If your ESP32 uses different keys, edit the mapping in `script.js` or change firmware to publish the schema above.
- INA219 provides voltage/current/power at its measurement point. To report solar generation, battery flow and load consumption separately, use suitable separate measurement points/sensors. Do not infer battery state-of-charge from voltage alone unless the battery chemistry and operating conditions support the estimate.
