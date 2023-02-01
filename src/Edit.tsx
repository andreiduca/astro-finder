import { useState, useMemo, useEffect } from 'react';

import type { SkyObject } from './astro';
import TrackedItem from './TrackedItem';

interface Props extends Partial<SkyObject> {
  onUpdate?: (skyObject: Partial<SkyObject>) => void;
  onCreate?: (skyObject: SkyObject) => void;
}

export default function Edit({ id, name, declination, hourAngle, timestamp, onUpdate, onCreate }: Props) {
  const [objectName, setObjectName] = useState(() => name ?? 'New Object');
  // declination
  const [degree, setDegree] = useState(() => declination?.degree ?? 90);
  const [declinationMinute, setDeclinationMinute] = useState(() => declination?.minute ?? 0);
  // hour-angle
  const [hour, setHour] = useState(() => hourAngle?.hour ?? 6);
  const [minute, setMinute] = useState(() => hourAngle?.minute ?? 0);
  const [second, setSecond] = useState(() => hourAngle?.second ?? 0);
  // a timestamp for latest update
  const [datetime, setDatetime] = useState<Date>(() => timestamp ?? new Date());

  // local declination and hour-angle objects
  const decObject = useMemo(() => ({ degree, minute: declinationMinute }), [degree, declinationMinute]);
  const haObject = useMemo(() => ({ hour, minute, second }), [hour, minute, second]);

  // reset local state after adding a new item (when id is `undefined`)
  function reset() {
    setObjectName('New Object');
    setDegree(90);
    setDeclinationMinute(0);
    setHour(6);
    setMinute(0);
    setSecond(0);
    setDatetime(new Date());
  }

  function createNewObject() {
    if (!id && onCreate) {
      onCreate({
        id: '',
        name: objectName,
        declination: decObject,
        hourAngle: haObject,
        timestamp: datetime,
      });

      reset();
    }
  }

  // updates to name should only change the name
  useEffect(() => {
    if (objectName !== name) {
      onUpdate?.({ id, name: objectName });
    }
  }, [id, name, objectName, onUpdate]);

  // updates to declination should only change the declination
  useEffect(() => {
    if (decObject.degree !== declination?.degree || decObject.minute !== declination?.minute) {
      onUpdate?.({ id, declination: decObject });
    }
  }, [id, declination, decObject, onUpdate]);

  // updates to hour-angle should save that with a new timestamp
  useEffect(() => {
    if (haObject.hour !== hourAngle?.hour || haObject.minute !== hourAngle?.minute || haObject.second !== hourAngle?.second) {
      const newTimestamp = new Date();
      setDatetime(newTimestamp);
      onUpdate?.({ id, hourAngle: haObject, timestamp: newTimestamp });
    }
  }, [id, hourAngle, haObject, onUpdate]);

  return (
    <article>
      <p>
        Name:
        <input name="objectName" size={20} value={objectName} onChange={(e) => setObjectName(e.target.value)} />
      </p>
      <p>
        Declination:
        <input name="decDegrees" size={4} value={degree.toString()} onChange={(e) => setDegree(Number(e.target.value))} />°
        <input name="decMinutes" size={4} value={declinationMinute.toString()} onChange={(e) => setDeclinationMinute(Number(e.target.value))} />'
      </p>
      <p>
        HourAngle:
        <input name="haHours" size={4} value={hour.toString()} onChange={(e) => setHour(Number(e.target.value))} />h
        <input name="haMinutes" size={4} value={minute.toString()} onChange={(e) => setMinute(Number(e.target.value))} />m
        <input name="haSeconds" size={4} value={second.toString()} onChange={(e) => setSecond(Number(e.target.value))} />s
      </p>

      <hr />
      <TrackedItem id={id ?? ''} name={objectName} timestamp={datetime} declination={decObject} hourAngle={haObject} />

      <hr />

      {id
        ? <>
            {`Editing #${id} | `}
            <button key="new" onClick={() => onUpdate?.({})}>Done</button>
          </>
        : <button key="add" onClick={createNewObject}>Add this object</button>
      }
    </article>
  );
}
