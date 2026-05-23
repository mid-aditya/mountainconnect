# Emergency Flow Documentation

## 1. SOS Trigger Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SOS TRIGGER SEQUENCE                                │
└─────────────────────────────────────────────────────────────────────────────┘

    HIKER                MOBILE APP                SERVER              DASHBOARD
      │                      │                       │                     │
      │  Long-press SOS      │                       │                     │
      │  (3 seconds)        │                       │                     │
      │────────────────────►│                       │                     │
      │                      │                       │                     │
      │              ┌───────▼────────┐              │                     │
      │              │ Countdown 10s  │              │                     │
      │              │ (can cancel)   │              │                     │
      │              └───────┬───────┘              │                     │
      │                      │ Confirm               │                     │
      │                      │                       │                     │
      │              ┌───────▼────────┐              │                     │
      │              │ Capture GPS    │              │                     │
      │              │ lat, lng, acc  │              │                     │
      │              └───────┬───────┘              │                     │
      │                      │                       │                     │
      │                      │ POST /sos/trigger    │                     │
      │                      │ {lat, lng, accuracy,  │                     │
      │                      │  mountain_id, timestamp│                     │
      │                      │─────────────────────►│                     │
      │                      │                       │                     │
      │                      │              ┌────────▼────────┐           │
      │                      │              │ 1. Store SOS    │           │
      │                      │              │ 2. Emit WS event│           │
      │                      │              │ 3. Alert contacts│           │
      │                      │              └────────┬────────┘           │
      │                      │                       │                     │
      │                      │              ┌────────▼────────┐           │
      │                      │              │ SMS to emergency│           │
      │                      │              │ contacts (Twilio│           │
      │                      │              │ fallback: SMS)  │           │
      │                      │              └────────┬────────┘           │
      │                      │                       │                     │
      │                      │                       │ WS: sos:triggered  │
      │                      │                       │───────────────────►│
      │                      │                       │                     │
      │                      │              ┌────────▼────────┐           │
      │                      │              │ Alert basecamp  │           │
      │                      │              │ (SMS + dashboard│           │
      │                      │              │ + SAR request) │           │
      │                      │              └────────┬────────┘           │
      │                      │                       │                     │
      │                      │       200 OK          │                     │
      │                      │◄──────────────────────│                     │
      │    SOS Confirmed     │                       │                     │
      │◄────────────────────│                       │                     │
```

## 2. Check-In / Check-Out Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      HIKE TRACKING SEQUENCE                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    HIKER                MOBILE APP                SERVER              ALERTS
      │                      │                       │                     │
      │  Start Hike          │                       │                     │
      │────────────────────►│                       │                     │
      │                      │                       │                     │
      │                      │ POST /sos/check-in    │                     │
      │                      │ {trip_id, lat, lng,   │                     │
      │                      │  eta_timestamp}       │                     │
      │                      │──────────────────────►│                     │
      │                      │                       │                     │
      │                      │              ┌───────▼────────┐           │
      │                      │              │ Record start   │           │
      │                      │              │ Set ETA timer  │           │
      │                      │              │ (BullMQ job)   │           │
      │                      │              └───────┬────────┘           │
      │                      │                       │                     │
      │                      │       200 OK          │                     │
      │                      │◄──────────────────────│                     │
      │    Check-in confirmed│                       │                     │
      │◄────────────────────│                       │                     │
      │                      │                       │                     │
      │  Periodic GPS        │                       │                     │
      │  updates (every 5min│                       │                     │
      │  or 100m movement)   │                       │                     │
      │────────────────────►│                       │                     │
      │                      │                       │                     │
      │                      │ POST /location       │                     │
      │                      │ {lat, lng, timestamp} │                     │
      │                      │─────────────────────►│                     │
      │                      │                       │                     │
      │                      │              ┌───────▼────────┐           │
      │                      │              │ Update trail   │           │
      │                      │              │ Log to DB     │           │
      │                      │              └───────┬────────┘           │
      │                      │                       │                     │
      │                      │◄──────────────────────│                     │
      │                      │                       │                     │
      │                      │                       │ ETA - 30min:        │
      │                      │                       │ Push reminder       │
      │                      │                       │────────────────────►│
      │                      │                       │                     │
      │  End Hike            │                       │                     │
      │────────────────────►│                       │                     │
      │                      │                       │                     │
      │                      │ POST /sos/check-out   │                     │
      │                      │ {trip_id, lat, lng}   │                     │
      │                      │──────────────────────►│                     │
      │                      │                       │                     │
      │                      │              ┌───────▼────────┐           │
      │                      │              │ Cancel ETA job │           │
      │                      │              │ Mark complete  │           │
      │                      │              └───────┬────────┘           │
      │                      │                       │                     │
      │                      │◄──────────────────────│                     │
      │    Hike completed    │                       │                     │
      │◄────────────────────│                       │                     │
```

## 3. Overdue / Escalation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        OVERDUE ESCALATION FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

    SYSTEM                TN ADMIN              SAR TEAM            CONTACTS
      │                      │                     │                     │
      │  ETA + buffer (30min)                     │                     │
      │  exceeded           │                     │                     │
      │───────────────────►│                     │                     │
      │                     │                     │                     │
      │              ┌──────▼────────┐           │                     │
      │              │ OVERDUE ALERT │           │                     │
      │              │ (Dashboard +  │           │                     │
      │              │  Push to TN   │           │                     │
      │              │  Admin)       │           │                     │
      │              └──────┬────────┘           │                     │
      │                     │                     │                     │
      │                     │ Level 1: Low        │                     │
      │                     │ (30-60 min late)     │                     │
      │                     │────────────────────►│                     │
      │                     │                     │                     │
      │                     │                     │ Call hiker          │
      │                     │                     │ Check with basecamp  │
      │                     │◄────────────────────│                     │
      │                     │                     │                     │
      │                     │ Resolution?          │                     │
      │                     │◄────────────────────│                     │
      │                     │                     │                     │
      │  No resolution      │                     │                     │
      │───────────────────►│                     │                     │
      │                     │                     │                     │
      │                     │ Level 2: Medium      │                     │
      │                     │ (60-120 min late)    │                     │
      │                     │────────────────────►│                     │
      │                     │                     │                     │
      │                     │                     │ Deploy search party  │
      │                     │                     │                     │
      │                     │◄────────────────────│                     │
      │                     │                     │                     │
      │  Still no contact  │                     │                     │
      │───────────────────►│                     │                     │
      │                     │                     │                     │
      │                     │ Level 3: High       │                     │
      │                     │ (120+ min late)      │                     │
      │                     │────────────────────►│                     │
      │                     │                     │                     │
      │                     │                     │ Full SAR operation   │
      │                     │                     │ Contact family       │
      │                     │                     │ Notify authorities   │
      │                     │                     │                     │
```

## 4. Weather Alert Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        WEATHER HAZARD FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    BMKG API            SERVER              DASHBOARD             HIKERS
      │                    │                     │                    │
      │  Weather poll      │                     │                    │
      │  (every 15 min)    │                     │                    │
      │───────────────────►│                     │                    │
      │                    │                     │                    │
      │              ┌──────▼────────┐           │                    │
      │              │ Analyze data   │           │                    │
      │              │ vs thresholds  │           │                    │
      │              └───────┬────────┘           │                    │
      │                    │                     │                    │
      │                    │ Hazard detected?    │                    │
      │                    │────────────────────│                    │
      │                    │                     │                    │
      │                    │              ┌──────▼────────┐         │
      │                    │              │ POST weather  │         │
      │                    │              │ alert to DB  │         │
      │                    │              └───────┬────────┘         │
      │                    │                     │                    │
      │                    │              Push notification          │
      │                    │              (Firebase Cloud Msg)      │
      │                    │─────────────────────│─────────────────►│
      │                    │                     │                    │
      │                    │              ┌──────▼────────┐         │
      │                    │              │ Update map    │         │
      │                    │              │ overlays      │         │
      │                    │              └───────┬────────┘         │
      │                    │                     │                    │
      │                    │              ┌──────▼────────┐         │
      │                    │              │ SMS to active │         │
      │                    │              │ hikers in area│         │
      │                    │              └───────┬────────┘         │
      │                    │                     │                    │
      │                    │ Hazard level:       │                    │
      │                    │ - Yellow: Warning   │                    │
      │                    │ - Orange: Alert      │                    │
      │                    │ - Red: Danger/Close  │                    │
      │                    │────────────────────│                    │
```

## Threshold Reference

| Event | Threshold | Buffer | Action |
|-------|-----------|--------|--------|
| Check-in overdue | ETA + 30 min | 30 min | Push reminder |
| Check-in overdue L1 | ETA + 60 min | 60 min | Contact hiker |
| Check-in overdue L2 | ETA + 120 min | 120 min | SAR deployment |
| Check-in overdue L3 | ETA + 180 min | 180 min | Full SAR + authorities |
| Weather - Yellow | 60% rain probability | - | Warning push |
| Weather - Orange | 80% rain + wind >50kmh | - | Alert + route warning |
| Weather - Red | Thunderstorm / volcano alert | - | Close trail + evacuation |
