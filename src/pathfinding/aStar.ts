/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { FastMap } from "../utils/fastMap";
import {
  expandVector,
  FlatGridVector,
  flattenVector,
} from "../utils/flatGridVector";
import { MinPriorityQueue } from "../utils/priorityQueue";

function reconstructPath(
  cameFrom: FastMap<FlatGridVector, FlatGridVector>,
  current: FlatGridVector,
): Vector[] {
  const fullPath = [expandVector(current)];
  while (cameFrom.has(current)) {
    current = cameFrom.get(current)!;
    fullPath.push(expandVector(current));
  }

  return fullPath;
}

/**
 * A* Pathfinder
 *
 * @param startVec starting position on the grid.
 * @param goalVec ending position on the grid.
 * @param heuristic `heuristic(current, goal)` estimates the distance between current and goal.
 * @param getNeighbors function which returns all valid neighbors of a specified position.
 * @param epsilon static weighting factor-must be >1, higher values trade accuracy for speed.
 */
export function findAStarPath(
  startVec: Vector,
  goalVec: Vector,
  heuristic: (current: Vector, goal: Vector) => number,
  getNeighbors: (
    current: FlatGridVector,
    goal: FlatGridVector,
    path: Vector[],
  ) => FlatGridVector[],
  epsilon = 1,
): Vector[] | false {
  const start = flattenVector(startVec);
  const goal = flattenVector(goalVec);
  // Isaac.DebugString(`\tPathing initiated from (${start}) to (${goal}).`);

  // The set of discovered nodes that may need to be (re-)expanded.
  // Initially, only the start node is known.
  // This is usually implemented as a min-heap or priority queue rather than a hash-set.
  const openSet = new MinPriorityQueue<FlatGridVector>();

  // For node n, cameFrom[n] is the node immediately preceding it on the cheapest path from start
  // to n currently known.
  const cameFrom = new FastMap<FlatGridVector, FlatGridVector>();

  // For node n, gScore[n] is the cost of the cheapest path from start to n currently known.
  const gScore = new FastMap<FlatGridVector, number>();
  gScore.set(start, 0);

  // For node n, fScore[n] := gScore[n] + h(n). fScore[n] represents our current best guess as to
  // how short a path from start to finish can be if it goes through n.
  const fScore = new FastMap<FlatGridVector, number>();
  fScore.set(start, epsilon * heuristic(startVec, goalVec));
  openSet.insert(start, fScore.get(start)!);

  while (!openSet.isEmpty()) {
    // This operation can occur in O(1) time if openSet is a min-heap or a priority queue
    const current = openSet.pop()!;
    if (current === goal) {
      // Isaac.DebugString("\tPath to goal found.");
      return reconstructPath(cameFrom, current);
    }
    const currentVec = expandVector(current);

    const currentGScore = gScore.get(current)!;
    for (const neighbor of getNeighbors(
      current,
      goal,
      reconstructPath(cameFrom, current),
    )) {
      const expandedNeighbor = expandVector(neighbor);

      // neighborGScore is the distance from start to the neighbor through current
      const neighborGScore =
        currentGScore + heuristic(currentVec, expandedNeighbor);
      if (!gScore.has(neighbor) || neighborGScore < gScore.get(neighbor)!) {
        // This path to neighbor is better than any previous one. Record it!
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, neighborGScore);

        const neighborFScore =
          neighborGScore + epsilon * heuristic(expandedNeighbor, goalVec);
        fScore.set(neighbor, neighborFScore);
        if (!openSet.has(neighbor)) {
          openSet.insert(neighbor, neighborFScore);
        }
      }
    }
  }

  // Open set is empty but goal was never reached
  // Isaac.DebugString("\tNo path to goal found.");
  return false;
}

// Distance functions, provided for convenience
export function manhattanDist(current: Vector, goal: Vector): number {
  return Math.abs(current.X - goal.X) + Math.abs(current.Y - goal.Y);
}
export function chebyshevDist(current: Vector, goal: Vector): number {
  return Math.max(Math.abs(current.X - goal.X), Math.abs(current.Y - goal.Y));
}
export function euclideanDistSq(current: Vector, goal: Vector): number {
  return current.DistanceSquared(goal);
}
export function euclideanDist(current: Vector, goal: Vector): number {
  return current.Distance(goal);
}
