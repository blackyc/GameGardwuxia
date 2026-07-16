import { getEntryAccess, meetsEntryPrerequisite } from './entry_condition.js';

const ANCHOR_BY_DIRECTION = Object.freeze({
  北: 'N', north: 'N', 南: 'S', south: 'S', 东: 'E', east: 'E', 西: 'W', west: 'W',
  东北: 'NE', northeast: 'NE', 西北: 'NW', northwest: 'NW', 东南: 'SE', southeast: 'SE',
  西南: 'SW', southwest: 'SW', 上: 'ABOVE', up: 'ABOVE', 下: 'BELOW', down: 'BELOW',
  入: 'DEEP', in: 'DEEP', 深: 'DEEP', 出: 'BACK', out: 'BACK', 回: 'BACK', back: 'BACK'
});

const FALLBACK_DIRECTIONS = new Set(['回', 'back']);

function shortRoomName(roomId) {
  return String(roomId || '').split('·').pop() || '未知去处';
}

function routeLayout(layout, direction, slot) {
  return {
    anchor: layout?.anchor || ANCHOR_BY_DIRECTION[direction] || 'AUTO',
    lane: Number(layout?.lane || 0),
    slot
  };
}

/** Keeps route discovery separate from room-entry authority. */
export class RouteService {
  constructor(game) {
    this.game = game;
  }

  _discoveries() {
    if (!this.game.state.routeDiscoveries || typeof this.game.state.routeDiscoveries !== 'object') {
      this.game.state.routeDiscoveries = {};
    }
    return this.game.state.routeDiscoveries;
  }

  _routeId(roomId, direction, metadata) {
    return metadata?.id || `${roomId}::${direction}`;
  }

  /** Resolve the spatial layer without requiring every legacy room to be rewritten. */
  getRoomLayer(roomId = this.game.state.location) {
    const room = this.game.LOCATIONS?.[roomId];
    if (!room) return 'world';
    if (room.spaceLayer) return room.spaceLayer;
    if (room.zoneKind === 'dungeon') return 'dungeon';

    const pending = [roomId];
    const visited = new Set();
    while (pending.length > 0) {
      const targetRoomId = pending.shift();
      if (visited.has(targetRoomId)) continue;
      visited.add(targetRoomId);
      for (const [sourceId, source] of Object.entries(this.game.LOCATIONS || {})) {
        for (const [direction, target] of Object.entries(source?.connections || {})) {
          if (target !== targetRoomId) continue;
          const kind = source.routeSketch?.[direction]?.kind;
          if (kind === 'dungeon' || kind === 'interior') return kind;
          if (kind === 'maze' && !visited.has(sourceId)) pending.push(sourceId);
        }
      }
    }
    return roomId.startsWith('问剑峰·') ? 'faction' : 'world';
  }

  _rawRoutes(roomId = this.game.state.location) {
    const room = this.game.LOCATIONS?.[roomId];
    if (!room?.connections) return [];

    const routes = Object.entries(room.connections)
      .filter(([, target]) => Boolean(this.game.LOCATIONS?.[target]))
      .map(([direction, target], slot) => {
        const isWenjianfengMaze = roomId.startsWith('问剑峰·竹林深处');
        const mazeFallback = isWenjianfengMaze
          ? {
              label: String(target).replace(/^问剑峰·竹林深处·/, ''),
              kind: 'maze',
              layout: { anchor: ANCHOR_BY_DIRECTION[direction] || 'AUTO', lane: slot }
            }
          : {};
        const metadata = { ...mazeFallback, ...(room.routeSketch?.[direction] || {}) };
        return {
          id: this._routeId(roomId, direction, metadata),
          sourceRoomId: roomId,
          direction,
          target,
          label: metadata.label || shortRoomName(target),
          kind: metadata.kind || 'world',
          layout: routeLayout(metadata.layout, direction, slot),
          discovery: metadata.discovery || null
        };
      });

    // A room is one spatial destination even if legacy integration produced
    // both a semantic direction and a synthetic “回” edge to that room.
    const byTarget = new Map();
    routes.forEach((route) => {
      const existing = byTarget.get(route.target);
      if (!existing || (FALLBACK_DIRECTIONS.has(existing.direction) && !FALLBACK_DIRECTIONS.has(route.direction))) {
        byTarget.set(route.target, route);
      }
    });
    return [...byTarget.values()].map((route, slot) => ({
      ...route,
      layout: { ...route.layout, slot }
    }));
  }

  getRoutes(roomId = this.game.state.location) {
    const discoveries = this._discoveries();
    return this._rawRoutes(roomId).map((route) => {
      const access = getEntryAccess(this.game, route.target);
      const discoveryState = discoveries[route.id];
      let state;

      if (route.discovery) {
        state = discoveryState === 'revealed'
          ? (access.allowed ? 'revealed' : 'revealedLocked')
          : (discoveryState === 'sensed' ? 'sensed' : 'hidden');
      } else if (access.visible && access.allowed) {
        state = 'known';
      } else if (access.visible) {
        state = 'revealedLocked';
      } else {
        state = 'hidden';
      }

      return {
        ...route,
        state,
        visible: ['known', 'revealed', 'revealedLocked'].includes(state),
        clickable: ['known', 'revealed'].includes(state) && access.allowed,
        blockedReason: access.message || '',
        hint: route.discovery?.hint || '',
        revealLabel: route.discovery?.revealLabel || '循迹细察'
      };
    });
  }

  getRouteAccess(direction, roomId = this.game.state.location) {
    const route = this.getRoutes(roomId).find((item) => item.direction === direction);
    if (!route) return null;
    if (route.state === 'hidden' || route.state === 'sensed') {
      return {
        visible: false,
        allowed: false,
        message: route.discovery?.hiddenMessage || '你尚未察觉到那里有路。',
        successMessage: ''
      };
    }
    return getEntryAccess(this.game, route.target);
  }

  senseCurrentRoom() {
    const discoveries = this._discoveries();
    const hints = [];
    let changed = false;
    this._rawRoutes().forEach((route) => {
      if (!route.discovery || discoveries[route.id]) return;
      if (route.discovery.hintPrereq && !meetsEntryPrerequisite(this.game, route.discovery.hintPrereq)) return;
      discoveries[route.id] = 'sensed';
      changed = true;
      hints.push(route);
    });
    if (changed) this.game.markDirty();
    return hints;
  }

  getPerceptionClues(roomId = this.game.state.location) {
    return this.getRoutes(roomId)
      .filter((route) => route.state === 'sensed')
      .map((route) => ({ id: route.id, hint: route.hint, revealLabel: route.revealLabel }));
  }

  revealRoute(routeId) {
    const route = this._rawRoutes().find((item) => item.id === routeId);
    if (!route?.discovery || this._discoveries()[route.id] !== 'sensed') {
      return { ok: false, message: '这里已经没有新的痕迹可循。' };
    }
    if (route.discovery.revealPrereq && !meetsEntryPrerequisite(this.game, route.discovery.revealPrereq)) {
      return { ok: false, message: route.discovery.revealFailMessage || '你暂时还无法辨清这道痕迹。' };
    }

    this._discoveries()[route.id] = 'revealed';
    this.game.markDirty();
    return {
      ok: true,
      route: this.getRoutes().find((item) => item.id === routeId),
      message: route.discovery.revealMessage || '你发现了一条新的去路。'
    };
  }
}
