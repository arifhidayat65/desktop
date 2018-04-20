import * as React from 'react'

export type SelectionDirection = 'up' | 'down'

interface ISelectRowAction {
  /**
   * The vertical direction use when searching for a selectable row.
   */
  readonly direction: SelectionDirection

  /**
   * The starting row index to search from.
   */
  readonly row: number

  /**
   * A flag to indicate or not to look beyond the last or first
   * row (depending on direction) such that given the last row and
   * a downward direction will consider the first row as a
   * candidate or given the first row and an upward direction
   * will consider the last row as a candidate.
   *
   * Defaults to true if not set.
   */
  readonly wrap?: boolean
}

/**
 * Interface describing a user initiated selection change event
 * originating from a pointer device clicking or pressing on an item.
 */
export interface IMouseClickSource {
  readonly kind: 'mouseclick'
  readonly event: React.MouseEvent<any>
}

/**
 * Interface describing a user initiated selection change event
 * originating from a pointer device hovering over an item.
 * Only applicable when selectedOnHover is set.
 */
export interface IHoverSource {
  readonly kind: 'hover'
  readonly event: React.MouseEvent<any>
}

/**
 * Interface describing a user initiated selection change event
 * originating from a keyboard
 */
export interface IKeyboardSource {
  readonly kind: 'keyboard'
  readonly event: React.KeyboardEvent<any>
}

/** A type union of possible sources of a selection changed event */
export type SelectionSource = IMouseClickSource | IHoverSource | IKeyboardSource

/**
 * Determine the next selectable row, given the direction and a starting
 * row index. Whether a row is selectable or not is determined using
 * the `canSelectRow` function, which defaults to true if not provided.
 *
 * Returns null if no row can be selected or if the only selectable row is
 * identical to the given row parameter.
 */
export function findNextSelectableRow(
  rowCount: number,
  action: ISelectRowAction,
  canSelectRow: (row: number) => boolean = row => true
): number | null {
  if (rowCount === 0) {
    return null
  }

  const { direction, row } = action
  const wrap = action.wrap === undefined ? true : action.wrap

  // Ensure the row value is in the range between 0 and rowCount - 1
  //
  // If the row falls outside this range, use the direction
  // given to choose a suitable value:
  //
  //  - move in an upward direction -> select last row
  //  - move in a downward direction -> select first row
  //
  let currentRow =
    row < 0 || row >= rowCount ? (direction === 'up' ? rowCount - 1 : 0) : row

  const delta = direction === 'up' ? -1 : 1

  // Iterate through all rows (starting offset from the
  // given row and ending on and including the given row)
  for (let i = 0; i < rowCount; i++) {
    currentRow += delta

    if (currentRow >= rowCount) {
      // We've hit rock bottom, wrap around to the top
      // if we're allowed to or give up.
      if (wrap) {
        currentRow = 0
      } else {
        break
      }
    } else if (currentRow < 0) {
      // We've reached the top, wrap around to the bottom
      // if we're allowed to or give up
      if (wrap) {
        currentRow = rowCount - 1
      } else {
        break
      }
    }

    if (row !== currentRow && canSelectRow(currentRow)) {
      return currentRow
    }
  }

  return null
}
