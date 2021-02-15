import React from 'react'
import {Path} from '@sanity/types'
import {EMPTY_ARRAY} from './constants'

interface ChangeIndicatorContextValue {
  value?: any
  compareValue?: any
  focusPath: Path
  path: Path
  fullPath: Path
}

export interface ConnectorContextValue {
  isReviewChangesOpen: boolean
  onOpenReviewChanges: () => void
  onSetFocus: (nextPath: Path) => void
}

export const ConnectorContext: React.Context<ConnectorContextValue> = React.createContext({
  isReviewChangesOpen: false as boolean,
  onOpenReviewChanges: () => undefined,
  onSetFocus: (nextPath: Path) => undefined,
})

const initial: ChangeIndicatorContextValue = {
  path: EMPTY_ARRAY,
  fullPath: EMPTY_ARRAY,
  focusPath: EMPTY_ARRAY,
}

export const ChangeIndicatorContext: React.Context<ChangeIndicatorContextValue> = React.createContext(
  initial
)
