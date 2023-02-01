/*
A named Tracked Ttem is saved at "timestamp" with "declination" and "hour-angle".
Every 5 seconds, compute time passed since "timestamp" and add it to the "hour-angle".
Update coordinates of object.
*/
import { useState, useEffect } from 'react';
import type { SkyObject } from './astro';
import { declinationDegree, hourAngleDegree, addTimeToHourAngle } from './astro';


interface Props extends SkyObject {
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
  isSelected?: boolean;
}

export default function TrackedItem({
  id,
  name,
  timestamp,
  declination,
  hourAngle,
  onEdit,
  onRemove,
  isSelected,
}: Props) {
  // updated coordinates
  const [currentHA, setCurrentHA] = useState(() => hourAngle);
  // rotations
  const [decRotation, setDecRotation] = useState(0);
  const [hourRotation, setHourRotation] = useState(0);

  useEffect(() => {
    function refreshCoordinates() {
      const secondsDiff = Math.floor(((new Date()).getTime() - timestamp.getTime())/1000);
      const newHA = addTimeToHourAngle(hourAngle, secondsDiff);

      setCurrentHA(newHA);
      setDecRotation(declinationDegree(declination, newHA));
      setHourRotation(hourAngleDegree(newHA));
    }

    refreshCoordinates();
    const t = setInterval(refreshCoordinates, 1000);
    return () => clearInterval(t);
  }, [timestamp, declination, hourAngle]);

  return (
    <article style={{ borderColor: isSelected ? 'red' : 'white' }} onClick={() => id && onEdit?.(id)}>
      <div>
        {id && onEdit && <small>Object ID: #{id}</small>}
        <h1>{name}</h1>
      </div>
      <div>
        <div>Declination: {declination.degree}° {declination.minute}'</div>
        <strong><code>{decRotation.toFixed(2)}°</code></strong>
      </div>
      <div>
        <p>Hour Angle: {currentHA.hour}h {currentHA.minute}m {currentHA.second}s</p>
        <strong><code>{hourRotation.toFixed(2)}°</code></strong>
      </div>
      {id && onRemove && (
        <>
          <hr />
          <button onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`Are you sure you want to delete ${name}?`)) {
              onRemove?.(id);
            }
          }}>Delete</button>
        </>
      )}
    </article>
  );
}
