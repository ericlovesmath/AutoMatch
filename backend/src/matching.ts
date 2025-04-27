import { getDistance } from "geolib";
import { ClientData } from "../../shared/types";

export function isMatch(data1: ClientData, data2: ClientData): boolean {
  const distFrom = getDistance(
    { latitude: data1.from.latitude, longitude: data1.from.longitude },
    { latitude: data2.from.latitude, longitude: data2.from.longitude },
  );
  const distTo = getDistance(
    { latitude: data1.to.latitude, longitude: data1.to.longitude },
    { latitude: data2.to.latitude, longitude: data2.to.longitude },
  );

  return (
    distFrom <= data1.from.radius + data2.from.radius &&
    distTo <= data1.to.radius + data2.to.radius
  );
}
