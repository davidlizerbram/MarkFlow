import { differenceInDays, parseISO, format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

/**
 * Get the urgency level based on days remaining
 */
function getUrgencyLevel(dueDate, status) {
  if (status === 'completed') return 'completed'

  const today = new Date()
  const deadline = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate
  const daysRemaining = differenceInDays(deadline, today)

  if (daysRemaining < 0) return 'overdue'
  if (daysRemaining <= 7) return 'urgent'
  if (daysRemaining <= 30) return 'warning'
  return 'normal'
}

/**
 * Get display configuration for urgency level
 */
function getUrgencyConfig(level) {
  switch (level) {
    case 'overdue':
      return {
        variant: 'urgent',
        className: 'bg-red-600 text-white animate-pulse',
        label: 'OVERDUE',
      }
    case 'urgent':
      return {
        variant: 'urgent',
        className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        label: null,
      }
    case 'warning':
      return {
        variant: 'warning',
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        label: null,
      }
    case 'completed':
      return {
        variant: 'secondary',
        className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 line-through',
        label: null,
      }
    default:
      return {
        variant: 'success',
        className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        label: null,
      }
  }
}

export function DeadlineHeatmap({ dueDate, status = 'open', showDaysRemaining = true }) {
  const deadline = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate
  const today = new Date()
  const daysRemaining = differenceInDays(deadline, today)
  const urgency = getUrgencyLevel(dueDate, status)
  const config = getUrgencyConfig(urgency)

  const formatDeadline = () => {
    if (status === 'completed') {
      return format(deadline, 'MMM d, yyyy')
    }

    if (daysRemaining < 0) {
      return `${Math.abs(daysRemaining)}d overdue`
    }

    if (daysRemaining === 0) {
      return 'Due TODAY'
    }

    if (daysRemaining === 1) {
      return 'Tomorrow'
    }

    if (daysRemaining <= 7) {
      return `${daysRemaining}d remaining`
    }

    return format(deadline, 'MMM d, yyyy')
  }

  return (
    <div className="flex items-center gap-2">
      <Badge className={cn('font-medium', config.className)}>
        {formatDeadline()}
      </Badge>
      {config.label && (
        <span className="text-xs font-bold text-red-600">{config.label}</span>
      )}
    </div>
  )
}

/**
 * Compact deadline indicator for tables
 */
export function DeadlineIndicator({ dueDate, status = 'open' }) {
  const deadline = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate
  const today = new Date()
  const daysRemaining = differenceInDays(deadline, today)
  const urgency = getUrgencyLevel(dueDate, status)

  const getIndicatorColor = () => {
    switch (urgency) {
      case 'overdue':
        return 'bg-red-600 animate-pulse'
      case 'urgent':
        return 'bg-red-500'
      case 'warning':
        return 'bg-amber-500'
      case 'completed':
        return 'bg-slate-400'
      default:
        return 'bg-green-500'
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className={cn('h-2 w-2 rounded-full', getIndicatorColor())} />
      <span
        className={cn(
          'text-sm',
          status === 'completed' && 'text-muted-foreground line-through'
        )}
      >
        {format(deadline, 'MMM d')}
      </span>
      {status !== 'completed' && daysRemaining <= 30 && (
        <span
          className={cn(
            'text-xs',
            urgency === 'urgent' || urgency === 'overdue'
              ? 'text-red-600 font-medium'
              : 'text-muted-foreground'
          )}
        >
          ({daysRemaining < 0 ? `${Math.abs(daysRemaining)}d late` : `${daysRemaining}d`})
        </span>
      )}
    </div>
  )
}
