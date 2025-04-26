import { getDistance } from "geolib";

// Define the type for the client data
export interface ClientData {
  name: string;
  airport: string;
  radius: number;
  latitude: number;
  longitude: number;
}

export function isMatch(data1 : ClientData, data2 : ClientData) {
  // Distance converted to km
  const dist = getDistance(
    { latitude: data1.latitude, longitude: data1.longitude },
    { latitude: data2.latitude, longitude: data2.longitude },
  );

  return dist <= data1.radius + data2.radius &&
         data1.airport == data2.airport;
}
