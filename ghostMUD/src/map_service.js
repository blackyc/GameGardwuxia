/**
 * map_service.js — 舆图数据服务
 *
 * 只提供世界区域摘要与局部图数据，不调用 move/quickTravel，不渲染 UI。
 */

import { getEntryAccess } from './entry_condition.js';

function regionIdFromRoom(roomId, room = {}) {
  if (room.region) return String(room.region);
  if (room.area) return String(room.area);
  if (room.climateZone) return String(room.climateZone);
  const id = String(roomId || '');
  const sep = id.indexOf('·');
  if (sep > 0) return id.slice(0, sep);
  return id || '未知';
}

function shortLabel(roomId) {
  const id = String(roomId || '');
  const parts = id.split('·');
  return parts[parts.length - 1] || id || '未知';
}

export class MapService {
  /** @param {import('./game.js').Game} game */
  constructor(game) {
    this.game = game;
  }

  _state() {
    return this.game.state || {};
  }

  _locations() {
    return this.game.LOCATIONS || {};
  }

  _exploredSet() {
    const explored = this._state().explored;
    return new Set(Array.isArray(explored) ? explored : []);
  }

  /**
   * 世界区域摘要（不暴露未发现区域内部房间列表）。
   */
  getWorldRegions() {
    const locations = this._locations();
    const explored = this._exploredSet();
    const currentRoom = this._state().location;
    const currentRegion = regionIdFromRoom(currentRoom, locations[currentRoom] || {});

    /** @type {Map<string, { id: string, name: string, rooms: string[], exploredRooms: string[], neighborSet: Set<string> }>} */
    const regions = new Map();

    for (const [roomId, room] of Object.entries(locations)) {
      const rid = regionIdFromRoom(roomId, room || {});
      if (!regions.has(rid)) {
        regions.set(rid, {
          id: rid,
          name: rid,
          rooms: [],
          exploredRooms: [],
          neighborSet: new Set(),
        });
      }
      const bucket = regions.get(rid);
      bucket.rooms.push(roomId);
      if (explored.has(roomId)) bucket.exploredRooms.push(roomId);
    }

    // 邻接：仅从已探索房间的可见出口推导区域邻居
    for (const roomId of explored) {
      const room = locations[roomId];
      if (!room) continue;
      const fromRegion = regionIdFromRoom(roomId, room);
      const routes = this._visibleRoutes(roomId);
      for (const route of routes) {
        const toRegion = regionIdFromRoom(route.target, locations[route.target] || {});
        if (toRegion && toRegion !== fromRegion && regions.has(fromRegion)) {
          regions.get(fromRegion).neighborSet.add(toRegion);
        }
      }
    }

    const result = [];
    for (const bucket of regions.values()) {
      const discovered = bucket.exploredRooms.length > 0;
      if (!discovered && bucket.id !== currentRegion) {
        // 完全未发现的区域：可在邻居列表中出现 id，但不在此展开内部
        // 仍可出现在列表中若玩家邻接已知；此处仅返回至少发现一间房的区域 + 当前区域
        continue;
      }
      result.push({
        id: bucket.id,
        name: bucket.name,
        discovered,
        current: bucket.id === currentRegion,
        discoveredRoomCount: bucket.exploredRooms.length,
        totalKnownRoomCount: discovered ? bucket.rooms.length : 0,
        neighbors: [...bucket.neighborSet].sort(),
      });
    }

    // 确保当前区域始终在列表中
    if (currentRegion && !result.some((r) => r.id === currentRegion)) {
      const bucket = regions.get(currentRegion);
      result.unshift({
        id: currentRegion,
        name: currentRegion,
        discovered: true,
        current: true,
        discoveredRoomCount: bucket ? bucket.exploredRooms.length : 0,
        totalKnownRoomCount: bucket ? bucket.rooms.length : 0,
        neighbors: bucket ? [...bucket.neighborSet].sort() : [],
      });
    }

    return result.sort((a, b) => {
      if (a.current !== b.current) return a.current ? -1 : 1;
      return a.name.localeCompare(b.name, 'zh');
    });
  }

  /**
   * 当前区域、以 center 为中心默认 2 跳的局部图。
   * @param {string} [roomId]
   * @param {{ depth?: number, regionOnly?: boolean }} [options]
   */
  getLocalGraph(roomId, options = {}) {
    const locations = this._locations();
    const centerRoomId = roomId || this._state().location;
    const depth = Number.isFinite(Number(options.depth)) ? Math.max(0, Math.floor(Number(options.depth))) : 2;
    const regionOnly = options.regionOnly !== false;
    const centerRoom = locations[centerRoomId] || {};
    const regionId = regionIdFromRoom(centerRoomId, centerRoom);
    const explored = this._exploredSet();

    /** @type {Map<string, object>} */
    const nodes = new Map();
    /** @type {Map<string, object>} */
    const edges = new Map();

    const queue = [{ id: centerRoomId, dist: 0, anonymous: false }];
    const seen = new Set();

    while (queue.length > 0) {
      const { id, dist, anonymous } = queue.shift();
      if (seen.has(id)) continue;
      seen.add(id);

      const room = locations[id] || {};
      const rid = regionIdFromRoom(id, room);
      if (regionOnly && rid !== regionId && id !== centerRoomId && !anonymous) {
        // 跨区边界节点可标记但不再扩展
      }

      const isExplored = explored.has(id);
      nodes.set(id, {
        id: anonymous ? `anon:${id}` : id,
        label: anonymous ? '？？？' : (room.name || shortLabel(id)),
        current: id === centerRoomId,
        explored: isExplored && !anonymous,
        hidden: Boolean(anonymous),
        locked: false,
      });

      if (anonymous || dist >= depth) continue;
      if (regionOnly && rid !== regionId && id !== centerRoomId) continue;

      const routes = this._routesForGraph(id);
      for (const route of routes) {
        if (route.state === 'hidden') continue;

        const target = route.target;
        const targetRoom = locations[target] || {};
        const targetRegion = regionIdFromRoom(target, targetRoom);
        const locked = route.state === 'revealedLocked' || route.locked === true;
        const sensedOnly = route.state === 'sensed';
        const edgeKey = `${id}=>${target}::${route.direction}`;

        if (sensedOnly) {
          const anonId = `sensed:${route.id || edgeKey}`;
          nodes.set(anonId, {
            id: anonId,
            label: '？？？',
            current: false,
            explored: false,
            hidden: true,
            locked: false,
          });
          edges.set(edgeKey, {
            from: id,
            to: anonId,
            direction: route.direction,
            discovered: true,
            locked: false,
          });
          continue;
        }

        edges.set(edgeKey, {
          from: id,
          to: target,
          direction: route.direction,
          discovered: true,
          locked,
        });

        if (!nodes.has(target)) {
          const crossRegion = regionOnly && targetRegion !== regionId;
          if (crossRegion) {
            nodes.set(target, {
              id: target,
              label: shortLabel(target),
              current: false,
              explored: explored.has(target),
              hidden: false,
              locked,
            });
            // 不跨区扩展
          } else {
            queue.push({ id: target, dist: dist + 1, anonymous: false });
          }
        } else if (locked && nodes.get(target)) {
          nodes.get(target).locked = nodes.get(target).locked || locked;
        }
      }
    }

    // 中心房间节点保证存在
    if (!nodes.has(centerRoomId)) {
      nodes.set(centerRoomId, {
        id: centerRoomId,
        label: centerRoom.name || shortLabel(centerRoomId),
        current: true,
        explored: explored.has(centerRoomId),
        hidden: false,
        locked: false,
      });
    }

    return {
      centerRoomId,
      regionId,
      nodes: [...nodes.values()],
      edges: [...edges.values()],
    };
  }

  setWaypoint(roomId) {
    const id = String(roomId || '');
    if (!id) return { ok: false, reason: 'empty' };
    const explored = this._exploredSet();
    if (!explored.has(id)) {
      return { ok: false, reason: 'unexplored' };
    }
    if (!this._locations()[id]) {
      return { ok: false, reason: 'unknown' };
    }
    this._state().mapWaypoint = id;
    this.game.markDirty?.();
    return { ok: true, roomId: id };
  }

  getWaypoint() {
    const wp = this._state().mapWaypoint;
    return wp == null || wp === '' ? null : String(wp);
  }

  clearWaypoint() {
    this._state().mapWaypoint = null;
    this.game.markDirty?.();
    return true;
  }

  /** @private */
  _visibleRoutes(roomId) {
    return this._routesForGraph(roomId).filter((r) => r.state !== 'hidden' && r.state !== 'sensed');
  }

  /**
   * 复用 RouteService 真值；无 RouteService 时退回 connections + entry_condition。
   * @private
   */
  _routesForGraph(roomId) {
    const routesSvc = this.game.routes;
    if (routesSvc && typeof routesSvc.getRoutes === 'function') {
      return routesSvc.getRoutes(roomId).map((route) => ({
        id: route.id,
        direction: route.direction,
        target: route.target,
        state: route.state,
        locked: route.state === 'revealedLocked',
      }));
    }

    const room = this._locations()[roomId];
    if (!room?.connections) return [];
    return Object.entries(room.connections).map(([direction, target]) => {
      const access = getEntryAccess(this.game, target);
      let state = 'known';
      if (!access.visible) state = 'hidden';
      else if (!access.allowed) state = 'revealedLocked';
      return {
        id: `${roomId}::${direction}`,
        direction,
        target,
        state,
        locked: state === 'revealedLocked',
      };
    });
  }
}

export default MapService;
