import {useLayer} from '@sanity/ui'
import React, {useMemo} from 'react'
import deepCompare from 'react-fast-compare'
import * as PathUtils from '@sanity/util/paths'
import {Path} from '@sanity/types'
import {useReporter} from './tracker'
import {ChangeIndicatorContext} from './ChangeIndicatorContext'
import {ChangeBar} from './ChangeBar'
import {EMPTY_ARRAY} from './constants'

const isPrimitive = (value: unknown): boolean =>
  typeof value === 'string' ||
  typeof value === 'boolean' ||
  typeof value === 'undefined' ||
  typeof value === 'number'

const canCompareShallow = (valueA: unknown, valueB: unknown): boolean => {
  if (
    typeof valueA === 'undefined' ||
    typeof valueB === 'undefined' ||
    valueA === null ||
    valueB === null
  ) {
    return true
  }

  return isPrimitive(valueA) && isPrimitive(valueB)
}

const ChangeBarWrapper = (
  props: React.ComponentProps<'div'> & {
    isChanged: boolean
    hasFocus: boolean
    fullPath: Path
    children: React.ReactNode
  }
) => {
  const {children, className, fullPath, hasFocus, isChanged} = props

  console.log('ChangeBarWrapper: render', fullPath)

  const layer = useLayer()
  const [hasHover, setHover] = React.useState(false)
  const onMouseEnter = React.useCallback(() => setHover(true), [])
  const onMouseLeave = React.useCallback(() => setHover(false), [])
  const ref = React.useRef<HTMLDivElement | null>(null)

  useReporter(
    `field-${PathUtils.toString(fullPath)}`,
    () => ({
      element: ref.current!,
      path: PathUtils.pathFor(fullPath),
      isChanged: isChanged,
      hasFocus: hasFocus,
      hasHover: hasHover,
      zIndex: layer.zIndex,
    }),
    // note: deepCompare should be ok here since we're not comparing deep values
    deepCompare
  )

  const node = useMemo(
    () => (
      <div ref={ref} className={className} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <ChangeBar fullPath={fullPath} hasFocus={hasFocus} isChanged={isChanged}>
          {children}
        </ChangeBar>
      </div>
    ),
    [children, className, hasFocus, isChanged, onMouseEnter, onMouseLeave]
  )

  return node
}

export function ChangeIndicatorScope(props: {path: Path; children?: React.ReactNode}) {
  console.log('ChangeIndicatorScope: render')

  const {children, path} = props
  const parentContext = React.useContext(ChangeIndicatorContext)
  const focusPath = parentContext.focusPath
  const value = PathUtils.get(parentContext.value, PathUtils.pathFor(path))
  const compareValue = PathUtils.get(parentContext.compareValue, PathUtils.pathFor(path))

  const node = useMemo(() => {
    return (
      <ChangeIndicatorProvider
        path={PathUtils.pathFor(path)}
        focusPath={focusPath}
        value={value}
        compareValue={compareValue}
      >
        {children}
      </ChangeIndicatorProvider>
    )
  }, [children, compareValue, focusPath, path, value])

  return node
}

export function ChangeIndicatorProvider(props: {
  path: Path
  focusPath: Path
  value: any
  compareValue: any
  children: React.ReactNode
}) {
  console.log('ChangeIndicatorProvider: render')

  const {compareValue, value} = props
  const parentContext = React.useContext(ChangeIndicatorContext)
  const path = PathUtils.pathFor(props.path)
  const focusPath = PathUtils.pathFor(props.focusPath || [])
  const parentFullPath = parentContext.fullPath
  const fullPath = React.useMemo(() => PathUtils.pathFor(parentFullPath.concat(path)), [
    parentFullPath,
    path,
  ])

  const contextValue = React.useMemo(() => {
    return {
      value,
      compareValue,
      focusPath,
      path,
      fullPath,
    }
  }, [fullPath, value, compareValue, focusPath, path])

  return (
    <ChangeIndicatorContext.Provider value={contextValue}>
      {props.children}
    </ChangeIndicatorContext.Provider>
  )
}

interface CoreProps {
  className?: string
  hidden?: boolean
  fullPath: Path
  compareDeep: boolean
  value: unknown
  hasFocus: boolean
  compareValue: unknown
  children?: React.ReactNode
}

export const CoreChangeIndicator = ({
  className,
  hidden,
  fullPath,
  value,
  compareValue,
  hasFocus,
  compareDeep,
  children,
}: CoreProps) => {
  console.log('CoreChangeIndicator: render')

  // todo: lazy compare debounced (possibly with intersection observer)
  const isChanged =
    (canCompareShallow(value, compareValue) && value !== compareValue) ||
    (compareDeep && !deepCompare(value, compareValue))

  if (hidden) {
    return <>{children}</>
  }

  return (
    <ChangeBarWrapper
      className={className}
      isChanged={isChanged}
      fullPath={PathUtils.pathFor(fullPath)}
      hasFocus={hasFocus}
    >
      {children}
    </ChangeBarWrapper>
  )
}

export const ChangeIndicatorWithProvidedFullPath = ({
  className,
  hidden,
  path,
  value,
  hasFocus,
  compareDeep,
  children,
}: any) => {
  console.log('ChangeIndicatorWithProvidedFullPath: render')

  const parentContext = React.useContext(ChangeIndicatorContext)

  const canonicalPath = PathUtils.pathFor(path)

  const fullPath = React.useMemo(
    () => PathUtils.pathFor(parentContext.fullPath.concat(canonicalPath)),
    [parentContext.fullPath, canonicalPath]
  )

  return (
    <CoreChangeIndicator
      hidden={hidden}
      className={className}
      value={value}
      compareValue={PathUtils.get(parentContext.compareValue, canonicalPath)}
      hasFocus={hasFocus}
      fullPath={fullPath}
      compareDeep={compareDeep}
    >
      {children}
    </CoreChangeIndicator>
  )
}

export interface ChangeIndicatorContextProvidedProps {
  className?: string
  compareDeep?: boolean
  children?: React.ReactNode
  disabled?: boolean
}

export const ChangeIndicatorCompareValueProvider = (props: {
  value: any
  compareValue: any
  children: React.ReactNode
}) => {
  const parentContext = React.useContext(ChangeIndicatorContext)

  console.log('ChangeIndicatorCompareValueProvider: render', parentContext.path)

  const contextValue = React.useMemo(() => {
    return {
      value: props.value,
      compareValue: props.compareValue,
      focusPath: PathUtils.pathFor(parentContext.focusPath || EMPTY_ARRAY),
      path: parentContext.path,
      fullPath: parentContext.fullPath,
    }
  }, [
    parentContext.focusPath,
    parentContext.path,
    parentContext.fullPath,
    props.value,
    props.compareValue,
  ])

  return (
    <ChangeIndicatorContext.Provider value={contextValue}>
      {props.children}
    </ChangeIndicatorContext.Provider>
  )
}

export const ContextProvidedChangeIndicator = (props: ChangeIndicatorContextProvidedProps) => {
  console.log('ContextProvidedChangeIndicator: render')

  const {children, className, compareDeep, disabled} = props
  const context = React.useContext(ChangeIndicatorContext)
  const {value, compareValue, path, focusPath, fullPath} = context

  if (disabled) {
    return <>{children}</>
  }

  return (
    <CoreChangeIndicator
      fullPath={PathUtils.pathFor(fullPath)}
      value={value}
      compareValue={compareValue}
      hasFocus={PathUtils.hasFocus(focusPath, path)}
      compareDeep={compareDeep || false}
      className={className}
    >
      {children}
    </CoreChangeIndicator>
  )
}

export const ChangeIndicator = ContextProvidedChangeIndicator
