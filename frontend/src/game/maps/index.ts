import mapArena from './arena.json';
import mapPit from './pit.json';
import mapBridge from './bridge.json';
import mapSteps from './steps.json';
import mapTowers from './towers.json';
import mapCross from './cross.json';
import mapGaps from './gaps.json';
import mapColumns from './columns.json';
import mapValley from './valley.json';
import mapIslands from './islands.json';

export interface MapPlatform {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MapSpawn {
  x: number;
  y: number;
}

export interface GameMap {
  id: string;
  name: string;
  size: {
    width: number;
    height: number;
  };
  platforms: MapPlatform[];
  spawns: MapSpawn[];
}

export const MAPS: GameMap[] = [
  mapArena,
  mapPit,
  mapBridge,
  mapSteps,
  mapTowers,
  mapCross,
  mapGaps,
  mapColumns,
  mapValley,
  mapIslands,
] as GameMap[];

export const getMapById = (id: string): GameMap => {
  return MAPS.find((m) => m.id === id) || MAPS[0];
};
