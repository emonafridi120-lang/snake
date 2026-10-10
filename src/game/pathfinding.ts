import { Point, Direction } from '../types/game';

export const DIRECTIONS: { dir: Direction; dx: number; dy: number }[] = [
  { dir: 'UP', dx: 0, dy: -1 },
  { dir: 'DOWN', dx: 0, dy: 1 },
  { dir: 'LEFT', dx: -1, dy: 0 },
  { dir: 'RIGHT', dx: 1, dy: 0 },
];

export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

function pointToKey(p: Point): string {
  return `${p.x},${p.y}`;
}

export function isInsideGrid(p: Point, cols: number, rows: number): boolean {
  return p.x >= 0 && p.x < cols && p.y >= 0 && p.y < rows;
}

export function isOccupied(p: Point, snake: Point[], excludeTail: boolean = false): boolean {
  const checkBody = excludeTail ? snake.slice(0, -1) : snake;
  return checkBody.some((seg) => seg.x === p.x && seg.y === p.y);
}

export function getDirectionTo(from: Point, to: Point): Direction {
  if (to.x > from.x) return 'RIGHT';
  if (to.x < from.x) return 'LEFT';
  if (to.y > from.y) return 'DOWN';
  return 'UP';
}

/**
 * Calculates open reachable space from a starting point (Flood Fill)
 */
export function calculateReachableArea(
  start: Point,
  snake: Point[],
  cols: number,
  rows: number
): number {
  const queue: Point[] = [start];
  const visited = new Set<string>();
  visited.add(pointToKey(start));

  let count = 0;

  while (queue.length > 0) {
    const current = queue.shift()!;
    count++;

    for (const d of DIRECTIONS) {
      const neighbor: Point = { x: current.x + d.dx, y: current.y + d.dy };
      if (!isInsideGrid(neighbor, cols, rows)) continue;
      if (isOccupied(neighbor, snake, false)) continue;

      const key = pointToKey(neighbor);
      if (!visited.has(key)) {
        visited.add(key);
        queue.push(neighbor);
      }
    }
  }

  return count;
}

/**
 * Human-like Pathfinding (A* with Turn Penalty and Direction Momentum)
 * Unlike robotic BFS that creates zig-zag staircases, human players:
 * 1. Hold straight lines (momentum / inertia)
 * 2. Prefer clean L-turns or U-turns around obstacles
 * 3. Minimize unnecessary rapid turns
 */
interface NodeState {
  point: Point;
  dir: Direction;
  cost: number;
  heuristic: number;
  total: number;
  parent: NodeState | null;
}

export function findHumanLikePath(
  start: Point,
  target: Point,
  currentDir: Direction,
  snake: Point[],
  cols: number,
  rows: number,
  excludeTail: boolean = false
): Point[] | null {
  if (start.x === target.x && start.y === target.y) return [];

  const openList: NodeState[] = [];
  const closedSet = new Map<string, number>();

  const startHeuristic = Math.abs(start.x - target.x) + Math.abs(start.y - target.y);
  openList.push({
    point: start,
    dir: currentDir,
    cost: 0,
    heuristic: startHeuristic,
    total: startHeuristic,
    parent: null,
  });

  while (openList.length > 0) {
    // Pick lowest total cost node
    openList.sort((a, b) => a.total - b.total);
    const current = openList.shift()!;

    if (current.point.x === target.x && current.point.y === target.y) {
      // Reconstruct path
      const path: Point[] = [];
      let curr: NodeState | null = current;
      while (curr && curr.parent) {
        path.unshift(curr.point);
        curr = curr.parent;
      }
      return path;
    }

    const stateKey = `${current.point.x},${current.point.y},${current.dir}`;
    if (closedSet.has(stateKey) && closedSet.get(stateKey)! <= current.cost) {
      continue;
    }
    closedSet.set(stateKey, current.cost);

    for (const d of DIRECTIONS) {
      // Humans never reverse into their own throat
      if (d.dir === OPPOSITE_DIRECTIONS[current.dir]) continue;

      const neighbor: Point = {
        x: current.point.x + d.dx,
        y: current.point.y + d.dy,
      };

      if (!isInsideGrid(neighbor, cols, rows)) continue;

      const isTarget = neighbor.x === target.x && neighbor.y === target.y;
      if (!isTarget && isOccupied(neighbor, snake, excludeTail)) continue;

      // Human Cost Modeling:
      // - Step cost = 10
      // - Turning cost = 22 (Penalizes zig-zag staircases! Encourages straight driving)
      // - Continuing in currentDir = 0 turn penalty
      // - Distance to wall margin (humans avoid hugging walls unless apple is there)
      let stepCost = 10;
      if (d.dir !== current.dir) {
        stepCost += 22; // High turn penalty eliminates robotic staircases
      }

      // If heading directly away from target when open space is available, slight penalty
      const distToTarget = Math.abs(neighbor.x - target.x) + Math.abs(neighbor.y - target.y);
      const prevDist = Math.abs(current.point.x - target.x) + Math.abs(current.point.y - target.y);
      if (distToTarget > prevDist) {
        stepCost += 4;
      }

      const newCost = current.cost + stepCost;
      const heuristic = distToTarget * 10;
      const total = newCost + heuristic;

      const neighborKey = `${neighbor.x},${neighbor.y},${d.dir}`;
      if (closedSet.has(neighborKey) && closedSet.get(neighborKey)! <= newCost) {
        continue;
      }

      openList.push({
        point: neighbor,
        dir: d.dir,
        cost: newCost,
        heuristic,
        total,
        parent: current,
      });
    }
  }

  return null;
}

/**
 * Standard shortest path for virtual tail-safety validation
 */
export function findShortestPath(
  start: Point,
  target: Point,
  snake: Point[],
  cols: number,
  rows: number,
  excludeTail: boolean = false
): Point[] | null {
  if (start.x === target.x && start.y === target.y) return [];

  const queue: Point[] = [start];
  const visited = new Set<string>();
  visited.add(pointToKey(start));
  const parentMap = new Map<string, Point>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.x === target.x && current.y === target.y) {
      const path: Point[] = [];
      let curr = current;
      while (!(curr.x === start.x && curr.y === start.y)) {
        path.unshift(curr);
        const parent = parentMap.get(pointToKey(curr));
        if (!parent) break;
        curr = parent;
      }
      return path;
    }

    for (const d of DIRECTIONS) {
      const neighbor: Point = { x: current.x + d.dx, y: current.y + d.dy };
      if (!isInsideGrid(neighbor, cols, rows)) continue;
      const isTarget = neighbor.x === target.x && neighbor.y === target.y;
      if (!isTarget && isOccupied(neighbor, snake, excludeTail)) continue;

      const key = pointToKey(neighbor);
      if (!visited.has(key)) {
        visited.add(key);
        parentMap.set(key, current);
        queue.push(neighbor);
      }
    }
  }

  return null;
}

/**
 * Human-like Snake AI:
 * Plays with natural human habits, lane alignment, momentum, and clean corner turns,
 * feeling like an expert human gamer rather than a robotic path solver.
 */
export function getSmartNextMove(
  snake: Point[],
  food: Point,
  currentDirection: Direction,
  cols: number,
  rows: number
): Direction {
  const head = snake[0];
  const tail = snake[snake.length - 1];

  // 1. Human Lane Alignment check (only for early game or open boards to avoid premature traps)
  const dxToFood = food.x - head.x;
  const dyToFood = food.y - head.y;

  const isHeadingTowardsFood =
    (currentDirection === 'RIGHT' && dxToFood > 0 && dyToFood === 0) ||
    (currentDirection === 'LEFT' && dxToFood < 0 && dyToFood === 0) ||
    (currentDirection === 'DOWN' && dyToFood > 0 && dxToFood === 0) ||
    (currentDirection === 'UP' && dyToFood < 0 && dxToFood === 0);

  if (isHeadingTowardsFood && snake.length < 25) {
    const curD = DIRECTIONS.find((d) => d.dir === currentDirection)!;
    const straightPoint = { x: head.x + curD.dx, y: head.y + curD.dy };
    if (isInsideGrid(straightPoint, cols, rows) && !isOccupied(straightPoint, snake, false)) {
      return currentDirection;
    }
  }

  // 2. Find clean human-like path (low-turn, momentum-favored)
  const humanPath = findHumanLikePath(
    head,
    food,
    currentDirection,
    snake,
    cols,
    rows,
    false
  );

  if (humanPath && humanPath.length > 0) {
    // Virtual simulation check: does eating this food leave an escape hatch to our tail?
    const virtualSnake: Point[] = [
      ...humanPath.slice().reverse(),
      ...snake.slice(0, Math.max(1, snake.length - humanPath.length + 1)),
    ];
    const virtualHead = virtualSnake[0];
    const virtualTail = virtualSnake[virtualSnake.length - 1];

    const canReachTail = findShortestPath(virtualHead, virtualTail, virtualSnake, cols, rows, true);

    if (canReachTail !== null) {
      // Space-partitioning safety check for 100-150+ score runs:
      // Check that virtual head has enough open connected cells to not suffocate
      const virtualReachable = calculateReachableArea(virtualHead, virtualSnake, cols, rows);
      const isRoomSafe = snake.length < 35 || virtualReachable >= Math.min(cols * rows * 0.35, snake.length + 3);

      if (isRoomSafe) {
        const nextCell = humanPath[0];
        const nextDir = getDirectionTo(head, nextCell);
        if (nextDir !== OPPOSITE_DIRECTIONS[currentDirection]) {
          return nextDir;
        }
      }
    }
  }

  // 3. Fallback: Pro Tail-Following / Space-Clearing Survival
  // When path to food is unsafe, follow the tail (the tail moves forward every step, opening space!)
  const validMoves: { dir: Direction; point: Point; score: number }[] = [];

  for (const d of DIRECTIONS) {
    if (d.dir === OPPOSITE_DIRECTIONS[currentDirection]) continue;

    const nextPoint: Point = { x: head.x + d.dx, y: head.y + d.dy };
    if (!isInsideGrid(nextPoint, cols, rows)) continue;
    if (isOccupied(nextPoint, snake, true)) continue;

    const area = calculateReachableArea(nextPoint, snake, cols, rows);
    const distToTail = Math.abs(nextPoint.x - tail.x) + Math.abs(nextPoint.y - tail.y);
    const distToFood = Math.abs(nextPoint.x - food.x) + Math.abs(nextPoint.y - food.y);

    // Can this nextPoint reach the tail?
    const canReachTail = findShortestPath(nextPoint, tail, snake, cols, rows, true) !== null;

    // Scorer:
    // - Must be able to reach tail (survival guarantee)
    // - Maximizes open area (flood-fill)
    // - Slight momentum preference
    let score = area * 15;
    if (canReachTail) score += 200;
    if (d.dir === currentDirection) score += 12;

    // In crowded situations (snake length > 60), avoid getting too close to tail prematurely
    // (longest path heuristic preserves maximum open space)
    if (snake.length > 50) {
      score += distToTail * 2;
    } else {
      score -= distToTail * 1.5;
    }

    validMoves.push({ dir: d.dir, point: nextPoint, score });
  }

  if (validMoves.length > 0) {
    validMoves.sort((a, b) => b.score - a.score);
    return validMoves[0].dir;
  }

  // 4. Emergency dodge: pick any open cell
  for (const d of DIRECTIONS) {
    if (d.dir === OPPOSITE_DIRECTIONS[currentDirection]) continue;
    const nextPoint: Point = { x: head.x + d.dx, y: head.y + d.dy };
    if (isInsideGrid(nextPoint, cols, rows) && !isOccupied(nextPoint, snake, false)) {
      return d.dir;
    }
  }

  return currentDirection;
}

/**
 * Detects if a move was a close call / near miss
 */
export function isNearMiss(
  head: Point,
  prevDirection: Direction,
  newDirection: Direction,
  snake: Point[],
  cols: number,
  rows: number
): boolean {
  if (prevDirection === newDirection) return false;

  let wouldHitWall = false;
  if (prevDirection === 'UP' && head.y <= 0) wouldHitWall = true;
  if (prevDirection === 'DOWN' && head.y >= rows - 1) wouldHitWall = true;
  if (prevDirection === 'LEFT' && head.x <= 0) wouldHitWall = true;
  if (prevDirection === 'RIGHT' && head.x >= cols - 1) wouldHitWall = true;

  if (wouldHitWall) return true;

  const forwardD = DIRECTIONS.find((d) => d.dir === prevDirection);
  if (forwardD) {
    const forwardPoint: Point = { x: head.x + forwardD.dx, y: head.y + forwardD.dy };
    if (isOccupied(forwardPoint, snake, false)) {
      return true;
    }
  }

  return false;
}
