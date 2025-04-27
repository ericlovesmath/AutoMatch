import { getDistance, getCenter } from "geolib";
import { ClientData, Path } from "../../shared/types";
import { GeolibInputCoordinates } from "geolib/es/types";

function get_point(orig_p1: GeolibInputCoordinates, orig_p2: GeolibInputCoordinates, r1: number, r2: number) {
    if (Math.random() < 0.5) {
        [orig_p1, orig_p2] = [orig_p2, orig_p1];
        [r1, r2] = [r2, r1];
    }

    let p1 = orig_p1;
    let p2 = orig_p2;

    let midpoint = getCenter([p1, p2]);
    if (!midpoint) {
        return null;
    }

    while (true) {
        const dist1 = getDistance(midpoint, orig_p1);
        const dist2 = getDistance(midpoint, orig_p2);

        if (dist1 > r1 && dist2 > r2) {
            return null;
        }

        if (dist1 > r1) {
            p2 = midpoint;
        } else if (dist2 > r2) {
            p1 = midpoint;
        } else {
            return midpoint;
        }

        midpoint = getCenter([p1, p2]);
        if (!midpoint) {
            return null;
        }
    }
}

export function getSharedPoint(data1: ClientData, data2: ClientData): Path | null {
    const distFrom = getDistance(
        { latitude: data1.from.latitude, longitude: data1.from.longitude },
        { latitude: data2.from.latitude, longitude: data2.from.longitude },
    );
    const distTo = getDistance(
        { latitude: data1.to.latitude, longitude: data1.to.longitude },
        { latitude: data2.to.latitude, longitude: data2.to.longitude },
    );

    if (
        distFrom <= data1.from.radius + data2.from.radius &&
        distTo <= data1.to.radius + data2.to.radius
    ) {
        let from = get_point(data1.from, data2.from, data1.from.radius, data2.from.radius);
        let to = get_point(data1.to, data2.to, data1.to.radius, data2.to.radius);
        if (!from || !to) {
            return null;
        }
        return {
            from_lat: from.latitude,
            from_lng: from.longitude,
            to_lat: to.latitude,
            to_lng: to.longitude,
        };
    } else {
        return null;
    }
}
