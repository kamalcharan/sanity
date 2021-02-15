import React from 'react'
import {Path} from '@sanity/types'
import {ScrollContainer} from 'part:@sanity/components/scroll'
import {Tracker, ConnectorContext} from '../'
import {ENABLED} from '../constants'
import {ConnectorsOverlay} from './ConnectorsOverlay'

interface Props {
  isReviewChangesOpen: boolean
  onOpenReviewChanges: () => void
  onSetFocus: (path: Path) => void
  className?: string
  children: React.ReactNode
}

function EnabledChangeConnectorRoot({
  children,
  className,
  onSetFocus,
  isReviewChangesOpen,
  onOpenReviewChanges,
}: Props) {
  console.log('EnabledChangeConnectorRoot: render')

  // React.useEffect(() => console.log('EnabledChangeConnectorRoot: children changed'), [children])
  // React.useEffect(() => console.log('EnabledChangeConnectorRoot: className changed'), [className])
  // React.useEffect(() => console.log('EnabledChangeConnectorRoot: onSetFocus changed'), [onSetFocus])
  // React.useEffect(() => console.log('EnabledChangeConnectorRoot: isReviewChangesOpen changed'), [
  //   isReviewChangesOpen,
  // ])
  // React.useEffect(() => console.log('EnabledChangeConnectorRoot: onOpenReviewChanges changed'), [
  //   onOpenReviewChanges,
  // ])

  const [rootRef, setRootRef] = React.useState<HTMLDivElement | null>()
  return (
    <ConnectorContext.Provider value={{isReviewChangesOpen, onOpenReviewChanges, onSetFocus}}>
      <Tracker>
        <ScrollContainer ref={setRootRef} className={className}>
          {children}
          {rootRef && <ConnectorsOverlay rootRef={rootRef} onSetFocus={onSetFocus} />}
        </ScrollContainer>
      </Tracker>
    </ConnectorContext.Provider>
  )
}

function DisabledChangeConnectorRoot({children, className}: Props) {
  console.log('DisabledChangeConnectorRoot: render')

  return <ScrollContainer className={className}>{children}</ScrollContainer>
}

export const ChangeConnectorRoot = ENABLED
  ? EnabledChangeConnectorRoot
  : DisabledChangeConnectorRoot
