import { useEffect, useState } from 'react';

import logo from './logo.svg';
import './App.css';
import Edit from './Edit';
import type { SkyObject } from './astro';
import TrackedItem from './TrackedItem';

function randomHex(length = 4) {
  return Math.floor(Math.random() * (16 ** length - 1)).toString(16).padStart(length, '0');
}

const STORAGE_KEY = '__skyObjects';

function parseStorageData() {
  try {
    const rawData = JSON.parse(window?.localStorage.getItem(STORAGE_KEY) ?? '[]') as SkyObject[];
    return rawData.map(item => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  } catch(e) {
    console.warn('Data from local storage was corrupt');
    return [];
  }
}

function App() {
  const [items, setItems] = useState<SkyObject[]>(parseStorageData);
  const [selectedItemId, setSelectedItemId] = useState<string>();

  function addItem(newItem: SkyObject) {
    if (!newItem.id) {
      setItems([
        ...items,
        { ...newItem, id: randomHex(8) }
      ]);
    }
  }

  function removeItem(itemId: string) {
    setItems(items.filter(({ id }) => id !== itemId));
    if (selectedItemId === itemId) {
      setSelectedItemId(undefined);
    }
  }

  function updateItem(itemUpdates: Partial<SkyObject>) {
    if (itemUpdates.id) {
      setItems(items.map(item => (
        item.id === itemUpdates.id
          ? { ...item, ...itemUpdates }
          : item
      )));
    } else {
      setSelectedItemId(undefined);
    }
  }

  useEffect(() => {
    window?.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Declination and HourAngle rotation calculator</p>
      </header>
      <main>
        {selectedItemId
          ? <Edit key={`edit_${selectedItemId}`} {...items.find(({ id }) => id === selectedItemId)} onUpdate={updateItem} />
          : <Edit key="new" onCreate={addItem} />
        }
        {items.map(item => (
          <TrackedItem
            key={`view_${item.id}`}
            {...item}
            onEdit={setSelectedItemId}
            onRemove={removeItem}
            isSelected={item.id === selectedItemId}
          />)
        )}
      </main>
    </div>
  );
}

export default App;
