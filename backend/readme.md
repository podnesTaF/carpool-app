# Examples

- Some example payloads:

## Add Ride

- POST

```json
{
  "pickupLat": 4,
  "pickupLong": 8,
  "preferredPickupLat": 5,
  "preferredPickupLong": 15,
  "pickupRadius": 20,
  "pickupSequence": 4,
  "maxPassengers": 4,
  "startDateTime": "2025-01-15T07:57:29.875+00:00",
  "driver": false,
  "passengerRides": []
}
```

## Add Ride (and also create passengerRide(s))

- POST

```json
{
  "pickupLat": 4,
  "pickupLong": 8,
  "preferredPickupLat": 5,
  "preferredPickupLong": 15,
  "pickupRadius": 20,
  "pickupSequence": 4,
  "maxPassengers": 4,
  "startDateTime": "2025-01-15T07:57:29.875+00:00",
  "driver": false,
  "passengerRides": [
    {
      "pickupLat": 4,
      "pickupLong": 8,
      "preferredPickupLat": 5,
      "preferredPickupLong": 15,
      "pickupRadius": 20,
      "pickupSequence": 4,
      "maxPassengers": 4,
      "startDateTime": "2025-01-15T07:57:29.875+00:00",
      "driver": false,
      "passengerRides": []
    }
  ]
}
```

## Add Vehicle

- POST

```json
{
  "maxPassengers": 4,
  "plate": "POST",
  "color": "red",
  "brand": "Tesla",
  "model": "Model 3",
  "imgUrl": "/test.png",
  "user": "/users/1",
  "rides": []
}
```

## Link vehicle to ride

- PUT

```json
{
  "_links": {
    "vehicle": {
      "href": "/vehicles/3"
    }
  }
}
```

## Add User

- POST

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "test@gmail.com",
  "address": "Kleinhoefstraat 4",
  "city": "Geel",
  "avatarUrl": "/test.png",
  "talkative": true,
  "smoking": false
}
```

## Add Notification

- POST

```json
{
  "title": "Test Notification",
  "description": "This is a mock notification",
  "type": "SYSTEM",
  "read": false
}
```

## Register as driver for an event:

- POST

```json
{
  "driver": true,
  "pickupLat": 4,
  "pickupLong": 8,
  "pickupRadius": 20,
  "pickupSequence": 4,
  "event": "http://localhost:8080/events/2"
}
```

## Register as passenger for an event:

- POST

1. Create passenger ride

```json
{
  "pickupLat": 4,
  "pickupLong": 8,
  "driver": false,
  "canBeDriver": true,
  "event": "http://localhost:8080/events/1"
}
```

## Link driver and passenger

- PUT /rides/{id}/driverRide
  - {id} is of passengerRide

```json
{
  "_links": {
    "driverRide": {
      "href": "/rides/10"
    }
  }
}
```
